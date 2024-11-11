import { SETTINGS_ARRAY, settings, updateSettings } from './settings.js';
import { log } from './logger.js';

const IS_FIREFOX = /Firefox/.test(navigator.userAgent) || typeof InstallTrigger !== "undefined";

export async function handleWebRTCSettings() {
/*    let settings = await browser.storage.sync.get(SETTINGS_ARRAY);*/
  const value = settings.webRtcEnabled && settings.dAPI ? settings.eMode : settings.dMode;
  chrome.privacy.network.webRTCIPHandlingPolicy.clear({}, () => {
    chrome.privacy.network.webRTCIPHandlingPolicy.set({ value }, () => {
      chrome.privacy.network.webRTCIPHandlingPolicy.get({}, (s) => {
        //let path = "/data/icons/";
        //let title = "WebRTC Protection is On";

        //if (s.value !== value) {
        //  path += "red/";
        //  title = "WebRTC access cannot be changed. It is controlled by another extension";
        //} else if (settings.webRtcEnabled === false) {
        //  path += "disabled/";
        //  title = "WebRTC Protection is Off";
        //}

        //chrome.action.setIcon({
        //  path: { 16: path + "16.png", 32: path + "32.png" },
        //});
        //chrome.action.setTitle({ title });
      });
    });
  });
}

export function createWebRTCContextMenus() {
  chrome.contextMenus.create({ title: "WebRTC", id: "webrtc-menu", contexts: ["action"] });
  chrome.contextMenus.create({ title: "Check WebRTC Leakage", id: "rtc-test", contexts: ["action"], parentId: "webrtc-menu" });
  /*chrome.contextMenus.create({ title: "WebRTC Protection Enabled", id: "webRtcEnabled", contexts: ["action"], type: "checkbox", parentId: "webrtc-menu", checked: settings.webRtcEnabled });*/
  chrome.contextMenus.create({ title: "Disable WebRTC Media Device Enumeration API", id: "dApi", contexts: ["action"], type: "checkbox", parentId: "webrtc-menu", checked: settings.dAPI });
  chrome.contextMenus.create({ title: "Options", id: "webrtc-options", contexts: ["action"], parentId: "webrtc-menu" });
  
  createWhenEnabledMenu();
  createWhenDisabledMenu();
}

function createWhenEnabledMenu() {
  chrome.contextMenus.create({ title: "When Enabled", id: "when-enabled", contexts: ["action"], parentId: "webrtc-options" });
  chrome.contextMenus.create({
    title: "Disable non-proxied UDP (force proxy)",
    id: "disable_non_proxied_udp",
    contexts: ["action"],
    type: "radio",
    parentId: "when-enabled",
    checked: settings.eMode === "disable_non_proxied_udp"
  });
  chrome.contextMenus.create({
    title: "Only connections using TURN on a TCP connection through a proxy",
    id: "proxy_only",
    contexts: ["action"],
    type: "radio",
    parentId: "when-enabled",
    enabled: IS_FIREFOX,
    checked: settings.eMode === "proxy_only"
  });
}

function createWhenDisabledMenu() {
  chrome.contextMenus.create({ title: "When Disabled", id: "when-disabled", contexts: ["action"], parentId: "webrtc-options" });
  chrome.contextMenus.create({
    title: "Use the default public interface only",
    id: "default_public_interface_only",
    contexts: ["action"],
    type: "radio",
    parentId: "when-disabled",
    checked: settings.dMode === "default_public_interface_only"
  });
  chrome.contextMenus.create({
    title: "Use the default public interface and private interface",
    id: "default_public_and_private_interfaces",
    contexts: ["action"],
    type: "radio",
    parentId: "when-disabled",
    checked: settings.dMode === "default_public_and_private_interfaces"
  });
}

export async function handleWebRTCMenuClick(info) {
  let settings = await chrome.storage.sync.get(SETTINGS_ARRAY);
  if (info.menuItemId === "webRtcEnabled") {
    settings.webRtcEnabled = info.checked;
  } else if (info.menuItemId === "dApi") {
    settings.dAPI = info.checked;
  } else if (["disable_non_proxied_udp", "proxy_only"].includes(info.menuItemId)) {
    settings.eMode = info.menuItemId;
  } else if (["default_public_interface_only", "default_public_and_private_interfaces"].includes(info.menuItemId)) {
    settings.dMode = info.menuItemId;
  } else if (info.menuItemId === "rtc-test") {
    chrome.tabs.create({ url: "https://browserleaks.com/webrtc" });
  }
  await chrome.storage.sync.set(settings);
}