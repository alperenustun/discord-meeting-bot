import { SlashCommandBuilder } from "discord.js";
import { joinVoiceChannel, EndBehaviorType } from "@discordjs/voice";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Readable } from "stream";
import { createWriteStream } from "fs";
import prism from "prism-media";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create recordings directory if it doesn't exist
const recordingsDir = path.join(__dirname, "..", "recordings");
if (!fs.existsSync(recordingsDir)) {
  fs.mkdirSync(recordingsDir, { recursive: true });
}

// Store active recordings
const activeRecordings = new Map();

export const data = new SlashCommandBuilder()
  .setName("record-meeting")
  .setDescription("Joins your voice channel and starts recording the meeting");

/**
 * Creates a pipeline that handles audio data conversion and writing to file
 * with better error handling
 */
function createAudioPipeline(audioStream, filePath, username) {
  // Create decoder
  const opusDecoder = new prism.opus.Decoder({
    rate: 48000,
    channels: 2,
    frameSize: 960,
  });

  // Create file stream
  const fileStream = createWriteStream(filePath);

  // Set up error handlers for each stream
  audioStream.on("error", (err) => {
    console.error(`Audio stream error for ${username}:`, err);
  });

  opusDecoder.on("error", (err) => {
    console.error(`Decoder error for ${username}:`, err);
  });

  fileStream.on("error", (err) => {
    console.error(`File stream error for ${username}:`, err);
  });

  // Manually connect the streams instead of using pipeline
  audioStream.pipe(opusDecoder).pipe(fileStream);

  return {
    audioStream,
    opusDecoder,
    fileStream,
    destroy: () => {
      // Clean up function
      try {
        // Unpipe everything to prevent backpressure issues
        audioStream.unpipe(opusDecoder);
        opusDecoder.unpipe(fileStream);

        // End file stream first
        fileStream.end();

        // Then destroy the other streams
        if (audioStream.destroy) audioStream.destroy();
        if (opusDecoder.destroy) opusDecoder.destroy();
      } catch (err) {
        console.error(`Error during cleanup for ${username}:`, err);
      }
    },
  };
}

export async function execute(interaction) {
  // Check if the user is in a voice channel
  const voiceChannel = interaction.member.voice.channel;
  if (!voiceChannel) {
    return interaction.reply({
      content: "You need to be in a voice channel to use this command!",
      ephemeral: true,
    });
  }

  try {
    await interaction.deferReply();

    // Create a unique session ID for this recording
    const sessionId = Date.now().toString();
    const recordingPath = path.join(recordingsDir, `${sessionId}`);

    if (!fs.existsSync(recordingPath)) {
      fs.mkdirSync(recordingPath, { recursive: true });
    }

    // Join the voice channel
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: true,
    });

    // Create a receiver
    const receiver = connection.receiver;

    // Track active user streams
    const userStreams = new Map();

    // Set up recording for each user in the voice channel
    voiceChannel.members.forEach((member) => {
      if (member.user.bot) return; // Skip bots

      const audioPath = path.join(recordingPath, `${member.user.id}.pcm`);
      console.log(`Recording ${member.user.username} to ${audioPath}`);

      // Use Manual end behavior to keep the stream open regardless of silence
      const audioStream = receiver.subscribe(member.user.id, {
        end: {
          behavior: EndBehaviorType.Manual,
        },
      });

      // Store user info for later transcription
      const userInfo = {
        id: member.user.id,
        username: member.user.username,
      };

      fs.writeFileSync(
        path.join(recordingPath, `${member.user.id}.json`),
        JSON.stringify(userInfo)
      );

      // Create and store the audio pipeline
      const pipeline = createAudioPipeline(
        audioStream,
        audioPath,
        member.user.username
      );
      userStreams.set(member.user.id, pipeline);
    });

    // Listen for new users joining the voice channel during the meeting
    connection.receiver.speaking.on("start", (userId) => {
      const member = voiceChannel.members.get(userId);
      if (!member || member.user.bot || userStreams.has(userId)) return;

      console.log(
        `New user ${member.user.username} joined, starting recording`
      );

      const audioPath = path.join(recordingPath, `${userId}.pcm`);

      // Use Manual end behavior to keep the stream open
      const audioStream = receiver.subscribe(userId, {
        end: {
          behavior: EndBehaviorType.Manual,
        },
      });

      // Store user info for later transcription
      const userInfo = {
        id: userId,
        username: member.user.username,
      };

      fs.writeFileSync(
        path.join(recordingPath, `${userId}.json`),
        JSON.stringify(userInfo)
      );

      // Create and store the audio pipeline
      const pipeline = createAudioPipeline(
        audioStream,
        audioPath,
        member.user.username
      );
      userStreams.set(userId, pipeline);
    });

    // Store the active recording info
    activeRecordings.set(interaction.guildId, {
      sessionId,
      connection,
      recordingPath,
      startTime: Date.now(),
      userStreams, // Store user streams for later cleanup
    });

    await interaction.editReply({
      content: `🎙️ Started recording the meeting in ${voiceChannel.name}. Type \`/end-meeting\` when you want to stop recording and generate a summary.`,
    });
  } catch (error) {
    console.error("Error in record-meeting command:", error);
    return interaction.editReply({
      content: `There was an error trying to record the meeting. ${JSON.stringify(
        error
      )}`,
      ephemeral: true,
    });
  }
}

// Export the activeRecordings map for use in other commands
export { activeRecordings };
