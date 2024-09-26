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
};

module.exports = config;
