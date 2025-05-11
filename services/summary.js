import { OpenAI } from "openai";
import languageConfig from "../languageConfig.js";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates a meeting summary from transcription text using OpenAI's ChatGPT API
 *
 * @param {string} transcription - The meeting transcription text
 * @returns {Promise<string>} - The generated summary
 */
export async function generateMeetingSummary(transcription) {
  try {
    // Get the configured language
    const lang = languageConfig.language.current;
    const prompts = languageConfig.prompts.summary[lang];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: prompts.system,
        },
        {
          role: "user",
          content: prompts.user.replace("{transcription}", transcription),
        },
      ],
      max_tokens: 1500,
      temperature: 0.5,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error generating summary with OpenAI:", error);
    return `Failed to generate summary due to an error with the OpenAI API: ${error.message}`;
  }
}

/**
 * Analyzes sentiment and engagement in the meeting based on the transcription
 * This is an additional feature that can provide insights about the meeting
 *
 * @param {string} transcription - The meeting transcription text
 * @returns {Promise<string>} - Analysis of the meeting
 */
export async function analyzeMetingSentiment(transcription) {
  try {
    // Get the configured language
    const lang = languageConfig.language.current;
    const prompts = languageConfig.prompts.sentiment[lang];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: prompts.system,
        },
        {
          role: "user",
          content: prompts.user.replace("{transcription}", transcription),
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error analyzing meeting sentiment with OpenAI:", error);
    return `Could not analyze meeting sentiment due to an API error: ${error.message}`;
  }
}
