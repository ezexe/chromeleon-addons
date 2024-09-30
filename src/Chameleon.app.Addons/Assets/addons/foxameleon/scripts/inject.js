(async () => {
  "use strict";

  let script = document.createElement("script");
  script.textContent = `
(function(){
    const inject = (spoofContext) => {
      if (spoofContext.CHAMELEON_SPOOF) return;

      spoofContext.CHAMELEON_SPOOF = "CHAMELEON_SPOOF";`

  // Geolocation spoofing
  if (settings.geoSpoofing) {
      script.addEventListener("sp-request-geo-data", () => {
          const geoSettings = {
              latitude: settings.latitude,
              longitude: settings.longitude,
              accuracy: settings.accuracy,
              enabled: settings.geoSpoofing,
              randomize: settings.randomizeGeo,
              bypass: settings.bypass,
          };

          const applyGeoSettings = () => {
              if (geoSettings.randomize) {
                  try {
                      const randomizeFactor =
                          typeof geoSettings.randomize === "number"
                              ? geoSettings.randomize
                              : 0.001;
                      const randomizeCoordinate = (coord) => {
                          const m = coord.toString().split(".")[1].length;
                          return Number(
                              (
                                  coord +
                                  (Math.random() > 0.5 ? 1 : -1) * randomizeFactor * Math.random()
                              ).toFixed(m)
                          );
                      };

                      geoSettings.latitude = randomizeCoordinate(geoSettings.latitude);
                      geoSettings.longitude = randomizeCoordinate(geoSettings.longitude);
                  } catch (e) {
                      console.warn("Cannot randomize GEO", e);
                  }
              }

              script.dataset.prefs = JSON.stringify(geoSettings);
              script.dispatchEvent(new Event("sp-response-geo-data"));
          };

          if (!geoSettings.enabled) {
              applyGeoSettings();
          } else if (geoSettings.latitude && geoSettings.longitude) {
              applyGeoSettings();
          } else {
              // Prompt for coordinates if not set
              const r = prompt(
                  `Enter your spoofed "latitude" and "longitude" (e.g. values for London, UK)

The number of digits to appear after the decimal point must be greater than 4
Use https://www.latlong.net/ to find these values`,
                  "51.507351, -0.127758"
              );

              if (r === null) {
                  applyGeoSettings();
              } else {
                  const [latitude, longitude] = r.split(/\s*,\s*/);

                  try {
                      if (!isFinite(latitude) || Math.abs(latitude) > 90) {
                          throw Error("Latitude must be a number between -90 and 90");
                      }
                      if (!isFinite(longitude) || Math.abs(longitude) > 180) {
                          throw Error("Longitude must a number between -180 and 180");
                      }
                      if (
                          latitude.split(".")[1].length < 4 ||
                          longitude.split(".")[1].length < 4
                      ) {
                          throw Error(
                              "The number of digits to appear after the decimal point must be greater than 4. Example: 51.507351, -0.127758"
                          );
                      }

                      geoSettings.latitude = Number(latitude);
                      geoSettings.longitude = Number(longitude);

                      // Update settings
                      settings.latitude = geoSettings.latitude;
                      settings.longitude = geoSettings.longitude;
                      browser.storage.sync.set(settings);

                      applyGeoSettings();
                  } catch (e) {
                      console.error(e);
                      applyGeoSettings();
                      alert("GEO Request Denied\n\n" + e.message);
                  }
              }
          }
      });
  }

  // Timezone spoofing
  if (settings.timezoneSpoofing) {
      script.textContent += `
if (new Date()[spoofContext.CHAMELEON_SPOOF]) {
  spoofContext.Date = Date;
  return;
}

let ORIGINAL_DATE = spoofContext.Date;

const {
  getDate, getDay, getFullYear, getHours, getMinutes, getMonth, getTime, getTimezoneOffset,
  setDate, setFullYear, setHours, setMinutes, setMilliseconds, setMonth, setSeconds,
  setTime, toDateString, toLocaleString, toLocaleDateString, toLocaleTimeString, toTimeString
} = ORIGINAL_DATE.prototype;

const calculateTzOffset = (timezone) => {
  const date = new Date();
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  return (utcDate.getTime() - tzDate.getTime()) / 60000;
};

const tzOffset = calculateTzOffset('${settings.timezone}');

class SpoofedDate extends ORIGINAL_DATE {
  #ad; // adjusted date
  #sync() {
    const offset = (${settings.tzOffset} + super.getTimezoneOffset());
    this.#ad = new ORIGINAL_DATE(this.getTime() + offset * 60 * 1000);
  }

  constructor(...args) {
    super(...args);
    const originalDate = new ORIGINAL_DATE(...args);
    this[spoofContext.CHAMELEON_SPOOF] = originalDate;

    this.#sync();
  }

  getTimezoneOffset() {
    return ${settings.tzOffset};
  }

  toTimeString() {
  if (isNaN(this)) {
      return super.toTimeString();
    }

    const parts = super.toLocaleString.call(this, 'en', {
      timeZone: '${settings.timezone}',
      timeZoneName: 'longOffset'
    }).split('GMT');

    if (parts.length !== 2) {
      return super.toTimeString();
    }

    const a = 'GMT' + parts[1].replace(':', '');

    const b = super.toLocaleString.call(this, 'en', {
      timeZone: '${settings.timezone}',
      timeZoneName: 'long'
    }).split(/(AM |PM )/i).pop();

    return super.toTimeString.apply(this.#ad).split(' GMT')[0] + ' ' + a + ' (' + b + ')';
  }

  /* only supports en locale */
  toDateString() {
    return super.toDateString.apply(this.#ad);
  }

  /* only supports en locale */
  toString() {
    if (isNaN(this)) {
      return super.toString();
    }
    return this.toDateString() + ' ' + this.toTimeString();
  }
}

spoofContext.Date = SpoofedDate;
`.replace(
          /ORIGINAL_DATE/g,
          String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
          Math.random()
              .toString(36)
              .substring(Math.floor(Math.random() * 5) + 5)
      );
  }

  // Client rects spoofing
  if (settings.clientRectsSpoofing) {
      const clientRectsScript = `
  {
    const rand = { 
        noise: {
        DOMRect: 0.1,
        DOMRectReadOnly: 0.1,
        low: 0.3,
        medium: 0.5,
        high: 0.8,
      },
      metrics: {
        DOMRect: ["x", "y", "width", "height"],
        DOMRectReadOnly: ["top", "right", "bottom", "left"],
      },
    };
    const noieMultiplier = rand.noise['${settings.noiseLevel}'];

    const originalGetClientRects = spoofContext.Element.prototype.getClientRects;
    const originalGetBoundingClientRect = spoofContext.Element.prototype.getBoundingClientRect;

    spoofContext.Element.prototype.getClientRects = function() {
      const rects = originalGetClientRects.call(this);
      for (let i = 0; i < rects.length; i++) {
        rects[i].x += (Math.random() - noieMultiplier) * 0.01;
        rects[i].y += (Math.random() - noieMultiplier) * 0.01;
        rects[i].width += (Math.random() - noieMultiplier) * 0.01;
        rects[i].height += (Math.random() - noieMultiplier) * 0.01;
      }
      return rects;
    };

    spoofContext.Element.prototype.getBoundingClientRect = function() {
      const rect = originalGetBoundingClientRect.call(this);
      rect.x += (Math.random() - noieMultiplier) * 0.01;
      rect.y += (Math.random() - noieMultiplier) * 0.01;
      rect.width += (Math.random() - noieMultiplier) * 0.01;
      rect.height += (Math.random() - noieMultiplier) * 0.01;
      return rect;
    };
    const domRectProto = spoofContext.DOMRect.prototype;
    const domRectReadOnlyProto = spoofContext.DOMRectReadOnly.prototype;
    const clientRects = {
        DOMRect: function (e) {
          try {
            Object.defineProperty(domRectProto, e, {
              get: new Proxy(
                Object.getOwnPropertyDescriptor(domRectProto, e).get,
                {
                  get(target, p, receiver) {
                    return target;
                  },
                  apply(target, self, args) {
                    const result = Reflect.apply(target, self, args);
                    //
                    const _result =
                      result *
                      (1 +
                        (Math.random() < noieMultiplier
                          ? -1
                          : +1) *
                          rand.noise.DOMRect);
                    return _result;
                  },
                }
              ),
            });
            //
            Object.defineProperty(domRectProto, e, {
              get: Object.getOwnPropertyDescriptor(domRectProto, e).get,
            });
          } catch (e) {
            console.error(e);
          }
        },
        DOMRectReadOnly: function (e) {
          try {
            Object.defineProperty(domRectReadOnlyProto, e, {
              get: new Proxy(
                Object.getOwnPropertyDescriptor(
                  domRectReadOnlyProto,
                  e
                ).get,
                {
                  get(target, p, receiver) {
                    return target;
                  },
                  apply(target, self, args) {
                    const result = Reflect.apply(target, self, args);
                    //
                    const _result =
                      result *
                      (1 +
                        (Math.random() < noieMultiplier
                          ? -1
                          : +1) *
                          rand.noise.DOMRectReadOnly);
                    return _result;
                  },
                }
              ),
            });
            //
            Object.defineProperty(domRectReadOnlyProto, e, {
              get: Object.getOwnPropertyDescriptor(domRectReadOnlyProto, e)
                .get,
            });
          } catch (e) {
            console.error(e);
          }
        },
    }; 
    
    //Spoofing of DOMRect
    {
      const metrics = ["x", "y", "width", "height"];
      for (let i = 0; i < metrics.length; i++) {
        clientRects.DOMRect(metrics[i]);
      }
    }

    // Spoofing of DOMRectReadOnly
    {
      const metrics = ["top", "right", "bottom", "left"];
      for (let i = 0; i < metrics.length; i++) {
        clientRects.DOMRectReadOnly(metrics[i]);
      }
    }
  }
`;
      script.textContent += clientRectsScript;
  }

  script.textContent += ` };

    inject(window);
  })()
  `
      .replace(/CHAMELEON_SPOOF/g, randObjName)
      .replace(
          /ORIGINAL_INTL/g,
          String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
          Math.random()
              .toString(36)
              .substring(Math.floor(Math.random() * 5) + 5)
      );
  // Inject the script into the page
  document.documentElement.append(script);
  script.remove();

  script = document.createElement('script');
  script.src = URL.createObjectURL(new Blob([script.textContent], { type: 'text/javascript' }));
  (document.head || document.documentElement).appendChild(script);
  try {
      URL.revokeObjectURL(script.src);
  } catch (e) { }
  script.remove();
})();
