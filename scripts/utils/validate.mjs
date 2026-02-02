#!/usr/bin/env node

/**
 * Validation Utilities
 * Input validation and assertion helpers
 */

import fs from 'node:fs';
import { ValidationError } from '../core/errors.mjs';

/**
 * Validate port number
 */
export function validatePort(port, _field = 'port') {
  const num = typeof port === 'string' ? parseInt(port, 10) : port;

  if (Number.isNaN(num) || num < 1024 || num > 65535) {
    throw ValidationError.invalidPort(port);
  }

  return num;
}

/**
 * Validate path exists
 */
export function validatePathExists(filepath, field = 'path') {
  if (!filepath || typeof filepath !== 'string') {
    throw new ValidationError('Path must be a non-empty string', field);
  }

  if (!fs.existsSync(filepath)) {
    throw new ValidationError(
      `Path does not exist: ${filepath}`,
      field,
      'PATH_NOT_FOUND'
    );
  }

  return filepath;
}

/**
 * Validate file exists
 */
export function validateFileExists(filepath, field = 'file') {
  validatePathExists(filepath, field);

  if (!fs.statSync(filepath).isFile()) {
    throw new ValidationError(`Not a file: ${filepath}`, field, 'NOT_A_FILE');
  }

  return filepath;
}

/**
 * Validate directory exists
 */
export function validateDirectoryExists(dirpath, field = 'directory') {
  validatePathExists(dirpath, field);

  if (!fs.statSync(dirpath).isDirectory()) {
    throw new ValidationError(
      `Not a directory: ${dirpath}`,
      field,
      'NOT_A_DIRECTORY'
    );
  }

  return dirpath;
}

/**
 * Validate string is not empty
 */
export function validateNonEmptyString(value, field = 'value') {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError(`${field} must be a non-empty string`, field);
  }
  return value.trim();
}

/**
 * Validate number is in range
 */
export function validateRange(value, min, max, field = 'value') {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (Number.isNaN(num) || num < min || num > max) {
    throw new ValidationError(
      `${field} must be a number between ${min} and ${max}`,
      field,
      'OUT_OF_RANGE'
    );
  }

  return num;
}

/**
 * Validate URL
 */
export function validateUrl(url, field = 'url') {
  try {
    new URL(url);
    return url;
  } catch {
    throw new ValidationError(`Invalid URL: ${url}`, field, 'INVALID_URL');
  }
}

/**
 * Validate email
 */
export function validateEmail(email, field = 'email') {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError(
      `Invalid email: ${email}`,
      field,
      'INVALID_EMAIL'
    );
  }
  return email;
}

/**
 * Validate against enum values
 */
export function validateEnum(value, allowedValues, field = 'value') {
  if (!allowedValues.includes(value)) {
    throw new ValidationError(
      `${field} must be one of: ${allowedValues.join(', ')}`,
      field,
      'INVALID_ENUM'
    );
  }
  return value;
}

/**
 * Validate object has required keys
 */
export function validateRequired(obj, keys, field = 'object') {
  const missing = keys.filter(
    key => !(key in obj) || obj[key] === undefined || obj[key] === null
  );

  if (missing.length > 0) {
    throw new ValidationError(
      `${field} is missing required keys: ${missing.join(', ')}`,
      field,
      'MISSING_KEYS'
    );
  }

  return obj;
}

/**
 * Validate array is not empty
 */
export function validateNonEmptyArray(arr, field = 'array') {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new ValidationError(`${field} must be a non-empty array`, field);
  }
  return arr;
}

/**
 * Validate all items in array pass custom validator
 */
export function validateArrayItems(arr, validator, field = 'array') {
  validateNonEmptyArray(arr, field);

  for (let i = 0; i < arr.length; i++) {
    try {
      validator(arr[i]);
    } catch (error) {
      throw new ValidationError(
        `${field}[${i}] is invalid: ${error.message}`,
        `${field}[${i}]`,
        'INVALID_ITEM'
      );
    }
  }

  return arr;
}

/**
 * Validate JSON string
 */
export function validateJson(str, field = 'json') {
  try {
    return JSON.parse(str);
  } catch (error) {
    throw new ValidationError(
      `Invalid JSON: ${error.message}`,
      field,
      'INVALID_JSON'
    );
  }
}

/**
 * Validate semver version string
 */
export function validateSemver(version, field = 'version') {
  const semverRegex =
    /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?(?:\+([a-zA-Z0-9.-]+))?$/;
  if (!semverRegex.test(version)) {
    throw new ValidationError(
      `Invalid semver version: ${version}`,
      field,
      'INVALID_SEMVER'
    );
  }
  return version;
}

/**
 * Create a validator that checks all given validators pass
 */
export function combineValidators(...validators) {
  return value => {
    for (const validator of validators) {
      validator(value);
    }
    return value;
  };
}

/**
 * Create a validator that allows null/undefined or passes validation
 */
export function optional(validator) {
  return value => {
    if (value === undefined || value === null) {
      return value;
    }
    return validator(value);
  };
}

// Export all as default object
export default {
  validatePort,
  validatePathExists,
  validateFileExists,
  validateDirectoryExists,
  validateNonEmptyString,
  validateRange,
  validateUrl,
  validateEmail,
  validateEnum,
  validateRequired,
  validateNonEmptyArray,
  validateArrayItems,
  validateJson,
  validateSemver,
  combineValidators,
  optional,
};
