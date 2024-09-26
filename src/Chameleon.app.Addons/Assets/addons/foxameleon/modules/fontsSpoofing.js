const { settings } = require('./settings.js');

const fontspoof = {
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
              const valid = height && fontspoof.fonts.rand.sign() === 1;
              const result = valid
                ? height + fontspoof.fonts.rand.noise()
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
              const valid = width && fontspoof.fonts.rand.sign() === 1;
              const result = valid
                ? width + fontspoof.fonts.rand.noise()
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

const fontsSpoofing = {
  apply: function () {
    if (settings.fontsSpoofing) {
      fontspoof.fonts.offsetHeight(HTMLElement);
      fontspoof.fonts.offsetWidth(HTMLElement);
    }
  }
};

module.exports = fontsSpoofing;
