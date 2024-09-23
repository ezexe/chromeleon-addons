'use strict';

let prefs = {
  timezone: 'Etc/GMT',
  offset: 0
};

let engine = {}; // Declare the engine variable

function injectSpoofingScript() {
  chrome.runtime.sendMessage({
    method: 'injectScript',
    prefs: prefs
  });
}

function spoofTimezone(prefs) {
  const OriginalDate = Date;
  const OriginalIntlDateTimeFormat = Intl.DateTimeFormat;

  class SpoofDate extends OriginalDate {
    #ad; // adjusted date

    #sync() {
      const offset = (prefs.offset + super.getTimezoneOffset());
      this.#ad = new OriginalDate(this.getTime() + offset * 60 * 1000);
    }

    constructor(...args) {
      super(...args);
      this.#sync();
    }

    getTimezoneOffset() {
      return prefs.offset;
    }

    toTimeString() {
      if (isNaN(this)) {
        return super.toTimeString();
      }

      const parts = super.toLocaleString.call(this, 'en', {
        timeZone: prefs.timezone,
        timeZoneName: 'longOffset'
      }).split('GMT');

      if (parts.length !== 2) {
        return super.toTimeString();
      }

      const a = 'GMT' + parts[1].replace(':', '');

      const b = super.toLocaleString.call(this, 'en', {
        timeZone: prefs.timezone,
        timeZoneName: 'long'
      }).split(/(AM |PM )/i).pop();

      return super.toTimeString.apply(this.#ad).split(' GMT')[0] + ' ' + a + ' (' + b + ')';
    }

    toDateString() {
      return super.toDateString.apply(this.#ad);
    }

    toString() {
      if (isNaN(this)) {
        return super.toString();
      }
      return this.toDateString() + ' ' + this.toTimeString();
    }

    toLocaleDateString(...args) {
      args[1] = args[1] || {};
      args[1].timeZone = args[1].timeZone || prefs.timezone;
      return super.toLocaleDateString(...args);
    }

    toLocaleTimeString(...args) {
      args[1] = args[1] || {};
      args[1].timeZone = args[1].timeZone || prefs.timezone;
      return super.toLocaleTimeString(...args);
    }

    toLocaleString(...args) {
      args[1] = args[1] || {};
      args[1].timeZone = args[1].timeZone || prefs.timezone;
      return super.toLocaleString(...args);
    }

    #get(name, ...args) {
      return super[name].call(this.#ad, ...args);
    }

    getDate(...args) { return this.#get('getDate', ...args); }
    getDay(...args) { return this.#get('getDay', ...args); }
    getFullYear(...args) { return this.#get('getFullYear', ...args); }
    getHours(...args) { return this.#get('getHours', ...args); }
    getMilliseconds(...args) { return this.#get('getMilliseconds', ...args); }
    getMinutes(...args) { return this.#get('getMinutes', ...args); }
    getMonth(...args) { return this.#get('getMonth', ...args); }
    getSeconds(...args) { return this.#get('getSeconds', ...args); }
    getYear(...args) { return this.#get('getYear', ...args); }

    #set(type, name, args) {
      if (type === 'ad') {
        const n = this.#ad.getTime();
        const r = this.#get(name, ...args);
        return super.setTime(this.getTime() + r - n);
      } else {
        const r = super[name](...args);
        this.#sync();
        return r;
      }
    }

    setDate(...args) { return this.#set('ad', 'setDate', args); }
    setFullYear(...args) { return this.#set('ad', 'setFullYear', args); }
    setHours(...args) { return this.#set('ad', 'setHours', args); }
    setMilliseconds(...args) { return this.#set('ad', 'setMilliseconds', args); }
    setMinutes(...args) { return this.#set('ad', 'setMinutes', args); }
    setMonth(...args) { return this.#set('ad', 'setMonth', args); }
    setSeconds(...args) { return this.#set('ad', 'setSeconds', args); }
    setTime(...args) { return this.#set('md', 'setTime', args); }
    setYear(...args) { return this.#set('ad', 'setYear', args); }
    setUTCDate(...args) { return this.#set('md', 'setUTCDate', args); }
    setUTCFullYear(...args) { return this.#set('md', 'setUTCFullYear', args); }
    setUTCHours(...args) { return this.#set('md', 'setUTCHours', args); }
    setUTCMilliseconds(...args) { return this.#set('md', 'setUTCMilliseconds', args); }
    setUTCMinutes(...args) { return this.#set('md', 'setUTCMinutes', args); }
    setUTCMonth(...args) { return this.#set('md', 'setUTCMonth', args); }
    setUTCSeconds(...args) { return this.#set('md', 'setUTCSeconds', args); }
  }

  window.Date = SpoofDate;

  class SpoofDateTimeFormat extends OriginalIntlDateTimeFormat {
    constructor(...args) {
      if (!args[1]) {
        args[1] = {};
      }
      if (!args[1].timeZone) {
        args[1].timeZone = prefs.timezone;
      }
      super(...args);
    }
  }

  Intl.DateTimeFormat = SpoofDateTimeFormat;

  window.__updateTimezonePref = function(newPrefs) {
    Object.assign(prefs, newPrefs);
  };

  window.__getTimezonePref = function() {
    return prefs;
  };
}

// Add the methods function to handle different contexts
function methods(i) {
  switch (i) {
    case 1:
      var frame = document.getElementById("normalFrame");
      var normalWindow = frame && frame.contentWindow ? frame.contentWindow : window;
      engine = {
        date: new normalWindow.Date(),
        dateFormat: normalWindow.Intl.DateTimeFormat().resolvedOptions(),
        alt: new normalWindow.Intl.DateTimeFormat("en", { dateStyle: "full", timeStyle: "long" }).format(new Date())
      };
      break;
    case 2:
      engine = {
        date: eval("new Date()"),
        dateFormat: eval("Intl.DateTimeFormat().resolvedOptions()"),
        alt: eval("new Intl.DateTimeFormat('en', { dateStyle: 'full', timeStyle: 'long' }).format(new Date())")
      };
      break;
    case 3:
      engine = {
        date: new Function("return new Date()")(),
        dateFormat: new Function("return Intl.DateTimeFormat().resolvedOptions()")(),
        alt: new Function("return new Intl.DateTimeFormat('en', { dateStyle: 'full', timeStyle: 'long' }).format(new Date())")()
      };
      break;
    case 4:
      // Handle cloned data
      break;
    case 5:
      var sandFrame = document.createElement("iframe");
      sandFrame.setAttribute("sandbox", "allow-same-origin");
      sandFrame.classList.add("hidden");
      document.body.appendChild(sandFrame);
      var sandWindow = sandFrame.contentWindow ? sandFrame.contentWindow : window;
      engine = {
        date: new sandWindow.Date(),
        dateFormat: sandWindow.Intl.DateTimeFormat().resolvedOptions(),
        alt: new sandWindow.Intl.DateTimeFormat("en", { dateStyle: "full", timeStyle: "long" }).format(new Date())
      };
      sandFrame.remove();
      break;
    default:
      engine = {
        date: new Date(),
        dateFormat: Intl.DateTimeFormat().resolvedOptions(),
        alt: new Intl.DateTimeFormat("en", { dateStyle: "full", timeStyle: "long" }).format(new Date())
      };
  }

  if (engine.date && engine.dateFormat) {
    const keys = ["int", "toString", "alt", "getTimezoneOffset", "getTime", "getbeat", "servertime", "calendar", "day", "locale", "month", "numberingSystem", "timeZone", "year"];
    keys.forEach(key => {
      var target = document.getElementById(key);
      if (target) {
        if (key === "getbeat") {
          target.textContent = getbeat(engine.date);
        } else if (key === "servertime") {
          var request = new XMLHttpRequest();
          request.open("HEAD", window.location.href.toString(), false);
          request.setRequestHeader("Content-Type", "text/html");
          request.onload = function() {
            target.textContent = request.getResponseHeader("Date");
          };
          request.onerror = function() {
            target.textContent = "Error!";
          };
          request.send("");
        } else {
          target.textContent = (key === "int") 
            ? Intl.DateTimeFormat(undefined, {
                day: "numeric",
                hour: "numeric",
                hour12: true,
                minute: "numeric",
                month: "long",
                second: "numeric",
                timeZoneName: "long",
                weekday: "long",
                year: "numeric"
              }).format(engine.date) 
            : (key === "getTimezoneOffset")
            ? engine.date[key]() + " minutes"
            : (key === "alt")
            ? engine.alt
            : engine.date[key] 
            ? engine.date[key]()
            : engine.dateFormat[key] || "N/A";
        }
      }
    });
  }

  var interval;
  if (interval) clearInterval(interval);
  const names = {
    day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  };
  interval = setInterval(() => {
    const clockElement = document.querySelector(".clock");
    const calendarElement = document.querySelector(".calendar");

    if (clockElement && calendarElement) {
      var tds = [...clockElement.querySelectorAll("td"), ...calendarElement.querySelectorAll("td")];
      tds.forEach(td => {
        var id = td.id;
        if (id) {
          var index = (new Date())[id]();
          td.textContent = addpad(index);
          if (id === "getDay") td.textContent = names.day[index];
          if (id === "getMonth") td.textContent = names.month[index];
        }
      });
    }
  }, 1000);
}

function getbeat(now) {
  var off = 60 * (now.getTimezoneOffset() + 60);
  var theSeconds = 3600 * now.getHours() + 60 * now.getMinutes() + now.getSeconds() + off;
  var beat = Math.floor(theSeconds / 86.4);
  if (beat > 1000) beat -= 1000;
  if (beat < 0) beat += 1000;
  return "around @" + beat;
}

function addpad(digit) {
  return isNaN(digit) ? digit : digit < 10 ? "0" + digit.toString() : digit.toString();
}

function error({ message = "Unknown Error" }) {
  const keys = ["int", "toString", "alt", "getTimezoneOffset", "getTime", "getbeat", "servertime", "calendar", "day", "locale", "month", "numberingSystem", "timeZone", "year"];
  keys.forEach(key => {
    var target = document.getElementById(key);
    if (target) {
      target.textContent = message;
    }
  });
}

// Inject spoofing script immediately
injectSpoofingScript();

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method === 'updatePrefs') {
    prefs = request.prefs;
    chrome.runtime.sendMessage({
      method: 'updateScriptPrefs',
      prefs: prefs
    });
    sendResponse({success: true});
  } else if (request.method === 'getPrefs') {
    sendResponse(prefs);
  }
});

// Request initial prefs from background script
chrome.runtime.sendMessage({method: 'get-prefs'}, (response) => {
  if (response) {
    prefs = response;
    injectSpoofingScript();
  }
});

// Listen for load event to initialize methods
window.addEventListener("load", () => {
  methods(parseInt(localStorage.getItem("timezone.methods.selected.index")) || 0);
  document.body.classList.add("ready");

  const selector = document.getElementById("selector");
  if (selector) {
    selector.addEventListener("change", (e => {
      error({ message: "Loading..." });
      setTimeout(methods, 300, e.target.selectedIndex);
    }));
  }
});