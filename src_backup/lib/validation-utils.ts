/**
 * Validation Utilities for Frontend Renderer Process
 * These utilities provide common validation functions
 */

/**
 * Check if a string is a valid email
 * @param {string} email - Email string to validate
 * @returns {boolean} - True if valid email
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if a string is a valid URL
 * @param {string} url - URL string to validate
 * @returns {boolean} - True if valid URL
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a string is empty or only whitespace
 * @param {string} str - String to check
 * @returns {boolean} - True if empty or whitespace only
 */
function isEmpty(str: string): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Check if a string has minimum length
 * @param {string} str - String to check
 * @param {number} minLength - Minimum required length
 * @returns {boolean} - True if meets minimum length
 */
function hasMinLength(str: string, minLength: number): boolean {
  return Boolean(str) && str.length >= minLength;
}

/**
 * Check if a string has maximum length
 * @param {string} str - String to check
 * @param {number} maxLength - Maximum allowed length
 * @returns {boolean} - True if within maximum length
 */
function hasMaxLength(str: string, maxLength: number): boolean {
  return !str || str.length <= maxLength;
}

/**
 * Check if a string is a valid number
 * @param {string} str - String to check
 * @returns {boolean} - True if valid number
 */
function isNumber(str: string): boolean {
  return !isNaN(Number(str)) && !isNaN(parseFloat(str));
}

/**
 * Check if a value is a valid integer
 * @param {string|number} value - Value to check
 * @returns {boolean} - True if valid integer
 */
function isInteger(value: string | number): boolean {
  return Number.isInteger(Number(value));
}

/**
 * Check if a number is within range
 * @param {number} value - Number to check
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} - True if within range
 */
function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Check if a string matches a regex pattern
 * @param {string} str - String to check
 * @param {RegExp} pattern - Regex pattern to match
 * @returns {boolean} - True if matches pattern
 */
function matchesPattern(str: string, pattern: RegExp): boolean {
  return pattern.test(str);
}

/**
 * Validate phone number (basic validation)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone number format
 */
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Check if a password meets strength requirements
 * @param {string} password - Password to check
 * @returns {object} - Password strength information
 */
function getPasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (!password || password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Password must contain lowercase letters');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Password must contain uppercase letters');
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    feedback.push('Password must contain numbers');
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Password must contain special characters');
  } else {
    score += 1;
  }

  return {
    isValid: feedback.length === 0,
    score,
    feedback,
  };
}

export {
  isValidEmail,
  isValidUrl,
  isEmpty,
  hasMinLength,
  hasMaxLength,
  isNumber,
  isInteger,
  isInRange,
  matchesPattern,
  isValidPhone,
  getPasswordStrength,
};
