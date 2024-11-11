import { setLogLevel, log } from "./modules/logger.js";
import { settings, updateSettings } from "./modules/settings.js";
import {
  getRandomTimezone,
  getTimezoneOffset,
} from "./modules/timezone.js";
import { genUULE, updateLocationRules } from "./modules/uule.js";

fetch(browser.runtime.getURL("settings.json"))
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json(); // Parse JSON directly
  })
  .then(async (data) => {
    await updateSettings(data);
    setLogLevel(settings.debug);
    updateLocationRules(genUULE(settings.latitude, settings.longitude));
    try {
      chrome.contextMenus.create({
        title: "Open Exception List in Editor",
        id: "exception-editor",
        contexts: ["browser_action"]
      });
    } catch (e) {
      log.error("Failed to set injection script", e);
    }
    log.info("Received: ", data);
  })
  .catch((error) => console.error("Error loading settings:", error));

// Add the webNavigation onCommitted listener
browser.webNavigation.onCommitted.addListener(
  async (details) => {
    if (details.frameId === 0) {
      // Ensures the script is only registered for the main frame
      await setInjectionScript();
      log.info("Injection script registered onCommitted");
    }
  },
  { url: [{ schemes: ["http", "https"] }] }
);

browser.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    log.info(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${oldValue}", new value is "${newValue}".`
    );
    settings[key] = newValue;
  }

  updateLocationRules(genUULE(settings.latitude, settings.longitude));
  setInjectionScript();
  log.info("Settings updated");
});

// Listen for messages from content scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "getSettings") {
    sendResponse(settings);
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "exception-editor") {
    const msg = `Insert one hostname per line. Press the "Save List" button to update the list.

    Example of valid formats:
    
      example.com
      *.example.com
      https://example.com/*
      *://*.example.com/*`;
      chrome.windows.getCurrent((win) => {
        chrome.windows.create({
          url: `data/editor/index.html?msg=${encodeURIComponent(
            msg
          )}&storage=bypass`,
          width: 600,
          height: 600,
          left: win.left + Math.round((win.width - 600) / 2),
          top: win.top + Math.round((win.height - 600) / 2),
          type: "popup",
        });
      });
  }
});

var injectionScript;
async function setInjectionScript() {
  if (injectionScript) {
    try{
    await injectionScript.unregister();
    }catch(e){
      log.error("Failed to unregister injection script", e);
    }
  }
  if (settings.myIP) {
    settings.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } else if (settings.randomizeTZ) {
    settings.timezone = getRandomTimezone();
  }

  settings.tzOffset = getTimezoneOffset(settings.timezone);

  injectionScript = await browser.contentScripts.register({
    allFrames: true,
    matchAboutBlank: true,
    matchOriginAsFallback: true,
    world: "MAIN",
    runAt: "document_start",
    matches: ["*://*/*"],
    js: [
      {
        code: `
          if (!window.__myAddonInjected__) {
            window.__myAddonInjected__ = true;
            window.__myAddonSettings__ = JSON.parse(\`${JSON.stringify(
              settings
            )}\`);
            window.__myAddonSeed__ = ${Math.random() * 0.00000001};
            window.__myAddonRandObjName__ = '${
              String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
              Math.random()
                .toString(36)
                .substring(Math.floor(Math.random() * 5) + 5)
            }';
          }
      `,
      },
      { file: "scripts/clientrects.js" },
      { file: "scripts/timezone.js" },
      { file: "scripts/geolocation.js" },
    ],
  });
}
log.info("Background script loaded");
