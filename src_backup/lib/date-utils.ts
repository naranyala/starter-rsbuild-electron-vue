/**
 * Date and Time Utilities for Frontend Renderer Process
 * These utilities work with date formatting and time calculations
 */

/**
 * Format date to localized string
 * @param {Date|string|number} date - Date to format
 * @param {string} locale - Locale string (default: 'en-US')
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
function formatDate(
  date: Date | string | number,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'object' ? date : new Date(date);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };

  return dateObj.toLocaleDateString(locale, defaultOptions);
}

/**
 * Format time to localized string
 * @param {Date|string|number} date - Date to format
 * @param {string} locale - Locale string (default: 'en-US')
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted time string
 */
function formatTime(
  date: Date | string | number,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'object' ? date : new Date(date);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };

  return dateObj.toLocaleTimeString(locale, defaultOptions);
}

/**
 * Format date and time to localized string
 * @param {Date|string|number} date - Date to format
 * @param {string} locale - Locale string (default: 'en-US')
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date-time string
 */
function formatDateTime(
  date: Date | string | number,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'object' ? date : new Date(date);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };

  return dateObj.toLocaleString(locale, defaultOptions);
}

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 * @param {Date|string|number} date - Date to compare
 * @param {string} locale - Locale string (default: 'en-US')
 * @returns {string} - Relative time string
 */
function getRelativeTime(
  date: Date | string | number,
  locale: string = 'en-US'
): string {
  const dateObj = typeof date === 'object' ? date : new Date(date);
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);
  const diffWeeks = Math.round(diffDays / 7);
  const diffMonths = Math.round(diffDays / 30);
  const diffYears = Math.round(diffDays / 365);

  if (Math.abs(diffSeconds) < 60) {
    return rtf.format(diffSeconds, 'second');
  } else if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, 'minute');
  } else if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hour');
  } else if (Math.abs(diffDays) < 7) {
    return rtf.format(diffDays, 'day');
  } else if (Math.abs(diffWeeks) < 4) {
    return rtf.format(diffWeeks, 'week');
  } else if (Math.abs(diffMonths) < 12) {
    return rtf.format(diffMonths, 'month');
  } else {
    return rtf.format(diffYears, 'year');
  }
}

/**
 * Check if a date is today
 * @param {Date|string|number} date - Date to check
 * @returns {boolean} - True if date is today
 */
function isToday(date: Date | string | number): boolean {
  const dateObj = typeof date === 'object' ? date : new Date(date);
  const today = new Date();

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is yesterday
 * @param {Date|string|number} date - Date to check
 * @returns {boolean} - True if date is yesterday
 */
function isYesterday(date: Date | string | number): boolean {
  const dateObj = typeof date === 'object' ? date : new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    dateObj.getDate() === yesterday.getDate() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getFullYear() === yesterday.getFullYear()
  );
}

export {
  formatDate,
  formatTime,
  formatDateTime,
  getRelativeTime,
  isToday,
  isYesterday,
};
