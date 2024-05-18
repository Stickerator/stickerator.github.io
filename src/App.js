import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import FileInput from './components/FileInput';
import ImageGrid from './components/ImageGrid';
import ProgressBar from './components/ProgressBar';
import StatusDescription from './components/StatusDescription';
import { removeBackground } from '@imgly/background-removal';
import { Helmet } from 'react-helmet';

import './styles.css';

const TITLE = 'Stickerator';
const TELEGRAM_API_URL = 'https://api.telegram.org/bot';
const STICKER_PACK_URL = 'https://t.me/addstickers/';
const PROGRESS_INTERVAL = 1000; // in milliseconds


function App() {
  const [inputType, setInputType] = useState('file');
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState('');
  const [telegramToken, setTelegramToken] = useState(Cookies.get('telegramToken') || '');
  const [telegramStickerPackName, setTelegramStickerPackName] = useState(Cookies.get('telegramStickerPackName') || '');
  const [telegramUserId, setTelegramUserId] = useState(Cookies.get('telegramUserId') || '');
  const [telegramBotUsername, setTelegramBotUsername] = useState(Cookies.get('telegramBotUsername') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [tooltip, setTooltip] = useState(false);

  useEffect(() => {
    if (telegramToken) {
      setTelegramToken(telegramToken);
      fetchBotUsername();
    }
    if (telegramStickerPackName) {
      setTelegramStickerPackName(telegramStickerPackName);
    }
    if (telegramUserId) {
      setTelegramUserId(telegramUserId);
    }
    if (telegramBotUsername) {
      setTelegramBotUsername(telegramBotUsername);
    }
  }, [telegramToken]);

  const handleInputChange = (e) => {
    setInputType(e.target.value);
  };

  const handleImagesUpload = (newImages) => {
    const imageObjects = newImages.map((file) => ({
      src: URL.createObjectURL(file),
      file: file,
      name: file.name,
      emoji: '😊' // default emoji, you can update this later for each image
    }));
    setImages([...images, ...imageObjects]);
  };

  const handleGenerateClick = async () => {
    if (!telegramToken || !telegramStickerPackName) {
      setStatus('Please provide Telegram API token and sticker pack name.');
      return;
    }

    if (!telegramUserId) {
      await fetchUserId();
    }

    const validStickerPackName = ensureValidStickerPackName(telegramStickerPackName, telegramBotUsername);
    setTelegramStickerPackName(validStickerPackName);

    setStatus('Generating...');
    Cookies.set('telegramToken', telegramToken, { expires: 7 });
    Cookies.set('telegramStickerPackName', validStickerPackName, { expires: 7 });
    Cookies.set('telegramUserId', telegramUserId, { expires: 720 });

    try {
      setIsLoading(true);
      const processedImages = await processImages();
      const resizedImages = await resizeImages(processedImages);
      const compressedImages = await compressImages(resizedImages);

      const updatedImages = compressedImages.map((src, index) => ({
        ...images[index],
        src,
      }));
      setImages(updatedImages);

      const stickerFiles = await Promise.all(compressedImages.map(urlToBlob));

      await publishStickersToTelegram(stickerFiles, validStickerPackName);
      const stickerPackUrl = `${STICKER_PACK_URL}${validStickerPackName}`;

      setStatus(<span>Sticker pack created successfully. You can add it to your Telegram here: <a href={stickerPackUrl} target="_blank" rel="noopener noreferrer">{stickerPackUrl}</a></span>);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      try {
        const response = error.response.data;
        setStatus('Error during generation: ' + response.description);
      } catch {
        setStatus('Error during generation: ' + error.message);
      }
    }
  };

  const fetchBotUsername = async () => {
    try {
      const response = await axios.get(`${TELEGRAM_API_URL}${telegramToken}/getMe`);
      const botUsername = response.data.result.username;
      setTelegramBotUsername(botUsername);
      Cookies.set('telegramBotUsername', botUsername, { expires: 7 });
    } catch (error) {
      setStatus('Error fetching bot username: ' + error.message);
    }
  };

  const fetchUserId = async () => {
    try {
      const response = await axios.get(`${TELEGRAM_API_URL}${telegramToken}/getUpdates`);
      const updates = response.data.result;
      if (updates.length > 0) {
        const userId = updates[0].message.from.id;
        setTelegramUserId(userId);
        Cookies.set('telegramUserId', userId, { expires: 7 });
      } else {
        throw new Error('No updates found. Please send a message to the bot to get the user ID.');
      }
    } catch (error) {
      setStatus('Error fetching user ID: ' + error.message);
    }
  };

  const ensureValidStickerPackName = (name, botUsername) => {
    const suffix = `_by_${botUsername}`;
    if (!name.endsWith(suffix)) {
      return `${name}${suffix}`;
    }
    return name;
  };

  const processImages = async () => {
    setStatus('Processing images...');
    return await Promise.all(images.map((image, index) => {
      setStatus(`Processing images... (${index + 1}/${images.length})`);
      return processImage(image.file);
    }));
  };

  const resizeImages = async (processedImages) => {
    setStatus('Resizing images...');
    return await Promise.all(processedImages.map((image, index) => {
      setStatus(`Resizing images... (${index + 1}/${processedImages.length})`);
      return resizeImage(image);
    }));
  };

  const compressImages = async (resizedImages) => {
    setStatus('Compressing images...');
    return await Promise.all(resizedImages.map((image, index) => {
      setStatus(`Compressing images... (${index + 1}/${resizedImages.length})`);
      return compressImage(image);
    }));
  };

  const processImage = async (file) => {
    try {
      const result = await removeBackground(file, {
        model: 'medium',
        output: {
          format: 'image/png',
          type: 'foreground',
        },
      });
      const url = URL.createObjectURL(result);
      return url;
    } catch (error) {
      setIsLoading(false);
      throw new Error('Error removing background: ' + error.message);
    }
  };

  const resizeImage = (image) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = image;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (img.width > img.height) {
          canvas.width = 512;
          canvas.height = (512 / img.width) * img.height;
        } else {
          canvas.height = 512;
          canvas.width = (512 / img.height) * img.width;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      };
    });
  };

  const compressImage = (image, maxSizeKb = 490) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = image;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        let quality = 0.95;
        let dataUrl;
        do {
          dataUrl = canvas.toDataURL('image/png', quality);
          quality -= 0.05;
        } while (dataUrl.length / 1024 > maxSizeKb && quality > 0.1);

        resolve(dataUrl);
      };
    });
  };

  const urlToBlob = (url) => {
    return fetch(url)
      .then(response => response.blob())
      .then(blob => new File([blob], 'sticker.png', { type: 'image/png' }));
  };

  const publishStickersToTelegram = async (stickerFiles, validStickerPackName) => {
    await createNewStickerSet(telegramUserId, stickerFiles[0], validStickerPackName);

    for (let i = 1; i < stickerFiles.length; i++) {
      await addStickerToSet(telegramUserId, stickerFiles[i], validStickerPackName, images[i].emoji);
    }
  };

  const createNewStickerSet = async (userId, stickerFile, validStickerPackName) => {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('name', validStickerPackName);
    formData.append('title', validStickerPackName);
    formData.append('png_sticker', stickerFile);
    formData.append('emojis', '😊');

    await axios.post(`${TELEGRAM_API_URL}${telegramToken}/createNewStickerSet`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  const addStickerToSet = async (userId, stickerFile, validStickerPackName, emoji) => {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('name', validStickerPackName);
    formData.append('png_sticker', stickerFile);
    formData.append('emojis', emoji);

    await axios.post(`${TELEGRAM_API_URL}${telegramToken}/addStickerToSet`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  return (
    <div className="App">
        <Helmet>
          <title>{ TITLE }</title>
        </Helmet>
      <h1>Stickerator</h1>
      <div className="input-section">
        <label>
          Select Input Type:
          <select value={inputType} onChange={handleInputChange}>
            <option value="file">File Upload</option>
          </select>
        </label>
        {inputType === 'file' && <FileInput onUpload={handleImagesUpload} />}
      </div>
      <div className="api-token-section">
        <label>
          Telegram API Token:
          <input type="text" value={telegramToken} onChange={(e) => setTelegramToken(e.target.value)} />
          <button
            type="button"
            className="info-button"
            onClick={() => setTooltip(!tooltip)}
          >
            ?
          </button>
        </label>
        <label>
          {tooltip && (
            <div id="infoTooltip" className="tooltip-text">
              Get your API token for free <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer">here</a> and send at least one message to your bot.
            </div>
          )}
        </label>
        <label>
          Sticker pack name:
          <input type="text" value={telegramStickerPackName} onChange={(e) => setTelegramStickerPackName(e.target.value)} />
        </label>
      </div>
      <button onClick={handleGenerateClick} disabled={isLoading}>
        Generate
      </button>
      <ProgressBar status={status} isLoading={isLoading} />
      <StatusDescription status={status} />
      <ImageGrid images={images} setImages={setImages} />
    </div>
  );
}

export default App;
