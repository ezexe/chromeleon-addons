const { settings } = require('./settings.js');
const config = require('./randomConfig.js');

const canvasSpoofing = {
  protect: function (target) {
    if (settings.canvasProtection) {
      config.canvas.toDataURL(target);
    }
  }
};

module.exports = canvasSpoofing;
