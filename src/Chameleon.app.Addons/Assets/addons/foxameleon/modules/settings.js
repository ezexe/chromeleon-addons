export const SETTINGS_ARRAY = [
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

export let settings = {
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
  eMode: "proxy_only",
  dMode: "default_public_interface_only",
  locale: "en-US",
  timezone: "America/Los_Angeles",
  tzOffset: -420,
  debug: 4,
  latitude: 48.856892,
  longitude: 2.350850,
  accuracy: 69.96,
  bypass: [],
  history: [],
};

export const Actions = {
  TZ_RESET: 'tz_reset',
  GEO_RESET: 'geo_reset',
};

export const promptDictionary = {
  [Actions.TZ_RESET]: {
    promptText: "Enter a \"timezone\" value. Use https://www.timeanddate.com/time/map/ to find these values",
    defaultInput: settings.timezone
  },
  [Actions.GEO_RESET]: {
    promptText: "Enter a \"latitude\" and \"longitude\" separated by a comma. Use https://www.latlong.net/ to find these values",
    defaultInput: `${settings.latitude}, ${settings.longitude}`
  }
};

export async function updateSettings() {
  if(settings === undefined) {
    settings = await browser.storage.sync.get(SETTINGS_ARRAY);
  }
  await browser.storage.sync.set(settings);
  settings = await browser.storage.sync.get(SETTINGS_ARRAY);
}