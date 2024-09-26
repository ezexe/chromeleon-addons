const { settings } = require("./settings.js");

const glspoof = {
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
          if (srcData instanceof ArrayBuffer || ArrayBuffer.isView(srcData)) {
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
              if (glspoof.random.value() < noiseFrequency) {
                const value = dataView.getFloat32(i, true);
                const noise =
                  noiseAmplitude * (glspoof.random.value() * 2 - 1) * value;
                dataView.setFloat32(i, value + noise, true);
              }
            }
          }
        } catch (error) {
          log.error("Error in bufferData spoofing", error);
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
          session.spoofedValues[args[0]] = glspoof.random.number([14, 15]);
        else if (args[0] === 36347)
          session.spoofedValues[args[0]] = glspoof.random.number([12, 13]);
        else if (args[0] === 34076)
          session.spoofedValues[args[0]] = glspoof.random.number([14, 15]);
        else if (args[0] === 34024)
          session.spoofedValues[args[0]] = glspoof.random.number([14, 15]);
        else if (args[0] === 3386)
          session.spoofedValues[args[0]] = glspoof.random.int([13, 14, 15]);
        else if (args[0] === 3413)
          session.spoofedValues[args[0]] = glspoof.random.number([1, 2, 3, 4]);
        else if (args[0] === 3412)
          session.spoofedValues[args[0]] = glspoof.random.number([1, 2, 3, 4]);
        else if (args[0] === 3411)
          session.spoofedValues[args[0]] = glspoof.random.number([1, 2, 3, 4]);
        else if (args[0] === 3410)
          session.spoofedValues[args[0]] = glspoof.random.number([1, 2, 3, 4]);
        else if (args[0] === 34047)
          session.spoofedValues[args[0]] = glspoof.random.number([1, 2, 3, 4]);
        else if (args[0] === 34930)
          session.spoofedValues[args[0]] = glspoof.random.number([1, 2, 3, 4]);
        else if (args[0] === 34921)
          session.spoofedValues[args[0]] = glspoof.random.number([1, 2, 3, 4]);
        else if (args[0] === 35660)
          session.spoofedValues[args[0]] = glspoof.random.number([1, 2, 3, 4]);
        else if (args[0] === 35661)
          session.spoofedValues[args[0]] = glspoof.random.number([
            4, 5, 6, 7, 8,
          ]);
        else if (args[0] === 36349)
          session.spoofedValues[args[0]] = glspoof.random.number([
            10, 11, 12, 13,
          ]);
        else if (args[0] === 33902)
          session.spoofedValues[args[0]] = glspoof.random.float([
            0, 10, 11, 12, 13,
          ]);
        else if (args[0] === 33901)
          session.spoofedValues[args[0]] = glspoof.random.float([
            0, 10, 11, 12, 13,
          ]);
        else if (args[0] === 37446)
          session.spoofedValues[args[0]] = glspoof.random.item([
            "Graphics",
            "HD Graphics",
            "Intel(R) HD Graphics",
          ]);
        else if (args[0] === 7938)
          session.spoofedValues[args[0]] = glspoof.random.item([
            "WebGL 1.0",
            "WebGL 1.0 (OpenGL)",
            "WebGL 1.0 (OpenGL Chromium)",
          ]);
        else if (args[0] === 35724)
          session.spoofedValues[args[0]] = glspoof.random.item([
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

          switch (glspoof.level) {
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

          if (glspoof.random.value() < threshold) {
            return null;
          }
        } catch (error) {
          log.error("Error in getExtension spoofing", error);
        }
        return Reflect.apply(target, self, args);
      },
    });
  },
};

const webglSpoofing = {
  apply: function (target) {
    if (settings.webglSpoofing) {
      [WebGLRenderingContext, WebGL2RenderingContext].forEach((context) => {
        glspoof.buffer(context);
        // config.webgl.parameter(context);
        // config.webgl.extension(context);
      });
    }
  },
};

module.exports = webglSpoofing;
