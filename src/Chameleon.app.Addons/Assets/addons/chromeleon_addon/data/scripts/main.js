{
  let loaded = false;

  const createLogger = () => ({
    log: (message, ...args) =>
      console.log(`[Chromeleon Defender] ${message}`, ...args),
    error: (message, ...args) =>
      console.error(`[Chromeleon Defender] ${message}`, ...args),
    warn: (message, ...args) =>
      console.warn(`[Chromeleon Defender] ${message}`, ...args),
    info: (message, ...args) =>
      console.info(`[Chromeleon Defender] ${message}`, ...args),
  });
  const logger = createLogger();

  // Defining the settings object with default values
  let settings = {
    enabled: true,
    webglSpoofing: true,
    canvasProtection: true,
    clientRectsSpoofing: true,
    fontsSpoofing: true,
    geoSpoofing: true,
    timezoneSpoofing: true,
    dAPI: true,
    eMode: "disable_non_proxied_udp",
    dMode: "default_public_interface_only",
    noiseLevel: "medium",
    debug: true,
  };

  // Session object to store spoofed values
  const session = {
    spoofedValues: {},
  };

  // Configuration for the randomization of values
  const config = {
    random: {
      seed: Math.floor(Math.random() * 1000000),
      noise: {
        DOMRect: 0.00000001,
        DOMRectReadOnly: 0.000001,
      },
      metrics: {
        DOMRect: ["x", "y", "width", "height"],
        DOMRectReadOnly: ["top", "right", "bottom", "left"],
      },
      value: function () {
        config.random.seed = (config.random.seed * 9301 + 49297) % 233280;
        return config.random.seed / 233280;
      },
      item: function (e) {
        let rand = e.length * config.random.value();
        return e[Math.floor(rand)];
      },
      number: function (power) {
        let tmp = [];
        for (let i = 0; i < power.length; i++) {
          tmp.push(Math.pow(2, power[i]));
        }
        return config.random.item(tmp);
      },
      int: function (power) {
        let tmp = [];
        for (let i = 0; i < power.length; i++) {
          let n = Math.pow(2, power[i]);
          tmp.push(new Int32Array([n, n]));
        }
        return config.random.item(tmp);
      },
      float: function (power) {
        let tmp = [];
        for (let i = 0; i < power.length; i++) {
          let n = Math.pow(2, power[i]);
          tmp.push(new Float32Array([1, n]));
        }
        return config.random.item(tmp);
      },
    },
    webgl: {
      buffer: function (target) {
        let proto = target.prototype ? target.prototype : target.__proto__;
        //
        proto.bufferData = new Proxy(proto.bufferData, {
          get(target, p, receiver) {
            return target;
          },
          apply(target, self, args) {
            try {
              const [target, srcData, usage] = args;
              if (
                srcData instanceof ArrayBuffer ||
                ArrayBuffer.isView(srcData)
              ) {
                const length = srcData.byteLength;
                const dataView = new DataView(srcData.buffer || srcData);
                for (let i = 0; i < length; i += 4) {
                  const noiseFrequency =
                    settings.noiseLevel === "high"
                      ? 1
                      : settings.noiseLevel === "medium"
                      ? 0.5
                      : 0.1;
                  const noiseAmplitude =
                    settings.noiseLevel === "high"
                      ? 0.01
                      : settings.noiseLevel === "medium"
                      ? 0.001
                      : 0.0001;
                  if (config.random.value() < noiseFrequency) {
                    const value = dataView.getFloat32(i, true);
                    const noise =
                      noiseAmplitude * (config.random.value() * 2 - 1) * value;
                    dataView.setFloat32(i, value + noise, true);
                  }
                }
              }
            } catch (error) {
              logger.error("Error in bufferData spoofing", error);
            }
            return Reflect.apply(target, self, args);
          },
        });
      },
      parameter: function (target) {
        let proto = target.prototype ? target.prototype : target.__proto__;
        //
        proto.getParameter = new Proxy(proto.getParameter, {
          get(target, p, receiver) {
            return target;
          },
          apply(target, self, args) {
            window.top.postMessage("webgl-defender-alert", "*");
            //
            if (args[0] === 3415) return 0;
            else if (args[0] === 3414) return 24;
            else if (args[0] === 36348) return 30;
            else if (args[0] === 7936) return "WebKit";
            else if (args[0] === 37445) return "Google Inc.";
            else if (args[0] === 7937) return "WebKit WebGL";
            else if (args[0] === 3379)
              session.spoofedValues[args[0]] = config.random.number([14, 15]);
            else if (args[0] === 36347)
              session.spoofedValues[args[0]] = config.random.number([12, 13]);
            else if (args[0] === 34076)
              session.spoofedValues[args[0]] = config.random.number([14, 15]);
            else if (args[0] === 34024)
              session.spoofedValues[args[0]] = config.random.number([14, 15]);
            else if (args[0] === 3386)
              session.spoofedValues[args[0]] = config.random.int([13, 14, 15]);
            else if (args[0] === 3413)
              session.spoofedValues[args[0]] = config.random.number([
                1, 2, 3, 4,
              ]);
            else if (args[0] === 3412)
              session.spoofedValues[args[0]] = config.random.number([
                1, 2, 3, 4,
              ]);
            else if (args[0] === 3411)
              session.spoofedValues[args[0]] = config.random.number([
                1, 2, 3, 4,
              ]);
            else if (args[0] === 3410)
              session.spoofedValues[args[0]] = config.random.number([
                1, 2, 3, 4,
              ]);
            else if (args[0] === 34047)
              session.spoofedValues[args[0]] = config.random.number([
                1, 2, 3, 4,
              ]);
            else if (args[0] === 34930)
              session.spoofedValues[args[0]] = config.random.number([
                1, 2, 3, 4,
              ]);
            else if (args[0] === 34921)
              session.spoofedValues[args[0]] = config.random.number([
                1, 2, 3, 4,
              ]);
            else if (args[0] === 35660)
              session.spoofedValues[args[0]] = config.random.number([
                1, 2, 3, 4,
              ]);
            else if (args[0] === 35661)
              session.spoofedValues[args[0]] = config.random.number([
                4, 5, 6, 7, 8,
              ]);
            else if (args[0] === 36349)
              session.spoofedValues[args[0]] = config.random.number([
                10, 11, 12, 13,
              ]);
            else if (args[0] === 33902)
              session.spoofedValues[args[0]] = config.random.float([
                0, 10, 11, 12, 13,
              ]);
            else if (args[0] === 33901)
              session.spoofedValues[args[0]] = config.random.float([
                0, 10, 11, 12, 13,
              ]);
            else if (args[0] === 37446)
              session.spoofedValues[args[0]] = config.random.item([
                "Graphics",
                "HD Graphics",
                "Intel(R) HD Graphics",
              ]);
            else if (args[0] === 7938)
              session.spoofedValues[args[0]] = config.random.item([
                "WebGL 1.0",
                "WebGL 1.0 (OpenGL)",
                "WebGL 1.0 (OpenGL Chromium)",
              ]);
            else if (args[0] === 35724)
              session.spoofedValues[args[0]] = config.random.item([
                "WebGL",
                "WebGL GLSL",
                "WebGL GLSL ES",
                "WebGL GLSL ES (OpenGL Chromium",
              ]);
            //
            if (session.spoofedValues[args[0]])
              return session.spoofedValues[args[0]];

            return Reflect.apply(target, self, args);
          },
        });
      },
      extension: function (target) {
        let proto = target.prototype ? target.prototype : target.__proto__;
        //
        proto.getParameter = new Proxy(proto.getParameter, {
          get(target, p, receiver) {
            return target;
          },
          apply(target, self, args) {
            try {
              var threshold;

              switch (config.level) {
                case "low":
                  threshold = 0.1; // 10% probability for light
                  break;
                case "medium":
                  threshold = 0.3; // 30% probability for medium
                  break;
                case "high":
                  threshold = 0.6; // 60% probability for heavy
                  break;
                default:
                  threshold = 0.3; // Default to medium if level is not specified
              }

              if (config.random.value() < threshold) {
                return null;
              }
            } catch (error) {
              logger.error("Error in getExtension spoofing", error);
            }
            return Reflect.apply(target, self, args);
          },
        });
      },
    },
    canvas: {
      toDataURL: function (target) {
        let proto = target.prototype ? target.prototype : target.__proto__;
        //
        proto.toDataURL = new Proxy(proto.toDataURL, {
          get(target, p, receiver) {
            return target;
          },
          apply(target, self, args) {
            try {
              const options = {
                willReadFrequently: true,
                desynchronized: true,
              };

              var contextTypes = [
                "2d",
                "webgl",
                "webgl2",
                "webgpu",
                "bitmaprenderer",
              ];
              var ctx = null;
              for (var i = 0; i < contextTypes.length; i++) {
                ctx = self.getContext(contextTypes[i], options);
                if (ctx) break;
              }
              if (ctx instanceof CanvasRenderingContext2D) {
                const imageData = ctx.getImageData(
                  0,
                  0,
                  self.width,
                  self.height
                );
                const noiseAmplitude =
                  settings.noiseLevel === "high"
                    ? 2
                    : settings.noiseLevel === "medium"
                    ? 1
                    : 0.5;

                for (let i = 0; i < imageData.data.length; i += 4) {
                  imageData.data[i] += Math.floor(
                    (Math.random() - 0.5) * noiseAmplitude * 2
                  ); // Red
                  imageData.data[i + 1] += Math.floor(
                    (Math.random() - 0.5) * noiseAmplitude * 2
                  ); // Green
                  imageData.data[i + 2] += Math.floor(
                    (Math.random() - 0.5) * noiseAmplitude * 2
                  ); // Blue
                }

                ctx.putImageData(imageData, 0, 0);
              } else if (
                ctx instanceof WebGLRenderingContext ||
                ctx instanceof WebGL2RenderingContext
              ) {
                const pixels = new Uint8Array(self.width * self.height * 4);
                ctx.readPixels(
                  0,
                  0,
                  self.width,
                  self.height,
                  ctx.RGBA,
                  ctx.UNSIGNED_BYTE,
                  pixels
                );

                const noiseAmplitude =
                  settings.noiseLevel === "high"
                    ? 2
                    : settings.noiseLevel === "medium"
                    ? 1
                    : 0.5;

                for (let i = 0; i < pixels.length; i += 4) {
                  pixels[i] += Math.floor(
                    (Math.random() - 0.5) * noiseAmplitude * 2
                  ); // Red
                  pixels[i + 1] += Math.floor(
                    (Math.random() - 0.5) * noiseAmplitude * 2
                  ); // Green
                  pixels[i + 2] += Math.floor(
                    (Math.random() - 0.5) * noiseAmplitude * 2
                  ); // Blue
                }

                // TODO: Optionally, you can write the modified pixels back to the canvas if needed
                // This requires creating a new texture or using a framebuffer
                // ctx.bindTexture(ctx.TEXTURE_2D, ctx.createTexture());
                // ctx.texImage2D(
                //   ctx.TEXTURE_2D,
                //   0,
                //   ctx.RGBA,
                //   self.width,
                //   self.height,
                //   0,
                //   ctx.RGBA,
                //   ctx.UNSIGNED_BYTE,
                //   pixels
                // );
              }
            } catch (error) {
              logger.error("Error in toDataURL spoofing", error);
            }
            return Reflect.apply(target, self, args);
          },
        });
      },
    },
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
                        config.clientRects.noise[settings.noiseLevel]
                          ? -1
                          : +1) *
                          config.clientRects.noise.DOMRect);
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
            logger.error(e);
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
                        config.clientRects.noise[settings.noiseLevel]
                          ? -1
                          : +1) *
                          config.clientRects.noise.DOMRectReadOnly);
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
            logger.error(e);
          }
        },
      },
    },
    fonts: {
      rand: {
        noise: function () {
          const SIGN = Math.random() < Math.random() ? -1 : 1;
          return Math.floor(Math.random() + SIGN * Math.random());
        },
        sign: function () {
          const tmp = [-1, -1, -1, -1, -1, -1, +1, -1, -1, -1];
          const index = Math.floor(Math.random() * tmp.length);
          return tmp[index];
        },
      },
      offsetHeight: function (target) {
        let proto = target.prototype ? target.prototype : target.__proto__;

        Object.defineProperty(proto, "offsetHeight", {
          get: new Proxy(
            Object.getOwnPropertyDescriptor(proto, "offsetHeight").get,
            {
              get(target, p, receiver) {
                return target;
              },
              apply(target, self, args) {
                //
                const height = Math.floor(self.getBoundingClientRect().height);
                const valid = height && config.fonts.rand.sign() === 1;
                const result = valid
                  ? height + config.fonts.rand.noise()
                  : height;
                //
                if (valid && result !== height) {
                  //window.top.postMessage("font-defender-alert", "*");
                }
                //
                return result;
              },
            }
          ),
        });
      },
      offsetWidth: function (target) {
        let proto = target.prototype ? target.prototype : target.__proto__;
        Object.defineProperty(proto, "offsetWidth", {
          get: new Proxy(
            Object.getOwnPropertyDescriptor(proto, "offsetWidth").get,
            {
              get(target, p, receiver) {
                return target;
              },
              apply(target, self, args) {
                //
                const width = Math.floor(self.getBoundingClientRect().width);
                const valid = width && config.fonts.rand.sign() === 1;
                const result = valid
                  ? width + config.fonts.rand.noise()
                  : width;
                //
                if (valid && result !== width) {
                  //window.top.postMessage("font-defender-alert", "*");
                }
                //
                return result;
              },
            }
          ),
        });
      },
    },
  };

  function applySettings() {
    if (!loaded) {
      logger.log("Settings not loaded yet");
      window.setTimeout(
        applySettings,
        10
      ); /* this checks the flag every 100 milliseconds*/
      return;
    }
    logger.log("Settings loaded");
    if (!settings.enabled) return;
    // Spoofing of fonts
    if (settings.fontsSpoofing) {
      config.fonts.offsetHeight(HTMLElement);
      config.fonts.offsetWidth(HTMLElement);
    }
    // Spoofing of WebGLRenderingContext and WebGL2RenderingContext
    if (settings.webglSpoofing) {
      [WebGLRenderingContext, WebGL2RenderingContext].forEach((context) => {
        config.webgl.buffer(context);
        // config.webgl.parameter(context);
        // config.webgl.extension(context);
      });
    }
    // Spoofing of CanvasRenderingContext2D
    if (settings.canvasProtection) config.canvas.toDataURL(HTMLCanvasElement);
    //
    if (navigator.mediaDevices?.enumerateDevices) {
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

    logger.log(`Settings applied ${JSON.stringify(settings)}`);
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
      if (e.data && e.data.type === "Chromeleon_DEFENDER_SETTINGS_RESPONSE") {
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
  window.postMessage({ type: "REQUEST_Chromeleon_DEFENDER_SETTINGS" }, "*");

  // Initial application of settings
  applySettings();
  applyFramedSettings();

  logger.log("Page context script loaded and active");

  // Timezone addon
  const port = document.getElementById('stz-obhgtd');
  port.remove();

  const OriginalDate = Date;

  // prefs
  const prefs = {
    updates: [] // update this.#ad of each Date object
  };
  Object.defineProperties(prefs, {
    'offset': {
      get() {
        return parseInt(port.dataset.offset);
      }
    },
    'timezone': {
      get() {
        return port.dataset.timezone;
      }
    }
  });
  port.addEventListener('change', () => prefs.updates.forEach(c => c()));

  /* Date Spoofing */

  class SpoofDate extends Date {
    #ad; // adjusted date

    #sync() {
      const offset = (prefs.offset + super.getTimezoneOffset());
      this.#ad = new OriginalDate(this.getTime() + offset * 60 * 1000);
    }

    constructor(...args) {
      super(...args);

      prefs.updates.push(() => this.#sync());
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

  /* override */
  self.Date = SpoofDate;
  self.Date = new Proxy(Date, {
    apply(target, self, args) {
      return new SpoofDate(...args);
    }
  });

  /* Intl Spoofing */
  class SpoofDateTimeFormat extends Intl.DateTimeFormat {
    constructor(...args) {
      if (!args[1]) {
        args[1] = {};
      }
      if (!args[1].timeZone) {
        args[1].timeZone = port.dataset.timezone;
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
}
