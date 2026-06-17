// frontend/src/utils/logger.js

/**
 * Lightweight browser console logging utility.
 * Sentry-free implementation to keep dependencies minimal.
 */

export const logInfo = (message, context = null) => {
  if (context) {
    console.log(`[INFO] ${message}`, context);
  } else {
    console.log(`[INFO] ${message}`);
  }
};

export const logWarn = (message, context = null) => {
  if (context) {
    console.warn(`[WARN] ${message}`, context);
  } else {
    console.warn(`[WARN] ${message}`);
  }
};

export const logError = (message, error = null) => {
  if (error) {
    console.error(`[ERROR] ${message}`, error);
  } else {
    console.error(`[ERROR] ${message}`);
  }
};
