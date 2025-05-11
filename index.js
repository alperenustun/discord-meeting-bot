import { Client, GatewayIntentBits, Collection } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import config from "./config.js";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Initialize commands collection
client.commands = new Collection();

// Create recordings directory if it doesn't exist
if (!fs.existsSync(config.recording.directory)) {
  fs.mkdirSync(config.recording.directory, { recursive: true });
  console.log(`Created recordings directory at ${config.recording.directory}`);
}

// Load command files
const commandsPath = config.paths.commands;
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);

  try {
    const command = await import(pathToFileURL(filePath).href);

    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
      console.log(`Loaded command: ${command.data.name}`);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  } catch (error) {
    console.error(`[ERROR] Failed to load command from ${filePath}:`, error);
  }
}

// Event handler for when the client is ready
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(
    `Bot is ready and serving in ${client.guilds.cache.size} servers`
  );
});

// Event handler for handling interactions
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing command ${interaction.commandName}:`, error);

    // If the interaction has already been replied to or deferred, editReply
    // Otherwise, reply to it
    const replyMethod =
      interaction.replied || interaction.deferred ? "editReply" : "reply";
    const replyOptions = {
      content: "There was an error while executing this command!",
      ephemeral: true,
    };

    try {
      await interaction[replyMethod](replyOptions);
    } catch (followUpError) {
      console.error("Error while sending error response:", followUpError);
    }
  }
});

// Handle process errors to prevent crashing
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

// Login to Discord with your client's token
client
  .login(config.discord.token)
  .then(() => {
    console.log("Bot is connecting to Discord...");
  })
  .catch((error) => {
    console.error("Failed to login to Discord:", error);
    process.exit(1);
  });
