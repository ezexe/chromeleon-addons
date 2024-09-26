import { config, session } from './config.js';

export const webglSpoofing = {
  buffer: function (target) {
    let proto = target.prototype ? target.prototype : target.__proto__;
    
    proto.bufferData = new Proxy(proto.bufferData, {
      apply(target, self, args) {
        try {
          const [target, srcData, usage] = args;
          if (srcData instanceof ArrayBuffer || ArrayBuffer.isView(srcData)) {
            const length = srcData.byteLength;
            const dataView = new DataView(srcData.buffer || srcData);
            for (let i = 0; i < length; i += 4) {
              const noiseFrequency = config.noiseLevel === "high" ? 1 : config.noiseLevel === "medium" ? 0.5 : 0.1;
              const noiseAmplitude = config.noiseLevel === "high" ? 0.01 : config.noiseLevel === "medium" ? 0.001 : 0.0001;
              if (config.random.value() < noiseFrequency) {
                const value = dataView.getFloat32(i, true);
                const noise = noiseAmplitude * (config.random.value() * 2 - 1) * value;
                dataView.setFloat32(i, value + noise, true);
              }
            }
          }
        } catch (error) {
          console.error("Error in bufferData spoofing", error);
        }
        return Reflect.apply(target, self, args);
      },
    });
  },

  parameter: function (target) {
    let proto = target.prototype ? target.prototype : target.__proto__;
    
    proto.getParameter = new Proxy(proto.getParameter, {
      apply(target, self, args) {
        window.top.postMessage("webgl-defender-alert", "*");
        
        if (args[0] === 3415) return 0;
        else if (args[0] === 3414) return 24;
        else if (args[0] === 36348) return 30;
        else if (args[0] === 7936) return "WebKit";
        else if (args[0] === 37445) return "Google Inc.";
        else if (args[0] === 7937) return "WebKit WebGL";
        else if (args[0] === 3379) session.spoofedValues[args[0]] = config.random.number([14, 15]);
        else if (args[0] === 36347) session.spoofedValues[args[0]] = config.random.number([12, 13]);
        else if (args[0] === 34076) session.spoofedValues[args[0]] = config.random.number([14, 15]);
        else if (args[0] === 34024) session.spoofedValues[args[0]] = config.random.number([14, 15]);
        else if (args[0] === 3386) session.spoofedValues[args[0]] = config.random.int([13, 14, 15]);
        else if (args[0] === 3413) session.spoofedValues[args[0]] = config.random.number([1, 2, 3, 4]);
        else if (args[0] === 3412) session.spoofedValues[args[0]] = config.random.number([1, 2, 3, 4]);
        else if (args[0] === 3411) session.spoofedValues[args[0]] = config.random.number([1, 2, 3, 4]);
        else if (args[0] === 3410) session.spoofedValues[args[0]] = config.random.number([1, 2, 3, 4]);
        else if (args[0] === 34047) session.spoofedValues[args[0]] = config.random.number([1, 2, 3, 4]);
        else if (args[0] === 34930) session.spoofedValues[args[0]] = config.random.number([1, 2, 3, 4]);
        else if (args[0] === 34921) session.spoofedValues[args[0]] = config.random.number([1, 2, 3, 4]);
        else if (args[0] === 35660) session.spoofedValues[args[0]] = config.random.number([1, 2, 3, 4]);
        else if (args[0] === 35661) session.spoofedValues[args[0]] = config.random.number([4, 5, 6, 7, 8]);
        else if (args[0] === 36349) session.spoofedValues[args[0]] = config.random.number([10, 11, 12, 13]);
        else if (args[0] === 33902) session.spoofedValues[args[0]] = config.random.float([0, 10, 11, 12, 13]);
        else if (args[0] === 33901) session.spoofedValues[args[0]] = config.random.float([0, 10, 11, 12, 13]);
        else if (args[0] === 37446) session.spoofedValues[args[0]] = config.random.item(["Graphics", "HD Graphics", "Intel(R) HD Graphics"]);
        else if (args[0] === 7938) session.spoofedValues[args[0]] = config.random.item(["WebGL 1.0", "WebGL 1.0 (OpenGL)", "WebGL 1.0 (OpenGL Chromium)"]);
        else if (args[0] === 35724) session.spoofedValues[args[0]] = config.random.item(["WebGL", "WebGL GLSL", "WebGL GLSL ES", "WebGL GLSL ES (OpenGL Chromium"]);
        
        if (session.spoofedValues[args[0]]) return session.spoofedValues[args[0]];

        return Reflect.apply(target, self, args);
      },
    });
  },

  extension: function (target) {
    let proto = target.prototype ? target.prototype : target.__proto__;
    
    proto.getParameter = new Proxy(proto.getParameter, {
      apply(target, self, args) {
        try {
          var threshold;

          switch (config.level) {
            case "low":
              threshold = 0.1;
              break;
            case "medium":
              threshold = 0.3;
              break;
            case "high":
              threshold = 0.6;
              break;
            default:
              threshold = 0.3;
          }

          if (config.random.value() < threshold) {
            return null;
          }
        } catch (error) {
          console.error("Error in getExtension spoofing", error);
        }
        return Reflect.apply(target, self, args);
      },
    });
  },
};