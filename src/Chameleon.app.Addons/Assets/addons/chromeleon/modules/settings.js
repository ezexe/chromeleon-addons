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
  "DOMRectnoise",
  "DOMRectReadOnlynoise",
  "WebGLnoise",
  "WebGLnoiseAmplitude",
  "canvasR",
  "canvasG",
  "canvasB",
  "canvasA",
  "Fontsnoise",
  "Fontssign",
  "randomWebGLSpoofing",
  "randomCanvasSpoofing",
  "randomFontsSpoofing",
  "randomRectsSpoofing"
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
  DOMRectnoise: 1,
  DOMRectReadOnlynoise: 1,
  WebGLnoise: 1,
  WebGLnoiseAmplitude: 1,
  canvasR: 1,
  canvasG: 1,
  canvasB: 1,
  canvasA: 1,
  Fontsnoise: 1,
  Fontssign: 1,
  eMode: "disable_non_proxied_udp",
  dMode: "default_public_interface_only",
  timezone: "America/Los_Angeles",
  latitude: 34.052235,
  longitude: -118.243683,
  locale: "en-US",
  debug: 4,
  accuracy: 64.0999,
  bypass: [],
  history: [],
  randomWebGLSpoofing: false,
  randomCanvasSpoofing: false,
  randomFontsSpoofing: false,
  randomRectsSpoofing: false
};
export const noises = {
  noiseLevel: {
    micro: 0.1,
    mini: 0.2,
    low: 0.3,
    medium: 0.4,
    bold: 0.5,
    high: 0.6,
    heavy: 0.7,
    ultra: 0.8,
    super: 0.9,
    max: 1.5,
  },
  DOMRect: 0.00000001,
  DOMRectReadOnly: 0.000001,
  random: {
    seed: Math.floor(Math.random() * 1000000),
    noise: {
        DOMRect: 0.00000001,
        DOMRectReadOnly: 0.000001,
    },
    metrics: {
        DOMRect: ["x", "y", "width", "height"],
        DOMRectReadOnly: ["top", "right", "bottom", "left"],
    },
    randvalue: function () {
        let thisseed = (this.seed * 9301 + 49297) % 233280;
        return thisseed / 233280;
    },
    item: function (e) {
        let rand = e.length * this.randvalue();
        return e[Math.floor(rand)];
    },
    number: function (power) {
        let tmp = [];
        for (let i = 0; i < power.length; i++) {
            tmp.push(Math.pow(2, power[i]));
        }
        return this.item(tmp);
    },
    int: function (power) {
        let tmp = [];
        for (let i = 0; i < power.length; i++) {
            let n = Math.pow(2, power[i]);
            tmp.push(new Int32Array([n, n]));
        }
        return this.item(tmp);
    },
    float: function (power) {
        let tmp = [];
        for (let i = 0; i < power.length; i++) {
            let n = Math.pow(2, power[i]);
            tmp.push(new Float32Array([1, n]));
        }
        return this.item(tmp);
    },
  },
};

export async function updateSettings(built) {
  if (built) {
    var current = await chrome.storage.sync.get(SETTINGS_ARRAY);
    if (current) Object.assign(settings, current);

    settings.webglSpoofing = built.webglSpoofing;
    settings.canvasProtection = built.canvasProtection;
    settings.clientRectsSpoofing = built.clientRectsSpoofing;
    settings.fontsSpoofing = built.fontsSpoofing;
    settings.debug = built.debug;
    settings.timezoneSpoofing = built.timezoneSpoofing;
    if(settings.timezoneSpoofing) {
      settings.myIP = false;
      settings.timezone = built.timezone;
    }else{
      settings.myIP = true;
    }
    settings.geoSpoofing = built.geoSpoofing;
    if(settings.accuracy === 69.96)
      settings.accuracy = 64.0999;
    if(settings.geoSpoofing) {
      settings.latitude = built.latitude;
      settings.longitude = built.longitude;
    }
    if (settings.DOMRectnoise === 1 || settings.randomRectsSpoofing) {
      // Update rects noise levels
      settings.DOMRectnoise =
        1 +
        (Math.random() < 0.5 ? -1 : +1) *
          (noises.DOMRect * noises.noiseLevel[settings.noiseLevel]);
    }

    if (settings.DOMRectReadOnlynoise === 1 || settings.randomRectsSpoofing) {
      settings.DOMRectReadOnlynoise =
      1 +
      (Math.random() < 0.5 ? -1 : +1) *
        (noises.DOMRectReadOnly * noises.noiseLevel[settings.noiseLevel]);
    }
    if (settings.WebGLnoise === 1 || settings.randomWebGLSpoofing) {
      // Update WebGL noise levels
      settings.WebGLnoise = noises.random.randvalue();
    }
    if(settings.WebGLnoiseAmplitude === 1 || settings.randomWebGLSpoofing){
      settings.WebGLnoiseAmplitude = noises.noiseLevel[settings.noiseLevel];
    }
    // Update canvas noise levels
    if (
      settings.canvasR === 1 ||
      settings.canvasG === 1 ||
      settings.canvasB === 1 ||
      settings.canvasA === 1 ||
      settings.randomCanvasSpoofing
    ) {
        
      settings.canvasR = Math.floor(Math.random() * 10) - 5;
      settings.canvasG = Math.floor(Math.random() * 10) - 5;
      settings.canvasB = Math.floor(Math.random() * 10) - 5;
      settings.canvasA = Math.floor(Math.random() * 10) - 5;
    }
    if (settings.Fontsnoise === 1 || settings.randomFontsSpoofing) {
      const SIGN = Math.random() < Math.random() ? -1 : 1;
      settings.Fontsnoise = Math.floor(Math.random() + SIGN * Math.random());
    }
    if (settings.Fontssign === 1 || settings.randomFontsSpoofing) {
      const tmp = [-1, -1, -1, -1, -1, -1, +1, -1, -1, -1];
      const index = Math.floor(Math.random() * tmp.length);
      settings.Fontssign = tmp[index];
    }
  }
  await chrome.storage.sync.set(settings);
  settings = await chrome.storage.sync.get(SETTINGS_ARRAY);
}

export const Actions = {
  TZ_RESET: "tz_reset",
  GEO_RESET: "geo_reset",
};

export const promptDictionary = {
  [Actions.TZ_RESET]: {
    promptText:
      'Enter a "timezone" value. Use https://www.timeanddate.com/time/map/ to find these values',
    defaultInput: settings.timezone,
  },
  [Actions.GEO_RESET]: {
    promptText:
      'Enter a "latitude" and "longitude" separated by a comma. Use https://www.latlong.net/ to find these values',
    defaultInput: `${settings.latitude}, ${settings.longitude}`,
  },
};
