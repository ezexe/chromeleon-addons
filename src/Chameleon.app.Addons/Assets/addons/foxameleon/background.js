const { settings, updateSettings } = require('./modules/settings.js');
const { setLogLevel, log } = require('./modules/logger.js');
const { createWebRTCContextMenus, handleWebRTCMenuClick, handleWebRTCSettings } = require('./modules/webrtc.js');
const { createGeoContextMenus, handleGeoMenuClick } = require('./modules/geolocation.js');
const { createTimezoneContextMenus, handleTimezoneMenuClick } = require('./modules/timezone.js');
const { applyOverrides, setupTabListeners } = require('./modules/emulations.js');

async function OnLoad() {
  await browser.storage.sync.set(settings);
    
  setLogLevel(settings.debug);
  createWebRTCContextMenus();
  createGeoContextMenus();
  createTimezoneContextMenus();
  log.info("OnLoad");
}
OnLoad();

browser.tabs.query({}, (tabs) => {
  tabs.forEach((tab) => {
    applyOverrides(tab);
  });
});

async function handleContextMenuClick(info, tab) {
  if (info.menuItemId === "test") {
    browser.tabs.create({
      url: "https://webbrowsertools.com/ip-address/",
      index: tab.index + 1,
    });
  } else if (info.menuItemId.startsWith("webrtc") || ["dApi", "disable_non_proxied_udp", "proxy_only", "default_public_interface_only", "default_public_and_private_interfaces"].includes(info.menuItemId)) {
    handleWebRTCMenuClick(info);
  } else if (info.menuItemId.startsWith("geo") || info.menuItemId === "enabled" || info.menuItemId === "reset" || info.menuItemId.startsWith("set:") || info.menuItemId.startsWith("randomizeGeo:") || info.menuItemId.startsWith("accuracy:") || ["add-exception", "remove-exception", "exception-editor"].includes(info.menuItemId)) {
    await handleGeoMenuClick(info, tab);
  } else if (["update-timezone", "set-timezone", "check-timezone", "randomize-timezone"].includes(info.menuItemId)) {
    await handleTimezoneMenuClick(info, tab);
  }
  
  await browser.storage.sync.set(settings);
  browser.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      applyOverrides(tab);
    });
  });
}

browser.contextMenus.onClicked.addListener(handleContextMenuClick);

browser.storage.onChanged.addListener(async (changes, _) => {
  await updateSettings();
  handleWebRTCSettings();
  log.info("Settings updated");
});

setupTabListeners();

log.info("Background script loaded");
