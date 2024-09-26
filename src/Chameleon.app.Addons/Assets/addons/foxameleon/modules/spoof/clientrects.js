const { settings } = require("./modules/settings.js");
const { log } = require("./modules/logger.js");

const config = {
  noise: {
    DOMRect: 0.00000001,
    DOMRectReadOnly: 0.000001,
    low: 0.3,
    medium: 0.5,
    high: 0.8,
  },
  metrics: {
    DOMRect: ["x", "y", "width", "height"],
    DOMRectReadOnly: ["top", "right", "bottom", "left"],
  },
};
const methods = {
  DOMRect: async function (e) {
    await browser.tabs.executeScript(tab.id, {
      code: ` (function() {
        Object.defineProperty(DOMRect.prototype, e, {
          get: new Proxy(
            Object.getOwnPropertyDescriptor(DOMRect.prototype, e).get,
            {
              get(target, p, receiver) {
                return target;
              },
              apply(target, self, args) {
                const result = Reflect.apply(target, self, args);
                const _result =
                  result *
                  (1 +
                    (Math.random() <
                    ${config.noise[settings.noiseLevel]}
                      ? -1
                      : +1) *
                      ${config.noise.DOMRect});
                return _result;
              },
            }
          ),
        });
        Object.defineProperty(DOMRect.prototype, e, {
          get: Object.getOwnPropertyDescriptor(DOMRect.prototype, e).get,
        });  
        })();
        `,
      runAt: "document_start",
    });
  },
  DOMRectReadOnly: async function (e) {
    await browser.tabs.executeScript(tab.id, {
      code: `(function() {
        Object.defineProperty(DOMRectReadOnly.prototype, e, {
          get: new Proxy(
            Object.getOwnPropertyDescriptor(DOMRectReadOnly.prototype, e).get,
            {
              get(target, p, receiver) {
                return target;
              },
              apply(target, self, args) {
                const result = Reflect.apply(target, self, args);
                const _result =
                  result *
                  (1 +
                    (Math.random() <
                    ${config.noise[settings.noiseLevel]}
                      ? -1
                      : +1) *
                      ${config.noise.DOMRectReadOnly});
                return _result;
              },
            }
          ),
        });
        Object.defineProperty(DOMRectReadOnly.prototype, e, {
          get: Object.getOwnPropertyDescriptor(DOMRectReadOnly.prototype, e).get,
        });
      })();
        `,
      runAt: "document_start",
    });
  },
};

async function applyClientRectsSpoofing(tab) {
  if (tab.url.indexOf("about:") < 0 && settings.clientRectsSpoofing) {
    log.info(`Applying applyClientRectsSpoofing spoofing for tab ${tab.id}`);
    try {
      methods.DOMRect();
      methods.DOMRectReadOnly();
    } catch (error) {
      log.error(`Failed to apply canvas spoofing for tab ${tab.id}:`, error);
    }
  }
}

function setupTabListeners() {
  browser.tabs.onCreated.addListener((tab) => {
    applyClientRectsSpoofing(tab);
  });

  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "loading") {
      applyClientRectsSpoofing(tab);
    }
  });
}

// Initialize
setupTabListeners();

module.exports = {
  applyClientRectsSpoofing,
};

module.exports = applyClientRectsSpoofing;
