export const SETTINGS_ARRAY = [
  "enabled",
  "webglSpoofing",
  "canvasProtection",
  "clientRectsSpoofing",
  "fontsSpoofing",
  "geoSpoofing",
  "dAPI",
  "eMode",
  "dMode",
  "noiseLevel",
  "debug"
];

class Settings {
  constructor() {
    this.data = {
      enabled: true,
      webglSpoofing: true,
      canvasProtection: true,
      clientRectsSpoofing: true,
      fontsSpoofing: true,
      geoSpoofing: true,
      dAPI: true,
      eMode: 'disable_non_proxied_udp',
      dMode: 'default_public_interface_only',
      noiseLevel: "medium",
      debug: true,
    };
    this.listeners = [];
  }

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    this.data[key] = value;
    this.notifyListeners(key, value);
  }

  update(newSettings) {
    for (const [key, value] of Object.entries(newSettings)) {
      this.set(key, value);
    }
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  removeListener(listener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  notifyListeners(key, value) {
    for (const listener of this.listeners) {
      listener(key, value);
    }
  }
}

const settings = new Settings();
export default settings;