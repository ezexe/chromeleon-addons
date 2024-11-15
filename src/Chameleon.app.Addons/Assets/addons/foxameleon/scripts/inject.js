(async function () {
  // Access the settings from the global window object
  const settings = window.__myAddonSettings__;
  const seed = window.__myAddonSeed__;
  const randObjName = window.__myAddonRandObjName__;
  if(!settings.enabled) return;

  let script = document.createElement("script");
  script.textContent = `
(function(){
    const inject = (spoofContext) => {
      // if (spoofContext.CHAMELEON_SPOOF) return;

      spoofContext.CHAMELEON_SPOOF = "CHAMELEON_SPOOF";`;

  // Timezone spoofing
  if (settings.timezoneSpoofing) {
    script.textContent += `
if (new Date()[spoofContext.CHAMELEON_SPOOF]) {
  spoofContext.Date = Date;
  return;
}
let ORIGINAL_DATE = spoofContext.Date;

class SpoofDate extends ORIGINAL_DATE {
    #ad; // adjusted date

    #sync() {
      const offset = (${settings.tzOffset} + super.getTimezoneOffset());
      this.#ad = new ORIGINAL_DATE(this.getTime() + offset * 60 * 1000);
    }

    constructor(...args) {
      super(...args);

      this.#sync();
    }
    getTimezoneOffset() {
      return ${settings.tzOffset};
    }
    /* to string (only supports en locale) */
    toTimeString() {
      if (isNaN(this)) {
        return super.toTimeString();
      }

      const parts = super.toLocaleString.call(this, 'en', {
        timeZone: '${settings.timezone}',
        timeZoneName: 'longOffset'
      }).split('GMT');

      if (parts.length !== 2) {
        return super.toTimeString();
      }

      const a = 'GMT' + parts[1].replace(':', '');

      const b = super.toLocaleString.call(this, 'en', {
        timeZone: '${settings.timezone}',
        timeZoneName: 'long'
      }).split(/(AM |PM )/i).pop();

      return super.toTimeString.apply(this.#ad).split(' GMT')[0] + ' ' + a + ' (' + b + ')';
    }
    /* only supports en locale */
    toDateString() {
      return super.toDateString.apply(this.#ad);
    }
    /* only supports en locale */
    toString() {
      if (isNaN(this)) {
        return super.toString();
      }
      return this.toDateString() + ' ' + this.toTimeString();
    }
    toLocaleDateString(...args) {
      args[1] = args[1] || {};
      args[1].timeZone = args[1].timeZone || '${settings.timezone}';

      return super.toLocaleDateString(...args);
    }
    toLocaleTimeString(...args) {
      args[1] = args[1] || {};
      args[1].timeZone = args[1].timeZone || '${settings.timezone}';

      return super.toLocaleTimeString(...args);
    }
    toLocaleString(...args) {
      args[1] = args[1] || {};
      args[1].timeZone = args[1].timeZone || '${settings.timezone}';

      return super.toLocaleString(...args);
    }
    /* get */
    #get(name, ...args) {
      return super[name].call(this.#ad, ...args);
    }
    getDate(...args) {
      return this.#get('getDate', ...args);
    }
    getDay(...args) {
      return this.#get('getDay', ...args);
    }
    getHours(...args) {
      return this.#get('getHours', ...args);
    }
    getMinutes(...args) {
      return this.#get('getMinutes', ...args);
    }
    getMonth(...args) {
      return this.#get('getMonth', ...args);
    }
    getYear(...args) {
      return this.#get('getYear', ...args);
    }
    getFullYear(...args) {
      return this.#get('getFullYear', ...args);
    }
    /* set */
    #set(type, name, args) {
      if (type === 'ad') {
        const n = this.#ad.getTime();
        const r = this.#get(name, ...args);

        return super.setTime(this.getTime() + r - n);
      }
      else {
        const r = super[name](...args);
        this.#sync();

        return r;
      }
    }
    setHours(...args) {
      return this.#set('ad', 'setHours', args);
    }
    setMinutes(...args) {
      return this.#set('ad', 'setMinutes', args);
    }
    setMonth(...args) {
      return this.#set('ad', 'setMonth', args);
    }
    setDate(...args) {
      return this.#set('ad', 'setDate', args);
    }
    setYear(...args) {
      return this.#set('ad', 'setYear', args);
    }
    setFullYear(...args) {
      return this.#set('ad', 'setFullYear', args);
    }
    setTime(...args) {
      return this.#set('md', 'setTime', args);
    }
    setUTCDate(...args) {
      return this.#set('md', 'setUTCDate', args);
    }
    setUTCFullYear(...args) {
      return this.#set('md', 'setUTCFullYear', args);
    }
    setUTCHours(...args) {
      return this.#set('md', 'setUTCHours', args);
    }
    setUTCMinutes(...args) {
      return this.#set('md', 'setUTCMinutes', args);
    }
    setUTCMonth(...args) {
      return this.#set('md', 'setUTCMonth', args);
    }
  }

spoofContext.Date = SpoofDate;
spoofContext.Date = new Proxy(Date, {
  apply(target, self, args) {
    return new SpoofDate(...args);
  }
});

  const DateTimeFormat = spoofContext.Intl.DateTimeFormat;

  class SpoofDateTimeFormat extends Intl.DateTimeFormat {
    constructor(...args) {
      if (!args[1]) {
        args[1] = {};
      }
      if (!args[1].timeZone) {
        args[1].timeZone = '${settings.timezone}';
      }

      super(...args);
    }
  }

  spoofContext.Intl.DateTimeFormat = SpoofDateTimeFormat;
  spoofContext.Intl.DateTimeFormat = new Proxy(Intl.DateTimeFormat, {
    apply(target, self, args) {
      return new Intl.DateTimeFormat(...args);
    }
  });
`.replace(
      /ORIGINAL_DATE/g,
      String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
        Math.random()
          .toString(36)
          .substring(Math.floor(Math.random() * 5) + 5)
    );
  }

  script.textContent += ` };

    inject(window);
  })()
  `
    .replace(/CHAMELEON_SPOOF/g, randObjName)
    .replace(
      /ORIGINAL_INTL/g,
      String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
        Math.random()
          .toString(36)
          .substring(Math.floor(Math.random() * 5) + 5)
    );
  // Inject the script into the page
  document.documentElement.append(script);
  /*script.remove();*/

  let scriptel = document.createElement("script");
  scriptel.src = URL.createObjectURL(
    new Blob([script.textContent], { type: "text/javascript" })
  );
  (document.head || document.documentElement).appendChild(scriptel);
  try {
    URL.revokeObjectURL(scriptel.src);
  } catch (e) {}
  /* scriptel.remove();*/
})();
