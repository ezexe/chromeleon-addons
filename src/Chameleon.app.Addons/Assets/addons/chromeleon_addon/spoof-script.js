(function() {
    const originalDate = Date;
    const originalPerformanceNow = performance.now;
    const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
    const port = {
      dataset: {
        offset: '-14400000', // Default offset in milliseconds (e.g., -4 hours for EDT)
        timezone: 'America/New_York', // Default spoofed timezone
        myIP: 'false' // Set to 'true' to use real timezone
      }
    };
  
    function getSpoofedTimezone() {
      return port.dataset.myIP === 'true' ? currentTimezone : port.dataset.timezone;
    }
  
    function getTimeOffset() {
      return parseInt(port.dataset.offset);
    }
  
    function adjustDate(date) {
      const adjustedTime = date.getTime() + getTimeOffset();
      return new originalDate(adjustedTime);
    }
  
    function SpoofedDate(...args) {
      if (!(this instanceof SpoofedDate)) {
        return new SpoofedDate(...args);
      }
      let realDate;
      if (args.length === 0) {
        realDate = new originalDate();
      } else if (args.length === 1) {
        if (typeof args[0] === 'string') {
          realDate = new originalDate(args[0]);
        } else {
          realDate = new originalDate(args[0] - getTimeOffset());
        }
      } else {
        realDate = new originalDate(...args);
      }
      this.adjustedDate = adjustDate(realDate);
    }
  
    SpoofedDate.prototype = Object.create(originalDate.prototype);
    SpoofedDate.prototype.constructor = SpoofedDate;
  
    const methodsToSpoof = [
      'getDate', 'getDay', 'getFullYear', 'getHours', 'getMilliseconds',
      'getMinutes', 'getMonth', 'getSeconds', 'getTime', 'getUTCDate', 
      'getUTCDay', 'getUTCFullYear', 'getUTCHours', 'getUTCMilliseconds', 
      'getUTCMinutes', 'getUTCMonth', 'getUTCSeconds', 'toDateString', 
      'toISOString', 'toJSON', 'toUTCString', 'valueOf'
    ];
  
    methodsToSpoof.forEach(method => {
      Object.defineProperty(SpoofedDate.prototype, method, {
        value: function(...args) {
          return this.adjustedDate[method](...args);
        }
      });
    });
  
    SpoofedDate.prototype.getTimezoneOffset = function() {
      return -getTimeOffset() / 60000; // Convert milliseconds to minutes
    };
  
    SpoofedDate.prototype.toString = function() {
      if (isNaN(this.adjustedDate)) {
        return originalDate.prototype.toString.call(this.adjustedDate);
      }
      return this.toDateString() + ' ' + this.toTimeString();
    };
  
    SpoofedDate.prototype.toTimeString = function() {
      if (isNaN(this.adjustedDate)) {
        return originalDate.prototype.toTimeString.call(this.adjustedDate);
      }
  
      const timeString = this.adjustedDate.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: getSpoofedTimezone(),
        hour12: false
      });
  
      const offset = this.getTimezoneOffset();
      const offsetSign = offset <= 0 ? '+' : '-';
      const offsetHours = Math.floor(Math.abs(offset) / 60).toString().padStart(2, '0');
      const offsetMinutes = (Math.abs(offset) % 60).toString().padStart(2, '0');
  
      const timeZoneName = new Intl.DateTimeFormat('en-US', { timeZone: getSpoofedTimezone(), timeZoneName: 'short' })
        .formatToParts(this.adjustedDate)
        .find(part => part.type === 'timeZoneName').value;
  
      return `${timeString} GMT${offsetSign}${offsetHours}${offsetMinutes} (${timeZoneName})`;
    };
  
    ['toLocaleString', 'toLocaleDateString', 'toLocaleTimeString'].forEach(method => {
      Object.defineProperty(SpoofedDate.prototype, method, {
        value: function(...args) {
          if (args.length < 2) args.push({});
          args[1].timeZone = getSpoofedTimezone();
          return this.adjustedDate[method](...args);
        }
      });
    });
  
    Object.defineProperty(SpoofedDate, 'now', {
      value: function() {
        return originalDate.now() + getTimeOffset();
      }
    });
  
    ['parse', 'UTC'].forEach(method => {
      Object.defineProperty(SpoofedDate, method, {
        value: function(...args) {
          return originalDate[method](...args);
        }
      });
    });
  
    Object.defineProperty(window, 'Date', {
      value: SpoofedDate,
      writable: true,
      enumerable: false,
      configurable: true
    });
  
    const OriginalDateTimeFormat = Intl.DateTimeFormat;
    function SpoofedDateTimeFormat(...args) {
      if (!args[1]) args[1] = {};
      args[1].timeZone = getSpoofedTimezone();
      return new OriginalDateTimeFormat(...args);
    }
    SpoofedDateTimeFormat.prototype = OriginalDateTimeFormat.prototype;
    SpoofedDateTimeFormat.prototype.constructor = SpoofedDateTimeFormat;
  
    Object.defineProperty(Intl, 'DateTimeFormat', {
      value: SpoofedDateTimeFormat,
      writable: true,
      enumerable: false,
      configurable: true
    });
  
    const timeOrigin = originalDate.now();
    Object.defineProperty(performance, 'now', {
      value: function() {
        return originalDate.now() - timeOrigin + getTimeOffset();
      },
      writable: true,
      enumerable: true,
      configurable: true
    });
  
    function checkSandboxedIframe() {
      if (!document.body) {
        console.log("Document body not ready, retrying in 100ms");
        setTimeout(checkSandboxedIframe, 100);
        return;
      }
  
      var sandFrame = document.createElement("iframe");
      sandFrame.setAttribute("sandbox", "allow-scripts");
      sandFrame.style.display = "none";
      document.body.appendChild(sandFrame);
      
      sandFrame.contentWindow.postMessage({type: 'CHECK_TIMEZONE'}, '*');
  
      window.addEventListener('message', function(event) {
        if (event.data.type === 'TIMEZONE_CHECK_RESULT') {
          console.log("Sandboxed iframe check:", event.data.result);
          document.body.removeChild(sandFrame);
        }
      }, {once: true});
    }
  
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", checkSandboxedIframe);
    } else {
      checkSandboxedIframe();
    }
  
    window.addEventListener('message', function(event) {
      if (event.data.type === 'CHECK_TIMEZONE') {
        var result = {
          date: new Date().toString(),
          dateFormat: JSON.stringify(Intl.DateTimeFormat().resolvedOptions()),
          alt: new Intl.DateTimeFormat("en", {
            dateStyle: "full",
            timeStyle: "long"
          }).format(new Date())
        };
        event.source.postMessage({type: 'TIMEZONE_CHECK_RESULT', result: result}, '*');
      }
    });
  
    console.log('Time and timezone spoofing applied:', getSpoofedTimezone(), 'Offset:', getTimeOffset());
  })();