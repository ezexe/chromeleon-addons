import { settings, updateSettings, Actions } from './settings.js';
import { tryPrompt } from './prompter.js';
import { log } from './logger.js';
import { offsets } from './offsets.js';

export function createTimezoneContextMenus() {
  chrome.contextMenus.create({ title: "Timezone", id: "timezone-menu", contexts: ["action"] }, () => chrome.runtime.lastError);
  chrome.contextMenus.create({ title: "Check my Current Timezone", id: "check-timezone", contexts: ["action"], parentId: "timezone-menu" }, () => chrome.runtime.lastError);
  chrome.contextMenus.create({ title: "Set Timezone", id: "set-timezone", contexts: ["action"], parentId: "timezone-menu" }, () => chrome.runtime.lastError);
  chrome.contextMenus.create({ title: "Update Timezone from Local System Time", id: "update-timezone", contexts: ["action"], parentId: "timezone-menu" }, () => chrome.runtime.lastError);
  chrome.contextMenus.create({ title: "Randomize Timezone", id: "randomize-timezone", contexts: ["action"], type: "checkbox", parentId: "timezone-menu", checked: settings.randomizeTZ }, () => chrome.runtime.lastError);
}

export async function handleTimezoneMenuClick(info, tab) {
  if (info.menuItemId === "update-timezone") {
    settings.myIP = true;
    settings.randomizeTZ = false;
    log.info("Timezone updated from local system time");
  } else if (info.menuItemId === "set-timezone") {
    let userInput = await tryPrompt(tab, Actions.TZ_RESET);
    if (userInput !== null) {
      settings.timezone = userInput.trim();
      settings.randomizeTZ = false;
      log.info(`Timezone set to: ${settings.timezone}`);
    }
  } else if (info.menuItemId === "check-timezone") {
    chrome.tabs.create({ url: "https://webbrowsertools.com/timezone/" });
  } else if (info.menuItemId === "randomize-timezone") {
    settings.randomizeTZ = info.checked;
    if (settings.randomizeTZ) {
      settings.myIP = false;
      log.info(`Randomize Timezone enabled. Current timezone: ${settings.timezone}`);
    } else {
      log.info("Randomize Timezone disabled");
    }
  }
  updateSettings();
}