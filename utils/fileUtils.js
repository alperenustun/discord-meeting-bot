import fs from "fs";
import path from "path";

/**
 * Ensure a directory exists, creating it if needed
 * @param {string} dirPath - Path to the directory
 * @returns {boolean} True if directory exists or was created
 */
export function ensureDirectoryExists(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    }
    return true;
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error);
    return false;
  }
}

/**
 * Save content to a file
 * @param {string} filePath - Path to the file
 * @param {string|Buffer} content - Content to save
 * @returns {boolean} True if file was saved successfully
 */
export function saveToFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content);
    console.log(`Saved file: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error saving file ${filePath}:`, error);
    return false;
  }
}
