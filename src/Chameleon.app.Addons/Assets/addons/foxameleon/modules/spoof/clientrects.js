const rectsConfig = {
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
const rectsMethods = {
  DOMRect: async function (tab, e) {
    await browser.tabs.executeScript(tab.id, {
      code: ` (function() {
        let e = "${e}";
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
                    ${rectsConfig.noise[settings.noiseLevel]}
                      ? -1
                      : +1) *
                      ${rectsConfig.noise.DOMRect});
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
  DOMRectReadOnly: async function (tab, e) {
    await browser.tabs.executeScript(tab.id, {
      code: `(function() {
        let e = "${e}";
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
                    ${rectsConfig.noise[settings.noiseLevel]}
                      ? -1
                      : +1) *
                      ${rectsConfig.noise.DOMRectReadOnly});
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
        for (let i = 0; i < rectsConfig.metrics.DOMRect.length; i++) {
          rectsMethods.DOMRect(tab, rectsConfig.metrics.DOMRect[i]);
        }
        for (let i = 0; i < rectsConfig.metrics.DOMRectReadOnly.length; i++) {
          rectsMethods.DOMRectReadOnly(tab, rectsConfig.metrics.DOMRectReadOnly[i]);
        }
    } catch (error) {
      log.error(`Failed to apply canvas spoofing for tab ${tab.id}:`, error);
    }
  }
}
