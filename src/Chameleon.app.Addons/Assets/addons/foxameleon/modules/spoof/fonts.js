const { settings } = require("../settings.js");
const { log } = require("../logger.js");

const config = {
  noise: {
    low: 0.3,
    medium: 0.5,
    high: 0.8,
  },
};

const methods = {
  offsetHeight: async function (tab) {
    await browser.tabs.executeScript(tab.id, {
      code: `
        (function() {
          Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
            get: new Proxy(
              Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight").get,
              {
                get(target, p, receiver) {
                  return target;
                },
                apply(target, self, args) {
                  const height = Math.floor(self.getBoundingClientRect().height);
                  const noise = (Math.random() < ${config.noise[settings.noiseLevel]} ? -1 : +1) * Math.floor(Math.random() * 2);
                  return height + noise;
                },
              }
            ),
          });
        })();
      `,
      runAt: "document_start",
    });
  },
  offsetWidth: async function (tab) {
    await browser.tabs.executeScript(tab.id, {
      code: `
        (function() {
          Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
            get: new Proxy(
              Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth").get,
              {
                get(target, p, receiver) {
                  return target;
                },
                apply(target, self, args) {
                  const width = Math.floor(self.getBoundingClientRect().width);
                  const noise = (Math.random() < ${config.noise[settings.noiseLevel]} ? -1 : +1) * Math.floor(Math.random() * 2);
                  return width + noise;
                },
              }
            ),
          });
        })();
      `,
      runAt: "document_start",
    });
  },
};

async function applyFontsSpoofing(tab) {
  if (tab.url.indexOf("about:") < 0 && settings.fontsSpoofing) {
    log.info(`Applying fonts spoofing for tab ${tab.id}`);
    try {
      await methods.offsetHeight(tab);
      await methods.offsetWidth(tab);
    } catch (error) {
      log.error(`Failed to apply fonts spoofing for tab ${tab.id}:`, error);
    }
  }
}

function setupTabListeners() {
  browser.tabs.onCreated.addListener((tab) => {
    applyFontsSpoofing(tab);
  });

  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "loading") {
      applyFontsSpoofing(tab);
    }
  });
}

// Initialize
setupTabListeners();

module.exports = {
  applyFontsSpoofing,
};
