// Configuration for the randomization of values
export const config = {
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
      this.seed = (this.seed * 9301 + 49297) % 233280;
      return this.seed / 233280;
    },
    item: function (e) {
      let rand = e.length * this.value();
      return e[Math.floor(rand)];
    },
    number: function (power) {
      let tmp = power.map(p => Math.pow(2, p));
      return this.item(tmp);
    },
    int: function (power) {
      let tmp = power.map(p => {
        let n = Math.pow(2, p);
        return new Int32Array([n, n]);
      });
      return this.item(tmp);
    },
    float: function (power) {
      let tmp = power.map(p => {
        let n = Math.pow(2, p);
        return new Float32Array([1, n]);
      });
      return this.item(tmp);
    },
  },
};

// Session object to store spoofed values
export const session = {
  spoofedValues: {},
};