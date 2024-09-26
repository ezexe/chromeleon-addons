const { settings, updateSettings } = require('./settings.js');
const { log } = require('./logger.js');

const IS_FIREFOX = /Firefox/.test(navigator.userAgent) || typeof InstallTrigger !== "undefined";

function handleWebRTCSettings() {
  const value = settings.webRtcEnabled && settings.dAPI ? settings.eMode : settings.dMode;
  
  // Firefox uses a different API for WebRTC settings
  if (IS_FIREFOX) {
    browser.privacy.network.peerConnectionEnabled.set({ value: settings.webRtcEnabled });
    if (settings.webRtcEnabled) {
      browser.privacy.network.webRTCIPHandlingPolicy.set({ value });
    }
  }

  browser.privacy.network.webRTCIPHandlingPolicy.get({}, (s) => {
    let path = "/data/icons/";
    let title = "WebRTC Protection is On";

    if (s.value !== value) {
      path += "red/";
      title = "WebRTC access cannot be changed. It is controlled by another extension";
    } else if (settings.webRtcEnabled === false) {
      path += "disabled/";
      title = "WebRTC Protection is Off";
    }

    browser.browserAction.setIcon({
      path: { 16: path + "16.png", 32: path + "32.png" },
    });
    browser.browserAction.setTitle({ title });
  });
}

function createWebRTCContextMenus() {
  browser.contextMenus.create({ title: "WebRTC", id: "webrtc-menu", contexts: ["browser_action"] });
  browser.contextMenus.create({ title: "Check WebRTC Leakage", id: "test", contexts: ["browser_action"], parentId: "webrtc-menu" });
  browser.contextMenus.create({ title: "WebRTC Protection Enabled", id: "webRtcEnabled", contexts: ["browser_action"], type: "checkbox", parentId: "webrtc-menu", checked: settings.webRtcEnabled });
  browser.contextMenus.create({ title: "Disable WebRTC Media Device Enumeration API", id: "dApi", contexts: ["browser_action"], type: "checkbox", parentId: "webrtc-menu", checked: settings.dAPI });
  browser.contextMenus.create({ title: "Options", id: "webrtc-options", contexts: ["browser_action"], parentId: "webrtc-menu" });
  
  createWhenEnabledMenu();
  createWhenDisabledMenu();
}

function createWhenEnabledMenu() {
  browser.contextMenus.create({ title: "When Enabled", id: "when-enabled", contexts: ["browser_action"], parentId: "webrtc-options" });
  browser.contextMenus.create({
    title: "Disable non-proxied UDP (force proxy)",
    id: "disable_non_proxied_udp",
    contexts: ["browser_action"],
    type: "radio",
    parentId: "when-enabled",
    checked: settings.eMode === "disable_non_proxied_udp"
  });
  browser.contextMenus.create({
    title: "Only connections using TURN on a TCP connection through a proxy",
    id: "proxy_only",
    contexts: ["browser_action"],
    type: "radio",
    parentId: "when-enabled",
    enabled: IS_FIREFOX,
    checked: settings.eMode === "proxy_only"
  });
}

function createWhenDisabledMenu() {
  browser.contextMenus.create({ title: "When Disabled", id: "when-disabled", contexts: ["browser_action"], parentId: "webrtc-options" });
  browser.contextMenus.create({
    title: "Use the default public interface only",
    id: "default_public_interface_only",
    contexts: ["browser_action"],
    type: "radio",
    parentId: "when-disabled",
    checked: settings.dMode === "default_public_interface_only"
  });
  browser.contextMenus.create({
    title: "Use the default public interface and private interface",
    id: "default_public_and_private_interfaces",
    contexts: ["browser_action"],
    type: "radio",
    parentId: "when-disabled",
    checked: settings.dMode === "default_public_and_private_interfaces"
  });
}

function handleWebRTCMenuClick(info) {
  if (info.menuItemId === "webRtcEnabled") {
    settings.webRtcEnabled = info.checked;
  } else if (info.menuItemId === "dApi") {
    settings.dAPI = info.checked;
  } else if (["disable_non_proxied_udp", "proxy_only"].includes(info.menuItemId)) {
    settings.eMode = info.menuItemId;
  } else if (["default_public_interface_only", "default_public_and_private_interfaces"].includes(info.menuItemId)) {
    settings.dMode = info.menuItemId;
  } else if (info.menuItemId === "test") {
    browser.tabs.create({ url: "https://webbrowsertools.com/ip-address/" });
  }
  updateSettings();
  handleWebRTCSettings();
}

module.exports = {
  handleWebRTCSettings,
  createWebRTCContextMenus,
  handleWebRTCMenuClick
};