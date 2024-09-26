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
  canvas: {
    toDataURL: function (target) {
      const proto = target.prototype ? target.prototype : target.__proto__;
      const original = proto.toDataURL;
      Object.defineProperty(proto, "toDataURL", {
        value: function () {
          const result = original.apply(this, arguments);
          const noise = config.random.value() * 0.1;
          return result.replace(/(\d+)(?=\D*$)/, (match) => Math.floor(match * (1 + noise)));
        },
      });
    },
  },
  clientRects: {
    method: {
      DOMRect: function (metric) {
        const descriptor = Object.getOwnPropertyDescriptor(DOMRect.prototype, metric);
        Object.defineProperty(DOMRect.prototype, metric, {
          get: function () {
            const value = descriptor.get.call(this);
            const noise = config.random.noise.DOMRect;
            return value + noise * (config.random.value() * 2 - 1);
          },
        });
      },
      DOMRectReadOnly: function (metric) {
        const descriptor = Object.getOwnPropertyDescriptor(DOMRectReadOnly.prototype, metric);
        Object.defineProperty(DOMRectReadOnly.prototype, metric, {
          get: function () {
            const value = descriptor.get.call(this);
            const noise = config.random.noise.DOMRectReadOnly;
            return value + noise * (config.random.value() * 2 - 1);
          },
        });
      },
    },
  },
  fonts: {
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
              const result = Reflect.apply(target, self, args);
              const noise = config.random.value() * 0.1;
              return result + noise * (config.random.value() * 2 - 1);
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
              const result = Reflect.apply(target, self, args);
              const noise = config.random.value() * 0.1;
              return result + noise * (config.random.value() * 2 - 1);
            },
          }
        ),
      });
    },
  },
};

module.exports = config;
