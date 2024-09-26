const SETTINGS_ARRAY = [
  "enabled",
  "webglSpoofing",
  "canvasProtection",
  "clientRectsSpoofing",
  "fontsSpoofing",
  "geoSpoofing",
  "timezoneSpoofing",
  "dAPI",
  "webRtcEnabled",
  "randomizeTZ",
  "randomizeGeo",
  "noiseLevel",
  "eMode",
  "dMode",
  "timezone",
  "locale",
  "debug",
  "latitude",
  "longitude",
  "accuracy",
  "myIP",
  "bypass",
  "history",
];

let settings = {
  enabled: true,
  webglSpoofing: true,
  canvasProtection: true,
  clientRectsSpoofing: true,
  fontsSpoofing: true,
  geoSpoofing: true,
  timezoneSpoofing: true,
  webRtcEnabled: true,
  dAPI: true,
  myIP: false,
  randomizeTZ: false,
  randomizeGeo: false,
  noiseLevel: "medium",
  eMode: "disable_non_proxied_udp",
  dMode: "default_public_interface_only",
  timezone: "America/Los_Angeles",
  locale: "en-US",
  debug: 4,
  latitude: 48.856892,
  longitude: 2.350850,
  accuracy: 69.96,
  bypass: [],
  history: [],
};

const Actions = {
  TZ_RESET: 'tz_reset',
  GEO_RESET: 'geo_reset',
};

const promptDictionary = {
  [Actions.TZ_RESET]: {
    promptText: "Enter a \"timezone\" value. Use https://www.timeanddate.com/time/map/ to find these values",
    defaultInput: settings.timezone
  },
  [Actions.GEO_RESET]: {
    promptText: "Enter a \"latitude\" and \"longitude\" separated by a comma. Use https://www.latlong.net/ to find these values",
    defaultInput: `${settings.latitude}, ${settings.longitude}`
  }
};

async function updateSettings() {
  await browser.storage.sync.set(settings);
  settings = await browser.storage.sync.get(SETTINGS_ARRAY);
}

module.exports = {
  SETTINGS_ARRAY,
  settings,
  Actions,
  promptDictionary,
  updateSettings
};let settings = {
  enabled: true,
  webglSpoofing: true,
  canvasProtection: true,
  clientRectsSpoofing: true,
  fontsSpoofing: true,
  geoSpoofing: true,
  timezoneSpoofing: true,
  webRtcEnabled: true,
  dAPI: true,
  myIP: false,
  randomize: false,
  noiseLevel: "medium",
  eMode: "disable_non_proxied_udp",
  dMode: "default_public_interface_only",
  timezone: "America/Los_Angeles",
  locale: "en-US",
  debug: 4,
  latitude: 48.856892,
  longitude: 2.350850,
  accuracy: 69.96,
  bypass: [],
  history: [],
};

const formatMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  return `${timestamp} [Foxameleon Main.js] [${level}] ${message}`;
};

const log = {
  log: (message, ...args) => {
    if (0 <= settings.debug) {
      console.log(formatMessage("LOG", message), ...args);
    }
  },
  debug: (message, ...args) => {
    if (1 <= settings.debug) {
      console.debug(formatMessage("DEBUG", message), ...args);
    }
  },
  info: (message, ...args) => {
    if (2 <= settings.debug) {
      console.info(formatMessage("INFO", message), ...args);
    }
  },
  warn: (message, ...args) => {
    if (3 <= settings.debug) {
      console.warn(formatMessage("WARN", message), ...args);
    }
  },
  error: (message, ...args) => {
    if (4 <= settings.debug) {
      console.error(formatMessage("ERROR", message), ...args);
    }
  },
};

module.exports = { settings, log };
