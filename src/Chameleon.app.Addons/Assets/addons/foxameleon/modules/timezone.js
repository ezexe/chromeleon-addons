import { settings, updateSettings, Actions } from "./settings.js";
import { tryPrompt } from "./prompter.js";
import { log } from "./logger.js";
import { offsets } from "./offsets.js";

export function createTimezoneContextMenus() {
  chrome.contextMenus.create(
    { title: "Timezone", id: "timezone-menu", contexts: ["browser_action"] },
    () => chrome.runtime.lastError
  );
  chrome.contextMenus.create(
    {
      title: "Check my Current Timezone",
      id: "check-timezone",
      contexts: ["browser_action"],
      parentId: "timezone-menu",
    },
    () => chrome.runtime.lastError
  );
  chrome.contextMenus.create(
    {
      title: "Set Timezone",
      id: "set-timezone",
      contexts: ["browser_action"],
      parentId: "timezone-menu",
    },
    () => chrome.runtime.lastError
  );
  chrome.contextMenus.create(
    {
      title: "Update Timezone from Local System Time",
      id: "update-timezone",
      contexts: ["browser_action"],
      parentId: "timezone-menu",
    },
    () => chrome.runtime.lastError
  );
  chrome.contextMenus.create(
    {
      title: "Randomize Timezone",
      id: "randomize-timezone",
      contexts: ["browser_action"],
      type: "checkbox",
      parentId: "timezone-menu",
      checked: settings.randomizeTZ,
    },
    () => chrome.runtime.lastError
  );
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
      log.info(
        `Randomize Timezone enabled. Current timezone: ${settings.timezone}`
      );
    } else {
      log.info("Randomize Timezone disabled");
    }
  }
  updateSettings();
}

export function getRandomTimezone() {
  const timeZoneKeys = Object.keys(offsets);
  const randomKey =
    timeZoneKeys[Math.floor(Math.random() * timeZoneKeys.length)];
  return randomKey;
}

export function getTimezoneOffset(timezone) {
  let date = new Date();
  const value =
    "GMT" +
    date
      .toLocaleString("en", {
        timeZone: timezone,
        timeZoneName: "longOffset",
      })
      .split("GMT")[1];
  if (value === "GMT") {
    return 0;
  }
  const o = /(?<hh>[-+]\d{2}):(?<mm>\d{2})/.exec(value);
  return Number(o.groups.hh) * 60 + Number(o.groups.mm);
}
