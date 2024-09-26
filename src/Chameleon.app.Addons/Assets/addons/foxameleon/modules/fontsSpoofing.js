const { settings } = require('./settings.js');
const config = require('./randomConfig.js');

const fontsSpoofing = {
  apply: function () {
    if (settings.fontsSpoofing) {
      config.fonts.offsetHeight(HTMLElement);
      config.fonts.offsetWidth(HTMLElement);
    }
  }
};

module.exports = fontsSpoofing;
