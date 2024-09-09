const ADDON_NAME = "Chromeleon Defender";

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

let currentLogLevel = LOG_LEVELS["DEBUG"];

const formatMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  return `${timestamp} [${ADDON_NAME}] [${level}] ${message}`;
};

export const log = {
  log: (level, message, ...args) => {
    if (LOG_LEVELS[level] >= currentLogLevel) {
      console.log(formatMessage(level, message), ...args);
    }
  },
  error: (message, ...args) => console.log("ERROR", message, ...args),
  warn: (message, ...args) => console.log("WARN", message, ...args),
  info: (message, ...args) => console.log("INFO", message, ...args),
  debug: (message, ...args) => console.log("DEBUG", message, ...args),
};

export default function logger(type, message, ...args) {
  if(currentLogLevel < 0) return;
  switch (type) {
    case 'log':
      log.debug(message, ...args);
      break;
    case 'error':
      log.error(message, ...args);
      break;
    case 'warn':
      log.warn(message, ...args);
      break;
    case 'info':
      log.info(message, ...args);
      break;
    default:
      log.debug(message, ...args);
  }
}

// Example of setting the log level dynamically
export function setLogLevel(level) {
  if (LOG_LEVELS[level] !== undefined) {
    currentLogLevel = LOG_LEVELS[level];
  }
}
