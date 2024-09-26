const ADDON_NAME = "Foxameleon Defender";

const LOG_LEVELS = {
  LOG: 0,
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
};

let currentLogLevel = LOG_LEVELS["DEBUG"];

const formatMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  return `${timestamp} [${ADDON_NAME}] [${level}] ${message}`;
};

const loggerObj = {
  log: (message, ...args) => {
    if (LOG_LEVELS.DEBUG <= currentLogLevel) {
      console.log(formatMessage("LOG", message), ...args);
    }
  },
  debug: (message, ...args) => {
    if (LOG_LEVELS.DEBUG <= currentLogLevel) {
      console.debug(formatMessage("DEBUG", message), ...args);
    }
  },
  info: (message, ...args) => {
    if (LOG_LEVELS.INFO <= currentLogLevel) {
      console.info(formatMessage("INFO", message), ...args);
    }
  },
  warn: (message, ...args) => {
    if (LOG_LEVELS.WARN <= currentLogLevel) {
      console.warn(formatMessage("WARN", message), ...args);
    }
  },
  error: (message, ...args) => {
    if (LOG_LEVELS.ERROR <= currentLogLevel) {
      console.error(formatMessage("ERROR", message), ...args);
    }
  },
};

function logger(type, message, ...args) {
  if(currentLogLevel < 0) return;
  switch (type) {
    case 'log':
      loggerObj.debug(message, ...args);
      break;
    case 'error':
      loggerObj.error(message, ...args);
      break;
    case 'warn':
      loggerObj.warn(message, ...args);
      break;
    case 'info':
      loggerObj.info(message, ...args);
      break;
    default:
      loggerObj.debug(message, ...args);
  }
}

function setLogLevel(level) {
  if (LOG_LEVELS[level] !== undefined) {
    currentLogLevel = LOG_LEVELS[level];
  }
}

// Expose the functions and objects to be used in other files
module.exports = {
  log: loggerObj,
  logger: logger,
  setLogLevel: setLogLevel
};
