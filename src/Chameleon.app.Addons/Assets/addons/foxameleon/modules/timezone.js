const { settings, updateSettings, Actions } = require('./settings.js');
const { tryPrompt } = require('./prompter.js');
const { log } = require('./logger.js');
const { offsets } = require('./offsets.js');

function createTimezoneContextMenus() {
  browser.contextMenus.create({ title: "Timezone", id: "timezone-menu", contexts: ["browser_action"] }, () => browser.runtime.lastError);
  browser.contextMenus.create({ title: "Check my Current Timezone", id: "check-timezone", contexts: ["browser_action"], parentId: "timezone-menu" }, () => browser.runtime.lastError);
  browser.contextMenus.create({ title: "Set Timezone", id: "set-timezone", contexts: ["browser_action"], parentId: "timezone-menu" }, () => browser.runtime.lastError);
  browser.contextMenus.create({ title: "Update Timezone from Local System Time", id: "update-timezone", contexts: ["browser_action"], parentId: "timezone-menu" }, () => browser.runtime.lastError);
  browser.contextMenus.create({ title: "Randomize Timezone", id: "randomize-timezone", contexts: ["browser_action"], type: "checkbox", parentId: "timezone-menu", checked: settings.randomizeTZ }, () => browser.runtime.lastError);
}

async function handleTimezoneMenuClick(info, tab) {
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
    browser.tabs.create({ url: "https://webbrowsertools.com/timezone/" });
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

module.exports = {
  createTimezoneContextMenus,
  handleTimezoneMenuClick
};