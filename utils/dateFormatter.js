/**
 * Format a date as DD.MM.YYYY HH:MM
 * @param {Date} date - The date to format
 * @returns {string} Formatted date and time string
 */
export function formatDateTime(date = new Date()) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

/**
 * Format a date as DD.MM.YYYY
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date = new Date()) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}
