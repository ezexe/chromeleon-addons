import { SETTINGS_ARRAY, settings, Actions, updateSettings } from "./settings.js";
import { tryPrompt } from "./prompter.js";
import { log } from "./logger.js";
import { offsets } from "./offsets.js";

export async function createTimezoneContextMenus() {
/*  let settings = await browser.storage.sync.get(SETTINGS_ARRAY);*/
  chrome.contextMenus.create(
    { title: "Timezone", id: "timezone-menu", contexts: ["action"] },
    () => chrome.runtime.lastError
  );
  chrome.contextMenus.create({
    title: "Enabled",
    id: "tz-enabled",
    contexts: ["action"],
    type: "checkbox",
    checked: settings.timezoneSpoofing,
    parentId: "timezone-menu",
  },
  () => chrome.runtime.lastError);
  chrome.contextMenus.create(
    {
      title: "Select From List Of Available Timezones",
      id: "list-timezones",
      contexts: ["action"],
      parentId: "timezone-menu",
    },
    () => {
      chrome.runtime.lastError;
      Object.keys(offsets).forEach((zone) => {
        const offset = offsets[zone].offset;
        const offsetHours = offset / 60;
        chrome.contextMenus.create(
          {
            title: `${zone} (GMT${offsetHours > 0 ? "+" : ""}${offsetHours})`,
            id: `timezone-${zone}`,
            contexts: ["action"],
            parentId: "list-timezones",
          },
          () => chrome.runtime.lastError
        );
      });
    }
  );
  chrome.contextMenus.create(
    {
      title: "Set Timezone (ask for new value)",
      id: "set-timezone",
      contexts: ["action"],
      parentId: "timezone-menu",
    },
    () => chrome.runtime.lastError
  );
  chrome.contextMenus.create(
    {
      title: "Update Timezone from Local System Time",
      id: "update-timezone",
      contexts: ["action"],
      parentId: "timezone-menu",
    },
    () => chrome.runtime.lastError
  );
  chrome.contextMenus.create(
    {
      title: "Randomize Timezone",
      id: "randomize-timezone",
      contexts: ["action"],
      type: "checkbox",
      parentId: "timezone-menu",
      checked: settings.randomizeTZ,
    },
    () => chrome.runtime.lastError
  );
  chrome.contextMenus.create(
    {
      title: "Check my Current Timezone",
      id: "check-timezone",
      contexts: ["action"],
      parentId: "timezone-menu",
    },
    () => chrome.runtime.lastError
  );
}

export async function handleTimezoneMenuClick(info, tab) {
/*  let settings = await browser.storage.sync.get(SETTINGS_ARRAY);*/
  try {
    if (info.menuItemId === "tz-enabled") {
      settings.timezoneSpoofing = info.checked;
    } else if (info.menuItemId === "update-timezone") {
      settings.myIP = true;
      settings.randomizeTZ = false;
      log.info("Timezone updated from local system time");
    } else if (info.menuItemId === "set-timezone") {
      let userInput = await tryPrompt(tab, Actions.TZ_RESET);
      if (userInput !== undefined) {
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
        log.info(
          `Randomize Timezone enabled. Current timezone: ${settings.timezone}`
        );
      } else {
        log.info("Randomize Timezone disabled");
      }
    } else if (info.menuItemId.startsWith("timezone-")) {
      const selectedZoneId = info.menuItemId.replace("timezone-", "");
      // Update settings and log
      settings.timezone = selectedZoneId;
      log.info(`Selected Timezone: ${selectedZoneId}`);
    }
  } catch (error) {
    log.error(`Failed to attach debugger to tab ${tab.id}:`, error);
  }
    /* await browser.storage.sync.set(settings);*/
    updateSettings();
}
