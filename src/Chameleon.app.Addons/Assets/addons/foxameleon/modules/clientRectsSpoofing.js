const { settings } = require('./settings.js');
const config = require('./randomConfig.js');

const clientRectsSpoofing = {
  apply: function () {
    if (settings.clientRectsSpoofing) {
      // Spoofing of DOMRect
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
};

module.exports = clientRectsSpoofing;
