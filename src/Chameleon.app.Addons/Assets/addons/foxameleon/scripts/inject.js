(async () => {
  "use strict";
  const SETTINGS_ARRAY = [
    "enabled",
    "webglSpoofing",
    "canvasProtection",
    "clientRectsSpoofing",
    "fontsSpoofing",
    "geoSpoofing",
    "timezoneSpoofing",
    "dAPI",
    "webRtcEnabled",
    "randomizeTZ",
    "randomizeGeo",
    "noiseLevel",
    "eMode",
    "dMode",
    "timezone",
    "locale",
    "debug",
    "latitude",
    "longitude",
    "accuracy",
    "myIP",
    "bypass",
    "history",
  ];

  let settings = {
    enabled: true,
    webglSpoofing: true,
    canvasProtection: true,
    clientRectsSpoofing: true,
    fontsSpoofing: true,
    geoSpoofing: true,
    timezoneSpoofing: true,
    webRtcEnabled: true,
    dAPI: true,
    myIP: false,
    randomizeTZ: false,
    randomizeGeo: false,
    noiseLevel: "medium",
    eMode: "proxy_only",
    dMode: "default_public_interface_only",
    timezone: "America/Los_Angeles",
    locale: "en-US",
    debug: 4,
    latitude: 48.856892,
    longitude: 2.350850,
    accuracy: 69.96,
    bypass: [],
    history: [],
  };
  
  let script = document.createElement("script");
  Object.assign(script.dataset, settings);

  // Geolocation spoofing
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
          chrome.storage.local.set(settings);

          applyGeoSettings();
        } catch (e) {
          console.error(e);
          applyGeoSettings();
          alert("GEO Request Denied\n\n" + e.message);
        }
      }
    }
  });

  // Timezone spoofing
  if(settings.timezoneSpoofing) {
  const shiftedDate = `{
    const OriginalDate = Date;
  
    const updates = []; // update this.#ad of each Date object
    // prefs
    const prefs = new Proxy({
      timezone: 'Etc/GMT',
      offset: 0
    }, {
      set(target, prop, value) {
        target[prop] = value;
        if (prop === 'offset') {
          updates.forEach(c => c());
        }
        return true;
      }
    });
  
    class SpoofDate extends Date {
      #ad; // adjusted date
  
      #sync() {
        const offset = (prefs.offset + super.getTimezoneOffset());
        this.#ad = new OriginalDate(this.getTime() + offset * 60 * 1000);
      }
  
      constructor(...args) {
        super(...args);
  
        updates.push(() => this.#sync());
        this.#sync();
      }
      getTimezoneOffset() {
        return prefs.offset;
      }
      /* to string (only supports en locale) */
      toTimeString() {
        if (isNaN(this)) {
          return super.toTimeString();
        }
  
        const parts = super.toLocaleString.call(this, 'en', {
          timeZone: prefs.timezone,
          timeZoneName: 'longOffset'
        }).split('GMT');
  
        if (parts.length !== 2) {
          return super.toTimeString();
        }
  
        const a = 'GMT' + parts[1].replace(':', '');
  
        const b = super.toLocaleString.call(this, 'en', {
          timeZone: prefs.timezone,
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
      toLocaleDateString(...args) {
        args[1] = args[1] || {};
        args[1].timeZone = args[1].timeZone || prefs.timezone;
  
        return super.toLocaleDateString(...args);
      }
      toLocaleTimeString(...args) {
        args[1] = args[1] || {};
        args[1].timeZone = args[1].timeZone || prefs.timezone;
  
        return super.toLocaleTimeString(...args);
      }
      toLocaleString(...args) {
        args[1] = args[1] || {};
        args[1].timeZone = args[1].timeZone || prefs.timezone;
  
        return super.toLocaleString(...args);
      }
      /* get */
      #get(name, ...args) {
        return super[name].call(this.#ad, ...args);
      }
      getDate(...args) {
        return this.#get('getDate', ...args);
      }
      getDay(...args) {
        return this.#get('getDay', ...args);
      }
      getHours(...args) {
        return this.#get('getHours', ...args);
      }
      getMinutes(...args) {
        return this.#get('getMinutes', ...args);
      }
      getMonth(...args) {
        return this.#get('getMonth', ...args);
      }
      getYear(...args) {
        return this.#get('getYear', ...args);
      }
      getFullYear(...args) {
        return this.#get('getFullYear', ...args);
      }
      /* set */
      #set(type, name, args) {
        if (type === 'ad') {
          const n = this.#ad.getTime();
          const r = this.#get(name, ...args);
  
          return super.setTime(this.getTime() + r - n);
        }
        else {
          const r = super[name](...args);
          this.#sync();
  
          return r;
        }
      }
      setHours(...args) {
        return this.#set('ad', 'setHours', args);
      }
      setMinutes(...args) {
        return this.#set('ad', 'setMinutes', args);
      }
      setMonth(...args) {
        return this.#set('ad', 'setMonth', args);
      }
      setDate(...args) {
        return this.#set('ad', 'setDate', args);
      }
      setYear(...args) {
        return this.#set('ad', 'setYear', args);
      }
      setFullYear(...args) {
        return this.#set('ad', 'setFullYear', args);
      }
      setTime(...args) {
        return this.#set('md', 'setTime', args);
      }
      setUTCDate(...args) {
        return this.#set('md', 'setUTCDate', args);
      }
      setUTCFullYear(...args) {
        return this.#set('md', 'setUTCFullYear', args);
      }
      setUTCHours(...args) {
        return this.#set('md', 'setUTCHours', args);
      }
      setUTCMinutes(...args) {
        return this.#set('md', 'setUTCMinutes', args);
      }
      setUTCMonth(...args) {
        return this.#set('md', 'setUTCMonth', args);
      }
    }
  
    /* prefs */
    {
      const script = document.currentScript;
      const update = () => {
        prefs.timezone = script.dataset.timezone;
        prefs.offset = parseInt(script.dataset.offset);
      };
      update();
      script.addEventListener('change', update);
    }
  
    /* override */
    self.Date = SpoofDate;
    self.Date = new Proxy(Date, {
      apply(target, self, args) {
        return new SpoofDate(...args);
      }
    });
  }`;
  
  const intl = `{
    const DateTimeFormat = Intl.DateTimeFormat;
    const script = document.currentScript;
  
    class SpoofDateTimeFormat extends Intl.DateTimeFormat {
      constructor(...args) {
        if (!args[1]) {
          args[1] = {};
        }
        if (!args[1].timeZone) {
          args[1].timeZone = script.dataset.timezone;
        }
  
        super(...args);
      }
    }
    Intl.DateTimeFormat = SpoofDateTimeFormat;
  
    Intl.DateTimeFormat = new Proxy(Intl.DateTimeFormat, {
      apply(target, self, args) {
        return new Intl.DateTimeFormat(...args);
      }
    });
  }`;
  
  script.textContent += `
${shiftedDate}
${intl}
`;
  }

  // WebRTC protection
  if (settings.webRtcEnabled) {
    const webRTCScript = `{
  const script = document.currentScript;
  const enumerateDevices = navigator.mediaDevices.enumerateDevices;
  Object.defineProperty(navigator.mediaDevices, 'enumerateDevices', {
    value: () => new Promise(resolve => {
      if (script.dataset.dAPI === 'true' && script.dataset.enabled === 'true') {
        resolve([]);
      }
      else {
        resolve(enumerateDevices.call(navigator.mediaDevices));
      }
    })
  });
}`;
    script.textContent += webRTCScript;
  }

  // WebGL spoofing
  if (settings.webglSpoofing) {
    const webGLScript = `
    {
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(contextType, ...args) {
        const context = getContext.call(this, contextType, ...args);
        if (contextType === 'webgl' || contextType === 'experimental-webgl') {
          const getParameter = context.getParameter;
          context.getParameter = function(parameter) {
            // Spoof some WebGL parameters
            if (parameter === this.VENDOR) {
              return 'Spoofed Vendor';
            }
            if (parameter === this.RENDERER) {
              return 'Spoofed Renderer';
            }
            return getParameter.call(this, parameter);
          };
        }
        return context;
      };
    }
  `;
    script.textContent += webGLScript;
  }

  // Canvas protection
  if (settings.canvasProtection) {
    const canvasProtectionScript = `
    {
      const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function(type) {
        if (type === 'image/png' && this.width > 16 && this.height > 16) {
          const context = this.getContext('2d');
          const imageData = context.getImageData(0, 0, this.width, this.height);
          for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] = imageData.data[i] ^ 1;
          }
          context.putImageData(imageData, 0, 0);
        }
        return originalToDataURL.apply(this, arguments);
      };
    }
  `;
    script.textContent += canvasProtectionScript;
  }

  // Client rects spoofing
  if (settings.clientRectsSpoofing) {
    const clientRectsScript = `
    {
      const originalGetClientRects = Element.prototype.getClientRects;
      const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;

      Element.prototype.getClientRects = function() {
        const rects = originalGetClientRects.call(this);
        for (let i = 0; i < rects.length; i++) {
          rects[i].x += (Math.random() - 0.5) * 0.01;
          rects[i].y += (Math.random() - 0.5) * 0.01;
          rects[i].width += (Math.random() - 0.5) * 0.01;
          rects[i].height += (Math.random() - 0.5) * 0.01;
        }
        return rects;
      };

      Element.prototype.getBoundingClientRect = function() {
        const rect = originalGetBoundingClientRect.call(this);
        rect.x += (Math.random() - 0.5) * 0.01;
        rect.y += (Math.random() - 0.5) * 0.01;
        rect.width += (Math.random() - 0.5) * 0.01;
        rect.height += (Math.random() - 0.5) * 0.01;
        return rect;
      };
    }
  `;
    script.textContent += clientRectsScript;
  }

  // Fonts spoofing
  if (settings.fontsSpoofing) {
    const fontsSpoofingScript = `
    {
      const originalMeasureText = CanvasRenderingContext2D.prototype.measureText;
      CanvasRenderingContext2D.prototype.measureText = function(text) {
        const metrics = originalMeasureText.call(this, text);
        metrics.width += (Math.random() - 0.5) * 0.01;
        return metrics;
      };
    }
  `;
    script.textContent += fontsSpoofingScript;
  }


  // Inject the script into the page
  document.documentElement.append(script);
  script.remove();

  script = document.createElement('script');
  script.src = URL.createObjectURL(new Blob([ script.textContent], { type: 'text/javascript' }));
  (document.head || document.documentElement).appendChild(script);
  try {
    URL.revokeObjectURL(script.src);
  } catch (e) {}
  script.remove();
})();
