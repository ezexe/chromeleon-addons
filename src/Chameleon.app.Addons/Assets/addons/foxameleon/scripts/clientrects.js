(function () {
  //https://privacycheck.sec.lrz.de/active/fp_gcr/fp_getclientrects.html#fpGetClientRects
  const settings = window.__myAddonSettings__;
  if(!settings.enabled || !settings.clientRectsSpoofing)
    return;

  const noiseLevels = {
    micro: 0.1,
    mini: 0.2,
    low: 0.3,
    medium: 0.4,
    bold: 0.5,
    high: 0.6,
    ultra: 0.7,
    super: 0.8,
    max: 0.9,
  }

  const metrics = {
    DOMRect: ["x", "y", "width", "height"],
    DOMRectReadOnly: ["top", "right", "bottom", "left"],
  }

  let methods = {
    DOMRect: function (e) {
      try {
        Object.defineProperty(DOMRect.prototype, e, {
          get: new Proxy(
            Object.getOwnPropertyDescriptor(DOMRect.prototype, e).get,
            {
              apply(target, self, args) {
                const result = Reflect.apply(target, self, args);
                return result * settings.DOMRectnoise;
              },
            }
          ),
        });
      } catch (e) {
        console.error(e);
      }
    },
    DOMRectReadOnly: function (e) {
      try {
        Object.defineProperty(DOMRectReadOnly.prototype, e, {
          get: new Proxy(
            Object.getOwnPropertyDescriptor(DOMRectReadOnly.prototype, e).get,
            {
              apply(target, self, args) {
                const result = Reflect.apply(target, self, args);
                return result * settings.DOMRectReadOnlynoise;
              },
            }
          ),
        });
      } catch (e) {
        console.error(e);
      }
    },
  };

  methods.DOMRect(
    metrics.DOMRect.sort(() =>
      settings.randomRectsSpoofing
        ? 0.5 - Math.random()
        : noiseLevels[settings.noiseLevel]
    )[0]
  );
  methods.DOMRectReadOnly(
    metrics.DOMRectReadOnly.sort(() =>
      settings.randomRectsSpoofing
        ? 0.5 - Math.random()
        : noiseLevels[settings.noiseLevel]
    )[0]
  );

  if (window.DOMRect) {
    for (let i = 0; i < metrics.DOMRect.length; i++) {
      Object.defineProperty(window.DOMRect.prototype, metrics.DOMRect[i], {
        get: Object.getOwnPropertyDescriptor(
          DOMRect.prototype,
          metrics.DOMRect[i]
        ).get,
      });
    }
  }

  if (window.DOMRectReadOnly) {
    for (let i = 0; i < metrics.DOMRectReadOnly.length; i++) {
      Object.defineProperty(window.DOMRectReadOnly.prototype, metrics.DOMRectReadOnly[i], {
        get: Object.getOwnPropertyDescriptor(
          DOMRectReadOnly.prototype, 
          metrics.DOMRectReadOnly[i]
        ).get,
      });
    }
  }
})();