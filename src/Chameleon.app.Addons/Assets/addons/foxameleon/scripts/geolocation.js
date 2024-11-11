(function () {
  const settings = window.__myAddonSettings__;
  if (!settings.enabled || !settings.geoSpoofing) return;

  navigator.geolocation = navigator.geolocation || {
    getCurrentPosition() {},
    watchPosition() {},
  };

  {
    class PositionError extends Error {
      constructor(code, message) {
        super();
        this.code = code;
        this.message = message;
      }
    }
    PositionError.PERMISSION_DENIED = 1;
    PositionError.POSITION_UNAVAILABLE = 2;
    PositionError.TIMEOUT = 3;

    let id = 0;
    const lazy = {
      geos: [],
      permissions: [],
    };

    const matchURL = (url, pattern) => {
      const patternParts = pattern.split("://");
      const urlParts = url.split("://");

      if (patternParts.length !== urlParts.length) {
        return false;
      }

      if (patternParts[0] !== "*" && patternParts[0] !== urlParts[0]) {
        return false;
      }

      const patternSegments = patternParts[1].split("/");
      const urlSegments = urlParts[1].split("/");

      if (patternSegments.length > urlSegments.length) {
        return false;
      }

      for (let i = 0; i < patternSegments.length; i++) {
        const patternSegment = patternSegments[i];
        const urlSegment = urlSegments[i];

        if (patternSegment === "*") {
          continue;
        }

        if (patternSegment !== urlSegment) {
          return false;
        }
      }

      return true;
    };

    const bypass = (prefs) => {
      for (let host of prefs.bypass) {
        try {
          // fix the formatting
          if (host.includes("://") === false) {
            host = "*://" + host;
          }
          if (host.endsWith("*") === false && host.endsWith("/") === false) {
            host += "/*";
          }

          if (typeof self.URLPattern === "undefined") {
            if (matchURL(location.href, host)) {
              return true;
            }
          } else {
            const pattern = new self.URLPattern(host);
            const v = pattern.test(location.href);

            if (v) {
              return true;
            }
          }
        } catch (e) {
          console.info("Cannot use this host matching rule", host);
        }
      }
      return false;
    };

    navigator.geolocation.getCurrentPosition = new Proxy(
      navigator.geolocation.getCurrentPosition,
      {
        apply(target, self, args) {
          if (settings.randomizeGeo) {
            try {
              const m = settings.latitude.toString().split(".")[1].length;
              settings.latitude =
                settings.latitude +
                (Math.random() > 0.5 ? 1 : -1) *
                  settings.randomizeGeo *
                  Math.random();
              settings.latitude = Number(settings.latitude.toFixed(m));

              const n = settings.longitude.toString().split(".")[1].length;
              settings.longitude =
                settings.longitude +
                (Math.random() > 0.5 ? 1 : -1) *
                  settings.randomizeGeo *
                  Math.random();
              settings.longitude = Number(settings.longitude.toFixed(n));
            } catch (e) {
              console.warn("Cannot randomize GEO", e);
            }
          }

          if (settings.latitude === -1) {
            settings.latitude = undefined;
          }
          if (settings.longitude === -1) {
            settings.longitude = undefined;
          }
          // bypass
          if (bypass(settings)) {
            Reflect.apply(target, self, args);
          } else {
            try {
              const [success, error] = args;
              if (settings.latitude && settings.longitude) {
                success({
                  timestamp: Date.now(),
                  coords: {
                    latitude: settings.latitude,
                    longitude: settings.longitude,
                    altitude: null,
                    accuracy: settings.accuracy,
                    altitudeAccuracy: null,
                    heading: parseInt("NaN", 10),
                    velocity: null,
                  },
                });
              } else {
                error(
                  new PositionError(
                    PositionError.POSITION_UNAVAILABLE,
                    "Position unavailable"
                  )
                );
              }
            } catch (e) {
              console.warn("ERROR SETTING GEO", e);
            }
          }
        },
      }
    );

    navigator.geolocation.watchPosition = new Proxy(
      navigator.geolocation.watchPosition,
      {
        apply(target, self, args) {
          navigator.geolocation.getCurrentPosition(...args);
          id += 1;
          return id;
        },
      }
    );

    navigator.permissions.query = new Proxy(navigator.permissions.query, {
      apply(target, self, args) {
        return Reflect.apply(target, self, args).then((result) => {
          if (args[0] && args[0].name === "geolocation") {
            return new Promise((resolve) => {
              try {
                if (!bypass(settings)) {
                  Object.defineProperty(result, "state", {
                    value: "granted",
                  });
                }
                resolve(result);
              } catch (e) {}
            });
          } else {
            return result;
          }
        });
      },
    });
  }
})();
