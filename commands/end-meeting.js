import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { activeRecordings } from "./record-meeting.js";
import { processRecordings } from "../services/transcription.js";
import {
  generateMeetingSummary,
  analyzeMetingSentiment,
} from "../services/summary.js";
import languageConfig from "../languageConfig.js";
import {
  formatDateTime,
  calculateDurationInMinutes,
  formatDuration,
  saveToFile,
} from "../utils/index.js";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const data = new SlashCommandBuilder()
  .setName("end-meeting")
  .setDescription("Stops recording the meeting and generates a summary");

export async function execute(interaction) {
  try {
    await interaction.deferReply();

    // Check if there's an active recording for this guild
    const recording = activeRecordings.get(interaction.guildId);

    if (!recording) {
      return interaction.editReply(
        "There is no active recording in this server."
      );
    }

    // Properly close all audio streams first
    if (recording.userStreams) {
      console.log("Closing all user audio streams...");
      for (const [userId, pipeline] of recording.userStreams.entries()) {
        try {
          // Use the custom destroy method we created
          if (pipeline && typeof pipeline.destroy === "function") {
            pipeline.destroy();
            console.log(`Closed audio stream for user ${userId}`);
          }
        } catch (err) {
          console.error(`Error closing stream for user ${userId}:`, err);
        }
      }

      // Give time for streams to properly close
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Get the voice connection and destroy it to stop recording
    const connection = recording.connection;
    connection.destroy();

    // Notify that we're processing
    await interaction.editReply(
      "Meeting recording stopped. Processing audio and generating summary... This may take a few minutes."
    );

    // Process the recordings to get transcription
    const transcriptionResult = await processRecordings(
      recording.recordingPath
    );

    if (!transcriptionResult.success) {
      return interaction.editReply(
        `Failed to transcribe the meeting recording: ${transcriptionResult.error}`
      );
    }

    // Save the transcription to a file
    const transcriptionPath = path.join(
      recording.recordingPath,
      "transcription.txt"
    );
    saveToFile(transcriptionPath, transcriptionResult.text);

    // Generate summary using our summary service
    const summary = await generateMeetingSummary(transcriptionResult.text);

    // Optional: Analyze meeting sentiment
    const sentiment = await analyzeMetingSentiment(transcriptionResult.text);

    // Get the language-specific report labels
    const lang = languageConfig.language.current;
    const labels = languageConfig.reportLabels[lang];

    // Format the current date and time
    const dateTimeFormat = formatDateTime();

    // Combine summary and sentiment analysis with localized labels and date
    const fullReport = `# ${labels.meetingSummary} - ${dateTimeFormat}\n\n${summary}\n\n## ${labels.sentimentAnalysis}\n\n${sentiment}`;

    // Save the full report to a file
    const summaryPath = path.join(recording.recordingPath, "meeting_report.md");
    saveToFile(summaryPath, fullReport);

    // Calculate meeting duration
    const meetingDuration = calculateDurationInMinutes(recording.startTime);
    const formattedDuration = formatDuration(meetingDuration);

    // Remove this recording from the active recordings map
    activeRecordings.delete(interaction.guildId);

    // Send the summary to the user
    await interaction.editReply({
      content: `✅ Meeting recording has been processed! The meeting lasted approximately ${formattedDuration}. Here's the summary:`,
      files: [
        {
          attachment: Buffer.from(fullReport),
          name: "meeting-summary.md",
        },
      ],
    });
  } catch (error) {
    console.error("Error in end-meeting command:", error);
    return interaction.editReply(
      `There was an error processing the meeting recording: ${error.message}`
    );
  }
}
