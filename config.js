import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import languageConfig from "./languageConfig.js";

// Load environment variables
dotenv.config();

// Get the directory name for the project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config object to hold all application settings
const config = {
  // Discord bot configuration
  discord: {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID,
  },

  // OpenAI API configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-3.5-turbo", // Default model to use
    maxTokens: 1500, // Default max tokens for summaries
  },

  // Audio recording configuration
  recording: {
    directory: path.join(__dirname, "recordings"),
    format: "pcm", // Format for saving raw audio
    sampleRate: 48000,
    channels: 2,
    frameSize: 960,
  },

  // Application paths
  paths: {
    root: __dirname,
    commands: path.join(__dirname, "commands"),
    services: path.join(__dirname, "services"),
  },

  // Language configuration from languageConfig
  language: languageConfig.language,
};

export default config;
