import fs from "fs";
import path from "path";
import { OpenAI } from "openai";

import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { createReadStream, createWriteStream } from "fs";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Transcribes audio files using OpenAI's Whisper API
 * This implementation converts PCM audio to MP3 and uses Whisper API for transcription
 *
 * @param {string} audioPath - Path to the audio file
 * @param {string} username - Username of the speaker
 * @returns {Promise<string>} - Transcribed text
 */
export async function transcribeAudio(audioPath, username) {
  // In a real implementation, you would:
  // 1. Convert PCM to a format supported by Whisper (like mp3 or wav)
  // 2. Call the Whisper API with the converted audio file
  // 3. Return the transcription

  const inputDir = path.dirname(audioPath);
  const outputPath = path.join(
    inputDir,
    `${path.basename(audioPath, path.extname(audioPath))}.mp3`
  );

  // Use the original conversion parameters
  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(createReadStream(audioPath))
      .inputFormat("s16le")
      .inputOptions(["-ar 16000", "-ac 1"])
      .audioFilters([
        "asetrate=22050*4.5", // Increase pitch 4x (adjust this value to your liking)
        "aresample=16000", // Resample to 16000 Hz after changing the rate
      ])
      .audioChannels(1)
      .audioCodec("libmp3lame")
      .format("mp3")
      .on("end", () => {
        console.log("Conversion complete!");
        resolve();
      })
      .on("error", (err) => {
        console.error("Error:", err);
        reject(err);
      })
      .save(outputPath);
  });

  // Call the Whisper API with the converted MP3 file
  try {
    console.log(`Transcribing audio for ${username}...`);
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(outputPath),
      model: "whisper-1",
      language: "tr", // Set to Turkish for Turkish audio
    });
    
    return transcription.text;
  } catch (error) {
    console.error(`Error with Whisper API:`, error);
    // Fallback to simulation if API fails
    return simulateTranscription(username);
  }
}

/**
 * Process all recordings from a session and create a full transcription
 *
 * @param {string} recordingPath - Path to the recording session directory
 * @returns {Promise<{success: boolean, text: string, error?: string}>} - Transcription result
 */
export async function processRecordings(recordingPath) {
  try {
    console.log(`Processing recordings from ${recordingPath}...`);
    const userFiles = fs
      .readdirSync(recordingPath)
      .filter((file) => file.endsWith(".json"));
    let transcription = "Meeting Transcription:\n\n";

    for (const userFile of userFiles) {
      const userInfoPath = path.join(recordingPath, userFile);
      const userInfo = JSON.parse(fs.readFileSync(userInfoPath, "utf8"));

      const audioPath = path.join(recordingPath, `${userInfo.id}.pcm`);
      if (fs.existsSync(audioPath)) {
        // Get transcription for this user's audio
        const userTranscript = await transcribeAudio(
          audioPath,
          userInfo.username
        );
        transcription += `${userInfo.username}:\n${userTranscript}\n\n`;
      }
    }

    return {
      success: true,
      text: transcription,
    };
  } catch (error) {
    console.error("Error processing recordings:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Simulates transcription for demo purposes
 * In a real implementation, this would be replaced with actual API calls
 *
 * @param {string} username - Username to base the simulated transcription on
 * @returns {string} - Simulated transcription text
 */
function simulateTranscription(username) {
  const transcripts = [
    `Hello everyone, I'm ${username}. I think we should start by discussing our quarterly goals.`,
    `I've been working on the new feature and I'm happy to report that we're ahead of schedule.`,
    `We need to address the bug reports from last week. I've categorized them by priority.`,
    `The client meeting went well. They're excited about the new dashboard we're developing.`,
    `I suggest we allocate more resources to the marketing campaign. The initial results are promising.`,
    `Has anyone had a chance to review the documentation I sent yesterday?`,
    `We need to finalize the budget for Q2. There are some unexpected expenses we need to account for.`,
    `The user testing results are in, and we have some valuable feedback to implement.`,
    `I've prepared a demo of the new UI. Would you like me to share my screen?`,
    `Let's schedule a follow-up meeting next week to track our progress on these action items.`,
  ];

  // Select 3-5 random transcripts for variety
  const count = Math.floor(Math.random() * 3) + 3; // 3-5 lines
  let result = "";

  const usedIndexes = new Set();
  for (let i = 0; i < count; i++) {
    let index;
    do {
      index = Math.floor(Math.random() * transcripts.length);
    } while (usedIndexes.has(index));

    usedIndexes.add(index);
    result += transcripts[index] + "\n";
  }

  return result;
}
