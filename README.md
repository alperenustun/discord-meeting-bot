# Discord Meeting Recorder and Summarizer Bot

A Discord bot that joins voice channels, records meetings, transcribes them, and generates summaries using ChatGPT.

## Features

- Join voice channels and record meetings with the `/record-meeting` command
- Automatically detect and record all users in the voice channel
- Generate a transcription of the meeting (simulated in this version)
- Use OpenAI's ChatGPT API to create a summary of the meeting
- Export and share the meeting summary with the `/end-meeting` command

## Prerequisites

- Node.js v16.9.0 or higher
- A Discord bot token (from [Discord Developer Portal](https://discord.com/developers/applications))
- An OpenAI API key (from [OpenAI API](https://platform.openai.com/api-keys))

## Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/discord-bot-meeting.git
   cd discord-bot-meeting
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following:
   ```
   DISCORD_TOKEN=your_discord_bot_token_here
   DISCORD_CLIENT_ID=your_discord_client_id_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Deploy slash commands to your Discord server:
   ```bash
   node deploy-commands.js
   ```

5. Configure your preferred language in `languageConfig.js`:
   ```javascript
   language: {
     // Set your preferred language here: "tr" for Turkish, "en" for English
     current: "en", // or "tr" for Turkish
     supported: ["en", "tr"],
   },
   ```

6. Invite the bot to your server with the required permissions:
   - Create an invite URL in the Discord Developer Portal
   - Required permissions: Send Messages, Read Messages, Connect to Voice Channels, Speak in Voice Channels

## Usage

1. Start the bot:
   ```bash
   npm start
   ```

2. In your Discord server, use the following commands:

   - `/record-meeting`: Join your current voice channel and start recording
   - `/end-meeting`: Stop the recording, process it, and generate a summary

## Limitations

- In this version, the speech-to-text transcription is simulated
- For a production version, you would need to implement a proper speech-to-text API (like Google Cloud Speech-to-Text, AWS Transcribe, or OpenAI's Whisper API)
- The bot may not handle very large recordings efficiently

## License

MIT

## Disclaimer

Please ensure all participants in the meeting are aware of and consent to being recorded. Different regions have different laws regarding consent for recordings. 