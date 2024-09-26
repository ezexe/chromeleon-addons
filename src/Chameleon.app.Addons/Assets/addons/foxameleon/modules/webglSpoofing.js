const { log } = require('./settings.js');
const config = require('./randomConfig.js');

const webglSpoofing = {
  buffer: function (target) {
    let proto = target.prototype ? target.prototype : target.__proto__;
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
              if (config.random.value() < noiseFrequency) {
                const value = dataView.getFloat32(i, true);
                const noise =
                  noiseAmplitude * (config.random.value() * 2 - 1) * value;
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
};

module.exports = webglSpoofing;
