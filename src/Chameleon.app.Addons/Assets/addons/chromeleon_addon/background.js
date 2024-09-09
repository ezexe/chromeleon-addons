import logger, {setLogLevel, log} from './modules/logger.js';
import { SETTINGS_ARRAY } from './modules/settings.js';
// let settings = {
//   enabled: true,
//   webglSpoofing: true,
//   canvasProtection: true,
//   clientRectsSpoofing: true,
//   fontsSpoofing: false,
//   dAPI: true,
//   eMode: 'disable_non_proxied_udp',
//   dMode: 'default_public_interface_only',
//   noiseLevel: 'medium',
//   debug: 3,
// };
// isFirefox ? 'proxy_only' : 'disable_non_proxied_udp'
const IS_FIREFOX =
  /Firefox/.test(navigator.userAgent) || typeof InstallTrigger !== "undefined";
setLogLevel(settings.debug);

function updateContextMenus() {
  chrome.contextMenus.update("dAPI", { checked: settings.dAPI });
  chrome.contextMenus.update(settings.eMode, { checked: true });
  chrome.contextMenus.update(settings.dMode, { checked: true });
}

async function createContextMenus() {
  const menuItems = [
    { id: "test", title: "Check WebTRC Leakage" },
    {
      id: "dAPI",
      title: "Disable WebRTC Media Device Enumeration API",
      type: "checkbox",
    },
    { 
      id: "when-enabled", 
      title: "When Enabled" },
    {
      id: "disable_non_proxied_udp",
      title: "Disable non-proxied UDP (force proxy)",
      parentId: "when-enabled",
      type: "radio",
    },
    {
      id: "proxy_only",
      title: "Only connections using TURN on a TCP connection through a proxy",
      parentId: "when-enabled",
      type: "radio",
      enabled: IS_FIREFOX,
    },
    { 
      id: "when-disabled", 
      title: "When Disabled" },
    {
      id: "default_public_interface_only",
      title: "Use the default public interface only",
      parentId: "when-disabled",
      type: "radio",
    },
    {
      id: "default_public_and_private_interfaces",
      title: "Use the default public interface and private interface",
      parentId: "when-disabled",
      type: "radio",
    },
  ];

  for (const item of menuItems) {
    await chrome.contextMenus.create(
      { contexts: ["action"], ...item },
      () => chrome.runtime.lastError
    );
  }
}

async function handleContextMenuClick(info, tab) {
  if (info.menuItemId === "test") {
    chrome.tabs.create({
      url: "https://webbrowsertools.com/ip-address/",
      index: tab.index + 1,
    });
  } else {
    if (info.menuItemId === "dAPI") {
      settings.dAPI = info.checked;
    } else if (
      ["disable_non_proxied_udp", "proxy_only"].includes(info.menuItemId)
    ) {
      settings.eMode = info.menuItemId;
    } else if (
      [
        "default_public_interface_only",
        "default_public_and_private_interfaces",
      ].includes(info.menuItemId)
    ) {
      settings.dMode = info.menuItemId;
    }
  }

    await chrome.storage.sync.set(settings);
}

function updateWebRTCProtection() {
  const value = (settings.enabled && settings.dAPI) ? settings.eMode : settings.dMode;
  chrome.privacy.network.webRTCIPHandlingPolicy.clear({}, () => {
    chrome.privacy.network.webRTCIPHandlingPolicy.set({ value }, () => {
      chrome.privacy.network.webRTCIPHandlingPolicy.get({}, (s) => {
        let path = "/data/icons/";
        let title = "WebRTC Protection is On";

        if (s.value !== value) {
          path += "red/";
          title =
            "WebRTC access cannot be changed. It is controlled by another extension";
        } else if (settings.enabled === false) {
          path += "disabled/";
          title = "WebRTC Protection is Off";
        }

        chrome.action.setIcon({
          path: { 16: path + "16.png", 32: path + "32.png" },
        });
        chrome.action.setTitle({ title });
      });
    });
  });
}

async function OnLoad() {
  await chrome.storage.sync.set(settings);
  await createContextMenus();
  updateContextMenus();
  updateWebRTCProtection();
  log.info('OnLoad');
}
OnLoad();
// Event Listeners
chrome.contextMenus.onClicked.addListener(handleContextMenuClick);

chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let key in changes) {
    settings[key] = changes[key].newValue;
  }
  updateContextMenus();
  updateWebRTCProtection();
  log.info('Settings updated');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  logger('info', "Received message:", request);

  switch (request.action) {
    case "updateSettings":
      handleUpdateSettings(request.settings, sendResponse);
      break;
    case "getSettings":
      handleGetSettings(sendResponse);
      break;
    default:
      logger('info', "Unknown action:", request.action);
      sendResponse({ error: "Unknown action" });
  }

  return true; // Indicates that the response is sent asynchronously
});

async function handleUpdateSettings(newSettings, sendResponse) {
  try {
    await chrome.storage.sync.set(newSettings);
    logger('info', "Settings updated:", newSettings);
    sendResponse({ success: true });
  } catch (error) {
    logger('error', "Error updating settings", error);
    sendResponse({ error: "Failed to update settings" });
  }
}

async function handleGetSettings(sendResponse) {
  try {
    chrome.storage.sync.get(SETTINGS_ARRAY, function(settings) {
      logger('info', 'Initializing settings:', settings);
      updateContentScripts(settings);
    });
    // settings.data = await chrome.storage.sync.get(SETTINGS_ARRAY);
    // sendResponse(settings.data);
  } catch (error) {
    logger('error', "Error getting settings", error);
    sendResponse({ error: "Failed to get settings" });
  }
}

// Update content scripts with new settings
function updateContentScripts(settings) {
  chrome.tabs.query({}, function(tabs) {
    tabs.forEach(function(tab) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'updateSettings',
        settings: settings
      }, function(response) {
        if (chrome.runtime.lastError) {
          console.error('Error sending message to tab:', chrome.runtime.lastError);
        } else {
          logIfEnabled('Settings updated in tab:', tab.id);
        }
      });
    });
  });
}

logger('info', "Background script loaded");
