const { settings } = require('./settings.js');

const rectspoof = {
  clientRects: {
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
    method: {
      DOMRect: function (e) {
        try {
          Object.defineProperty(DOMRect.prototype, e, {
            get: new Proxy(
              Object.getOwnPropertyDescriptor(DOMRect.prototype, e).get,
              {
                get(target, p, receiver) {
                  return target;
                },
                apply(target, self, args) {
                  const result = Reflect.apply(target, self, args);
                  if (!settings.enabled || !settings.clientRectsSpoofing)
                    return result;
                  //
                  const _result =
                    result *
                    (1 +
                      (Math.random() <
                      rectspoof.clientRects.noise[settings.noiseLevel]
                        ? -1
                        : +1) *
                        rectspoof.clientRects.noise.DOMRect);
                  return _result;
                },
              }
            ),
          });
          //
          Object.defineProperty(DOMRect.prototype, e, {
            get: Object.getOwnPropertyDescriptor(DOMRect.prototype, e).get,
          });
        } catch (e) {
          log.error(e);
        }
      },
      DOMRectReadOnly: function (e) {
        try {
          Object.defineProperty(DOMRectReadOnly.prototype, e, {
            get: new Proxy(
              Object.getOwnPropertyDescriptor(
                DOMRectReadOnly.prototype,
                e
              ).get,
              {
                get(target, p, receiver) {
                  return target;
                },
                apply(target, self, args) {
                  const result = Reflect.apply(target, self, args);
                  if (!settings.enabled || !settings.clientRectsSpoofing)
                    return result;
                  //
                  const _result =
                    result *
                    (1 +
                      (Math.random() <
                      rectspoof.clientRects.noise[settings.noiseLevel]
                        ? -1
                        : +1) *
                        rectspoof.clientRects.noise.DOMRectReadOnly);
                  return _result;
                },
              }
            ),
          });
          //
          Object.defineProperty(DOMRectReadOnly.prototype, e, {
            get: Object.getOwnPropertyDescriptor(DOMRectReadOnly.prototype, e)
              .get,
          });
        } catch (e) {
          log.error(e);
        }
      },
    },
  },
};

const clientRectsSpoofing = {
  apply: function () {
    if (settings.clientRectsSpoofing) {
      // Spoofing of DOMRect
      {
        const metrics = ["x", "y", "width", "height"];
        for (let i = 0; i < metrics.length; i++) {
          rectspoof.clientRects.method.DOMRect(metrics[i]);
        }
      }

      // Spoofing of DOMRectReadOnly
      {
        const metrics = ["top", "right", "bottom", "left"];
        for (let i = 0; i < metrics.length; i++) {
          rectspoof.clientRects.method.DOMRectReadOnly(metrics[i]);
        }
      }
    }
  }
};

module.exports = clientRectsSpoofing;
