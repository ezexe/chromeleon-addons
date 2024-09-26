async function applyGeoTimezoneOverrides(tab) {
  try {
    if ((tab.url.indexOf("about:") < 0) && (settings.timezoneSpoofing || settings.geoSpoofing)) {
      if (tab && tab.url) {
        if (settings.timezoneSpoofing) {
          await applyTimezoneOverride(tab);
        }
        if (settings.geoSpoofing) {
          await applyGeoOverride(tab);
        }
      }
      log.log(`Overrides applied for tab ${tab.id}`);
      return true;
    }
  } catch (error) {
    log.error(`Failed to apply overrides for tab ${tab.id}:`, error);
  }
  return false;
}

async function applyTimezoneOverride(tab) {
  let timezoneId = settings.timezone;
  if (settings.myIP) {
    timezoneId = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } else if (settings.randomizeTZ) {
    timezoneId = getRandomTimezone();
  }
  
  // Firefox doesn't support Emulation API, so we'll need to use content scripts
  // to override timezone and locale
  await browser.tabs.executeScript(tab.id, {
    code: `
      Object.defineProperty(Intl, 'DateTimeFormat', {
        value: new Proxy(Intl.DateTimeFormat, {
          construct(target, args) {
            if (args.length > 0) {
              args[1] = Object.assign({}, args[1], { timeZone: '${timezoneId}' });
            } else {
              args.push({ timeZone: '${timezoneId}' });
            }
            return new target(...args);
          }
        })
      });
      Object.defineProperty(Date.prototype, 'toLocaleString', {
        value: new Proxy(Date.prototype.toLocaleString, {
          apply(target, thisArg, args) {
            if (args.length > 0) {
              args[1] = Object.assign({}, args[1], { timeZone: '${timezoneId}' });
            } else {
              args.push({ timeZone: '${timezoneId}' });
            }
            return target.apply(thisArg, args);
          }
        })
      });
    `
  });
  
  log.info(`Timezone set to ${timezoneId} for tab ${tab.id}`);
}

function getRandomTimezone() {
  const timeZoneKeys = Object.keys(offsets);
  const randomKey = timeZoneKeys[Math.floor(Math.random() * timeZoneKeys.length)];
  return randomKey;
}

async function applyGeoOverride(tab) {
  if (settings.randomizeGeo) {
    randomizeGeoLocation();
  }
  
  // Firefox doesn't support Emulation API, so we'll need to use content scripts
  // to override geolocation
  await browser.tabs.executeScript(tab.id, {
    code: `
      navigator.geolocation.getCurrentPosition = new Proxy(navigator.geolocation.getCurrentPosition, {
        apply(target, thisArg, args) {
          const success = args[0];
          args[0] = (position) => {
            position.coords.latitude = ${settings.latitude};
            position.coords.longitude = ${settings.longitude};
            position.coords.accuracy = ${settings.accuracy};
            success(position);
          };
          return target.apply(thisArg, args);
        }
      });
    `
  });
}

function randomizeGeoLocation() {
  try {
    const m = settings.latitude.toString().split(".")[1].length;
    settings.latitude = settings.latitude + (Math.random() > 0.5 ? 1 : -1) * settings.randomizeGeo * Math.random();
    settings.latitude = Number(settings.latitude.toFixed(m));

    const n = settings.longitude.toString().split(".")[1].length;
    settings.longitude = settings.longitude + (Math.random() > 0.5 ? 1 : -1) * settings.randomizeGeo * Math.random();
    settings.longitude = Number(settings.longitude.toFixed(n));
  } catch (e) {
    log.warn("Cannot randomizeGeo GEO", e);
  }
}