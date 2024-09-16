import logger, {setLogLevel, log} from './modules/logger.js';
import { SETTINGS_ARRAY } from './modules/settings.js';

let settings = {
  enabled: true,
  webglSpoofing: true,
  canvasProtection: true,
  clientRectsSpoofing: true,
  fontsSpoofing: true,
  geoSpoofing: true,
  dAPI: true,
  eMode: 'disable_non_proxied_udp',
  dMode: 'default_public_interface_only',
  noiseLevel: 'medium',
  debug: 3,
};
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
async function createGeoContextMenus() {
  //Geo Context Menus
  chrome.storage.local.get({
    enabled: true,
    history: [],
    randomize: false,
    accuracy: 64.0999
  }, prefs => {
    chrome.contextMenus.create({
      title: 'GEO',
      id: 'geo',
      contexts: ['action']
    });
    chrome.contextMenus.create({
      title: 'Allow/Disallow GEO requests',
      id: 'enabled',
      contexts: ['action'],
      type: 'checkbox',
      checked: prefs.enabled,
      parentId: 'geo'
    });
    chrome.contextMenus.create({
      title: 'Reset GEO data (ask for new values on first request)',
      id: 'reset',
      contexts: ['action'],
      parentId: 'geo'
    });
    chrome.contextMenus.create({
      title: 'Test GEO location',
      id: 'geo-test',
      contexts: ['action'],
      parentId: 'geo'
    });
    chrome.contextMenus.create({
      title: 'Options',
      id: 'options',
      contexts: ['action'],
      parentId: 'geo'
    });
    chrome.contextMenus.create({
      title: 'Randomize',
      id: 'randomize',
      contexts: ['action'],
      parentId: 'options'
    });
    chrome.contextMenus.create({
      title: 'Disabled',
      id: 'randomize:false',
      contexts: ['action'],
      checked: prefs.randomize === false,
      type: 'radio',
      parentId: 'randomize'
    });
    chrome.contextMenus.create({
      title: '0.1',
      id: 'randomize:0.1',
      contexts: ['action'],
      checked: prefs.randomize === 0.1,
      type: 'radio',
      parentId: 'randomize'
    });
    chrome.contextMenus.create({
      title: '0.01',
      id: 'randomize:0.01',
      contexts: ['action'],
      checked: prefs.randomize === 0.01,
      type: 'radio',
      parentId: 'randomize'
    });
    chrome.contextMenus.create({
      title: '0.001',
      id: 'randomize:0.001',
      contexts: ['action'],
      checked: prefs.randomize === 0.001,
      type: 'radio',
      parentId: 'randomize'
    });
    chrome.contextMenus.create({
      title: '0.0001',
      id: 'randomize:0.0001',
      contexts: ['action'],
      checked: prefs.randomize === 0.0001,
      type: 'radio',
      parentId: 'randomize'
    });
    chrome.contextMenus.create({
      title: '0.00001',
      id: 'randomize:0.00001',
      contexts: ['action'],
      checked: prefs.randomize === 0.00001,
      type: 'radio',
      parentId: 'randomize'
    });
    chrome.contextMenus.create({
      title: 'Accuracy',
      id: 'accuracy',
      contexts: ['action'],
      parentId: 'options'
    });
    chrome.contextMenus.create({
      title: '64.0999',
      id: 'accuracy:64.0999',
      contexts: ['action'],
      checked: prefs.accuracy === 64.0999,
      type: 'radio',
      parentId: 'accuracy'
    });
    chrome.contextMenus.create({
      title: '34.0999',
      id: 'accuracy:34.0999',
      contexts: ['action'],
      checked: prefs.accuracy === 34.0999,
      type: 'radio',
      parentId: 'accuracy'
    });
    chrome.contextMenus.create({
      title: '10.0999',
      id: 'accuracy:10.0999',
      contexts: ['action'],
      checked: prefs.accuracy === 10.0999,
      type: 'radio',
      parentId: 'accuracy'
    });
    chrome.contextMenus.create({
      title: 'GEO History',
      id: 'history',
      contexts: ['action'],
      visible: prefs.history.length !== 0,
      parentId: 'options'
    });
    for (const [a, b] of prefs.history) {
      chrome.contextMenus.create({
        title: a + ', ' + b,
        id: 'set:' + a + '|' + b,
        contexts: ['action'],
        parentId: 'history',
        type: 'radio',
        checked: prefs.latitude === a && prefs.longitude === b
      });
    }
    chrome.contextMenus.create({
      title: 'Bypass Spoofing',
      id: 'bypass',
      contexts: ['action'],
      parentId: 'options'
    });
    chrome.contextMenus.create({
      title: 'Add to the Exception List',
      id: 'add-exception',
      contexts: ['action'],
      parentId: 'bypass'
    });
    chrome.contextMenus.create({
      title: 'Remove from the Exception List',
      id: 'remove-exception',
      contexts: ['action'],
      parentId: 'bypass'
    });
    chrome.contextMenus.create({
      title: 'Open Exception List in Editor',
      id: 'exception-editor',
      contexts: ['action'],
      parentId: 'bypass'
    });
  });
}

const activate = () => chrome.storage.local.get({
  active: true
}, async prefs => {
  await chrome.scripting.unregisterContentScripts();
  if (prefs.active) {
    await chrome.scripting.registerContentScripts([{
      'id': 'unprotected',
      'matches': ['*://*/*'],
      'allFrames': true,
      'matchOriginAsFallback': true,
      'runAt': 'document_start',
      'js': ['/data/scripts/unprotected.js'],
      'world': 'MAIN'
    }, {
      'id': 'protected',
      'matches': ['*://*/*'],
      'allFrames': true,
      'matchOriginAsFallback': true,
      'runAt': 'document_start',
      'js': ['/data/scripts/protected.js'],
      'world': 'ISOLATED'
    }]);
  }
});

chrome.runtime.onStartup.addListener(function(){
  activate();
  createGeoContextMenus();
});
chrome.runtime.onInstalled.addListener(function(){
  activate();
  createGeoContextMenus();
});

async function handleContextMenuClick(info, tab) 
{
  console.log();
  if (info.menuItemId === "test") {
    chrome.tabs.create({
      url: "https://webbrowsertools.com/ip-address/",
      index: tab.index + 1,
    });
  } 
  else if (info.menuItemId === 'reset') {
    chrome.storage.local.set({
      latitude: -1,
      longitude: -1
    });
  }
  else if (info.menuItemId === 'enabled') {
    chrome.storage.local.set({
      enabled: info.checked
    });
  }
  else if (info.menuItemId === 'geo-test') {
    chrome.tabs.create({
      url: 'https://webbrowsertools.com/geolocation/',
      index: tab.index + 1
    });
  }
  else if (info.menuItemId.startsWith('set:')) {
    const [latitude, longitude] = info.menuItemId.slice(4).split('|').map(Number);
    chrome.storage.local.set({
      latitude,
      longitude
    });
  }
  else if (info.menuItemId === 'randomize:false') {
    chrome.storage.local.set({randomize: false});
  }
  else if (info.menuItemId.startsWith('randomize:')) {
    chrome.storage.local.set({
      randomize: parseFloat(info.menuItemId.slice(10))
    });
  }
  else if (info.menuItemId.startsWith('accuracy:')) {
    chrome.storage.local.set({
      accuracy: parseFloat(info.menuItemId.slice(9))
    });
  }
  else if (info.menuItemId === 'add-exception') {
    const url = tab.url;

    if (url.startsWith('http')) {
      chrome.storage.local.get({
        bypass: []
      }, prefs => {
        const d = tld.getDomain(tab.url);

        const hosts = new Set(prefs.bypass);
        hosts.add(d);
        hosts.add('*.' + d);
        console.info('adding', d, '*.' + d, 'to the exception list');

        chrome.storage.local.set({
          bypass: [...hosts]
        });
      });
    }
  }
  else if (info.menuItemId === 'remove-exception') {
    const url = tab.url;

    if (url.startsWith('http')) {
      chrome.storage.local.get({
        bypass: []
      }, prefs => {
        const d = tld.getDomain(tab.url);

        console.info('removing', d, '*.' + d, 'from the exception list');

        chrome.storage.local.set({
          bypass: prefs.bypass.filter(m => m !== d && m !== '*.' + d)
        });
      });
    }
  }
  else if (info.menuItemId === 'exception-editor') 
  {
    const msg = `Insert one hostname per line. Press the "Save List" button to update the list.

Example of valid formats:

  example.com
  *.example.com
  https://example.com/*
  *://*.example.com/*`;
    chrome.windows.getCurrent(win => {
      chrome.windows.create({
        url: 'data/editor/index.html?msg=' + encodeURIComponent(msg) + '&storage=bypass',
        width: 600,
        height: 600,
        left: win.left + Math.round((win.width - 600) / 2),
        top: win.top + Math.round((win.height - 600) / 2),
        type: 'popup'
      });
    });
  }
  else 
  {
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
  if (changes.history) {
    chrome.storage.local.get({
      latitude: -1,
      longitude: -1
    }, async prefs => {
      for (const [a, b] of changes.history.oldValue || []) {
        await chrome.contextMenus.remove('set:' + a + '|' + b);
      }
      for (const [a, b] of changes.history.newValue || []) {
        await chrome.contextMenus.create({
          title: a + ', ' + b,
          id: 'set:' + a + '|' + b,
          contexts: ['action'],
          parentId: 'history',
          type: 'radio',
          checked: a === prefs.latitude && b === prefs.longitude
        });
      }
      chrome.contextMenus.update('history', {
        visible: changes.history.newValue.length !== 0
      });
    });
  }
  else if (changes.latitude || changes.longitude) {
    chrome.storage.local.get({
      latitude: -1,
      longitude: -1
    }, prefs => {
      chrome.contextMenus.update('set:' + prefs.latitude + '|' + prefs.longitude, {
        checked: true
      });
    });
  }
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
    case "geo-requested":
        chrome.action.setIcon({
          tabId: sender.tab.id,
          path: {
            '16': 'data/icons/' + (request.enabled ? 'granted' : 'denied') + '/16.png',
            '48': 'data/icons/' + (request.enabled ? 'granted' : 'denied') + '/48.png'
          }
        });
        chrome.action.setTitle({
          tabId: sender.tab.id,
          title: request.enabled ? 'GEO is spoofed on this page' : 'GEO request is denied'
        });
      break;
    case "geo-bypassed":
      chrome.action.setIcon({
        tabId: sender.tab.id,
        path: {
          '16': 'data/icons/bypassed/16.png',
          '48': 'data/icons/bypassed/48.png'
        }
      });
      chrome.action.setTitle({
        tabId: sender.tab.id,
        title: 'Spoofing is bypassed. This website is in the exception list'
      });
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
