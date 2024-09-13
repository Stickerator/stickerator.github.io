# Stickerator

Stickerator is a web application that allows you to create Telegram sticker packs easily. Upload your images, process them, and publish them directly to Telegram as a sticker pack.

## Features

- Upload images to create stickers.
- Remove background from images.
- Resize and compress images for optimal sticker size.
- Publish stickers directly to Telegram.
- Save Telegram API token and sticker pack name in cookies for convenience.

## Getting Started

### Prerequisites

- Node.js (version 14 or later)
- NPM or Yarn

### Installation

1. Clone the repository:

```sh
git clone https://github.com/Stickerator/stickerator.github.io.git
cd stickerator.github.io
```

2. Install dependencies:

```sh
npm install
# or
yarn install
```

### Running the Application

1. Start the development server:

```sh
npm start
# or
yarn start
```

2. Open your browser and navigate to `http://localhost:3000`.

### Building for Production

To create a production build of the application, run:

```sh
npm run build
# or
yarn build
```

The production build will be available in the `build` directory.

## Usage

1. **Upload Images**: Click on the "Select Input Type" dropdown and choose "File Upload". Upload the images you want to use for your sticker pack.

2. **Provide Telegram API Token**: Enter your Telegram API token. You can get the API token for free from [BotFather](https://t.me/BotFather). Create a bot and send at least one message to it.

3. **Enter Sticker Pack Name**: Enter a name for your sticker pack. The name must end with `_by_<botname>`.

4. **Generate Stickers**: Click the "Generate" button to start the process. The status of the process will be displayed, and a progress bar will indicate the progress.

5. **Add Sticker Pack to Telegram**: Once the sticker pack is created successfully, a link will be provided. Click the link to add the sticker pack to your Telegram.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Axios](https://axios-http.com/)
- [js-cookie](https://github.com/js-cookie/js-cookie)
- [@imgly/background-removal](https://www.npmjs.com/package/@imgly/background-removal)

## Contact

If you have any questions or feedback, please feel free to contact us.

Happy Stickering!
