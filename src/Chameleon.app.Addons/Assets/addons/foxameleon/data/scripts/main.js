{
const { settings, log } = require('../modules/settings.js');
const config = require('../modules/randomConfig.js');
const webglSpoofing = require('../modules/webglSpoofing.js');

let loaded = false;

// Session object to store spoofed values
const session = {
  spoofedValues: {},
};

// Apply settings
var tries = 0;
function applySettings() {
  if (!loaded && tries < 18) {
    tries++;
    log.log("Settings not loaded yet");
    window.setTimeout(applySettings, 250);
    return;
  }
  log.log("Settings loaded");
  if (!settings.enabled) return;
  // Spoofing of fonts
  if (settings.fontsSpoofing) 
  {
    config.fonts.offsetHeight(HTMLElement);
    config.fonts.offsetWidth(HTMLElement);
  }
  // Spoofing of WebGLRenderingContext and WebGL2RenderingContext
  if (settings.webglSpoofing) 
  {
    [WebGLRenderingContext, WebGL2RenderingContext].forEach((context) => {
      webglSpoofing.buffer(context);
      // webglSpoofing.parameter(context);
      // webglSpoofing.extension(context);
    });
  }
  // Spoofing of CanvasRenderingContext2D
  if (settings.canvasProtection) config.canvas.toDataURL(HTMLCanvasElement);
  //
  if (settings.webRtcEnabled && navigator.mediaDevices?.enumerateDevices) {
    navigator.mediaDevices.enumerateDevices = new Proxy(
      navigator.mediaDevices.enumerateDevices,
      {
        apply(target, self, args) {
          if (settings.dAPI) {
            return Promise.resolve([]);
          }
          return Reflect.apply(target, self, args);
        },
      }
    );
  }

  log.log(`Settings applied ${JSON.stringify(settings)}`);
}

// Initialize framed settings
function applyFramedSettings() {
  // Spoofing of DOMRect and DOMRectReadOnly
  if (settings.clientRectsSpoofing) {
    //Spoofing of DOMRect
    {
      const metrics = ["x", "y", "width", "height"];
      for (let i = 0; i < metrics.length; i++) {
        config.clientRects.method.DOMRect(metrics[i]);
      }
    }

    // Spoofing of DOMRectReadOnly
    {
      const metrics = ["top", "right", "bottom", "left"];
      for (let i = 0; i < metrics.length; i++) {
        config.clientRects.method.DOMRectReadOnly(metrics[i]);
      }
    }
  }
}

// Listen for messages from the isolated script
window.addEventListener(
  "message",
  function (e) {
    if (e.data && e.data.type === "FOXAMELEON_DEFENDER_SETTINGS_RESPONSE") {
      e.preventDefault();
      e.stopPropagation();
      settings = e.data.data;
      loaded = true;
      //applySettings();
    }
  },
  false
);

// Request initial settings from the content script
window.postMessage({ type: "REQUEST_FOXAMELEON_DEFENDER_SETTINGS" }, "*");

// Initial application of settings
applySettings();
applyFramedSettings();

log.log("Page context script loaded and active");
}
