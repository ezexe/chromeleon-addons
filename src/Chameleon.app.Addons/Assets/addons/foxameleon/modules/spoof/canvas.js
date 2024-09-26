const { settings } = require('./modules/settings.js');
const { log } = require('./modules/logger.js');

async function applyCanvasSpoofing(tab) {
  try {
    if (tab.url.indexOf("about:") < 0 && settings.canvasProtection) {
      await browser.tabs.executeScript(tab.id, {
        code: `
          (function() {
            const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
            HTMLCanvasElement.prototype.toDataURL = function(...args) {
              const canvas = this;
              const ctx = canvas.getContext('2d');
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const pixels = imageData.data;

              const noiseAmplitude = ${settings.noiseLevel === "high" ? 2 : 
                                      settings.noiseLevel === "medium" ? 1 : 0.5};

              for (let i = 0; i < pixels.length; i += 4) {
                pixels[i] += Math.floor((Math.random() - 0.5) * noiseAmplitude * 2);     // Red
                pixels[i + 1] += Math.floor((Math.random() - 0.5) * noiseAmplitude * 2); // Green
                pixels[i + 2] += Math.floor((Math.random() - 0.5) * noiseAmplitude * 2); // Blue
              }

              ctx.putImageData(imageData, 0, 0);
              return originalToDataURL.apply(this, args);
            };

            // Similar modifications can be made for WebGL contexts if needed
          })();
        `,
        runAt: "document_start"
      });
      log.info(`Canvas spoofing applied for tab ${tab.id}`);
    }
  } catch (error) {
    log.error(`Failed to apply canvas spoofing for tab ${tab.id}:`, error);
  }
}

function setupTabListeners() {
  browser.tabs.onCreated.addListener((tab) => {
    applyCanvasSpoofing(tab);
  });

  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "loading") {
      applyCanvasSpoofing(tab);
    }
  });
}

// Initialize
setupTabListeners();

module.exports = {
  applyCanvasSpoofing
};