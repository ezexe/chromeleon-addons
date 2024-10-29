import { settings } from './settings.js';
import { log } from './logger.js';
import { offsets } from './offsets.js';
import { genUULE, updateLocationRules } from './uule.js';

export async function applyOverrides(tab) {
  try {
    if ((tab.url.indexOf("chrome://") < 0) && (settings.timezoneSpoofing || settings.geoSpoofing)) {
      try {
        await chrome.debugger.attach({ tabId: tab.id }, '1.3');
      } catch (error) {
        log.error(`Failed to attach debugger to tab ${tab.id}:`, error);
      }
      if (tab && tab.url) {
        if (settings.timezoneSpoofing) {
          await applyTimezoneOverride(tab);
        }
        if (settings.geoSpoofing) {
          await applyGeoOverride(tab);
        }
      }
      log.log(`Debugger attached and overrides applied for tab ${tab.id}`);
      return true;
    }
  } catch (error) {
    log.error(`Failed to attach debugger or apply overrides for tab ${tab.id}:`, error);
  }
  return false;
}

export async function applyTimezoneOverride(tab) {
  let timezoneId = settings.timezone;
  if (settings.myIP) {
    timezoneId = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } else if (settings.randomizeTZ) {
    timezoneId = getRandomTimezone();
  }
  await chrome.debugger.sendCommand(
    { tabId: tab.id },
    "Emulation.setTimezoneOverride",
    { timezoneId: timezoneId }
  );
  await chrome.debugger.sendCommand(
    { tabId: tab.id },
    "Emulation.setLocaleOverride",
    { locale: settings.locale }
  );
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
  await chrome.debugger.sendCommand(
    { tabId: tab.id },
    "Emulation.setGeolocationOverride",
    {
      latitude: settings.latitude,
      longitude: settings.longitude,
      accuracy: settings.accuracy,
    }
  );
  const lat = settings.latitude;
  const lng = settings.longitude;
  const uule = genUULE(lat, lng);
  updateLocationRules(uule);
}

function randomizeGeoLocation() {
  try {
    const m = settings.latitude.toString().split(".")[1].length;
    settings.latitude = settings.latitude + (Math.random() > 0.5 ? 1 : -1) * settings.randomizeGeo * Math.random();
    settings.latitude = Number(settings.latitude.toFixed(m));

    const n = settings.longitude.toString().split(".")[1].length;
    settings.longitude = settings.longitude + (Math.random() > 0.5 ? 1 : -1) * settings.randomizeGeo * Math.random();
    settings.longitude = Number(settings.longitude.toFixed(n));
    const lat = settings.latitude;
    const lng = settings.longitude;
    const uule = genUULE(lat, lng);
    updateLocationRules(uule);
  } catch (e) {
    log.warn("Cannot randomizeGeo GEO", e);
  }
}

export function setupTabListeners() {
  chrome.tabs.onRemoved.addListener((tabId) => {
    chrome.debugger.detach({ tabId: tabId });
  });

  chrome.tabs.onCreated.addListener((tab) => {
    applyOverrides(tab);
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "loading") {
      applyOverrides(tab);
    }
  });
}