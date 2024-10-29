import { setLogLevel, log } from "./modules/logger.js";
import { settings, updateSettings } from "./modules/settings.js";
import { createWebRTCContextMenus, handleWebRTCMenuClick, handleWebRTCSettings } from "./modules/webrtc.js";
import { createGeoContextMenus, handleGeoMenuClick } from "./modules/geolocation.js";
import { createTimezoneContextMenus, handleTimezoneMenuClick } from "./modules/timezone.js";
import { applyOverrides, setupTabListeners } from "./modules/emulations.js";

async function OnLoad() {
  await chrome.storage.sync.set(settings);
    
  setLogLevel(settings.debug);
  createWebRTCContextMenus();
  createGeoContextMenus();
  createTimezoneContextMenus();
  log.info("OnLoad");
}
OnLoad();

chrome.tabs.query({}, (tabs) => {
  tabs.forEach((tab) => {
    applyOverrides(tab);
  });
});

async function handleContextMenuClick(info, tab) {
  if (info.menuItemId === "test") {
    chrome.tabs.create({
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
  
  await chrome.storage.sync.set(settings);
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab)=> {
      applyOverrides(tab);
    });
  });
}

chrome.contextMenus.onClicked.addListener(handleContextMenuClick);

chrome.storage.onChanged.addListener(async (changes, _) => {
  await updateSettings();
  handleWebRTCSettings();
  log.info("Settings updated");
  console.log(changes, "changes====")
});

setupTabListeners();

log.info("Background script loaded");
