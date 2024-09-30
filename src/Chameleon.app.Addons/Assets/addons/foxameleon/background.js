import { setLogLevel, log } from "./modules/logger.js";
import { settings, updateSettings } from "./modules/settings.js";
import { createGeoContextMenus, handleGeoMenuClick } from "./modules/geolocation.js";
import { createTimezoneContextMenus, handleTimezoneMenuClick, getRandomTimezone, getTimezoneOffset } from "./modules/timezone.js";

var injectionScript;
async function setInjectionScript() {
  if(injectionScript) {
    await this.injectionScript.unregister();
  }

  if (settings.myIP) {
    settings.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } else if (settings.randomizeTZ) {
    settings.timezone = getRandomTimezone();
  }
  settings.tzOffset = getTimezoneOffset(settings.timezone);
  
  injectionScript  = await browser.contentScripts.register({
    allFrames: true,
    matchAboutBlank: true,
    matches: ['http://*/*', 'https://*/*'],
    js: [
      {
        code: `
          let settings = JSON.parse(\`${JSON.stringify(settings)}\`);
          let seed = ${Math.random() * 0.00000001};
          let randObjName = '${String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
            Math.random()
              .toString(36)
              .substring(Math.floor(Math.random() * 5) + 5)}';
        `,
      },
      { file: 'scripts/inject.js' },
    ],
    runAt: 'document_start',
  });
}
async function OnLoad() {
  setInjectionScript();

  // await browser.storage.sync.set(settings);
    
  setLogLevel(settings.debug);
  createGeoContextMenus();
  createTimezoneContextMenus();
  log.info("OnLoad");
}
OnLoad();

async function handleContextMenuClick(info, tab) {
  if (info.menuItemId === "test") {
    await chrome.tabs.create({
      url: "https://webbrowsertools.com/ip-address/",
      index: tab.index + 1,
    });
  } else if (info.menuItemId.startsWith("geo") || info.menuItemId === "enabled" || info.menuItemId === "reset" || info.menuItemId.startsWith("set:") || info.menuItemId.startsWith("randomizeGeo:") || info.menuItemId.startsWith("accuracy:") || ["add-exception", "remove-exception", "exception-editor"].includes(info.menuItemId)) {
    await handleGeoMenuClick(info, tab);
  } else if (["update-timezone", "set-timezone", "check-timezone", "randomize-timezone"].includes(info.menuItemId)) {
    await handleTimezoneMenuClick(info, tab);
  }
  
  await browser.storage.sync.set(settings);
}

chrome.contextMenus.onClicked.addListener(handleContextMenuClick);

browser.storage.onChanged.addListener(async (changes, _) => {
  await updateSettings();
  log.info("Settings updated");
});

log.info("Background script loaded");
