import React, { useState, useEffect } from 'react';

// Generate an array of emojis dynamically
const generateEmojis = () => {
  const emojis = [];
  for (let i = 128512; i <= 128591; i++) {
    emojis.push(String.fromCodePoint(i));
  }
  return emojis;
};

const emojis = generateEmojis();

function ImageGrid({ images, setImages }) {
  const [selectedEmojis, setSelectedEmojis] = useState([]);

  // Initialize random emojis for new images only when images change
  useEffect(() => {
    const newSelectedEmojis = images.map((_, index) => {
      return selectedEmojis[index] || getUniqueRandomEmoji(selectedEmojis);
    });
    setSelectedEmojis(newSelectedEmojis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  const getUniqueRandomEmoji = (currentEmojis) => {
    let randomEmoji;
    do {
      randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    } while (currentEmojis.includes(randomEmoji));
    return randomEmoji;
  };

  const handleEmojiChange = (index, newEmoji) => {
    const newSelectedEmojis = [...selectedEmojis];
    newSelectedEmojis[index] = newEmoji;

    // If the new emoji is already selected for another image, reassign that image
    if (newEmoji !== '' && newSelectedEmojis.filter(e => e === newEmoji).length > 1) {
      let conflictIndex = newSelectedEmojis.indexOf(newEmoji);
      if (conflictIndex === index) {
        conflictIndex = newSelectedEmojis.indexOf(newEmoji, index + 1);
      }
      newSelectedEmojis[conflictIndex] = getUniqueRandomEmoji(newSelectedEmojis);
    }

    setSelectedEmojis(newSelectedEmojis);
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newSelectedEmojis = selectedEmojis.filter((_, i) => i !== index);
    setImages(newImages);
    setSelectedEmojis(newSelectedEmojis);
  };

  return (
    <div className="image-grid">
      {images.map((image, index) => (
        <div key={index} className="image-item">
          <button className="remove-button" onClick={() => handleRemoveImage(index)}>×</button>
          <img src={image.src} alt={`uploaded ${index}`} />
          <select value={selectedEmojis[index]} onChange={(e) => handleEmojiChange(index, e.target.value)}>
            {emojis.map((emoji, emojiIndex) => (
              <option key={emojiIndex} value={emoji}>
                {emoji}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

export default ImageGrid;
