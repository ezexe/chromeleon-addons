import { SETTINGS_ARRAY } from "./settings.js";
import { offsets } from "./offsets.js";
import { log } from "./logger.js";

export async function createTimezoneContextMenus() {
  let settings = await browser.storage.sync.get(SETTINGS_ARRAY);
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
      title: "Randomize Timezone",
      id: "randomize-timezone",
      contexts: ["browser_action"],
      type: "checkbox",
      parentId: "timezone-menu",
      checked: settings.randomizeTZ,
    },
    () => chrome.runtime.lastError
  );
  chrome.contextMenus.create(
    {
      title: "Set Timezone to Computers System Time",
      id: "update-timezone",
      contexts: ["browser_action"],
      parentId: "timezone-menu",
    },
    () => chrome.runtime.lastError
  );
  chrome.contextMenus.create(
    {
      title: "Select From List Of Available Timezones",
      id: "list-timezones",
      contexts: ["browser_action"],
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
            contexts: ["browser_action"],
            parentId: "list-timezones",
          },
          () => chrome.runtime.lastError
        );
      });
    }
  );
}

export async function handleTimezoneMenuClick(info, tab) {
  let settings = await browser.storage.sync.get(SETTINGS_ARRAY);
  if (info.menuItemId === "update-timezone") {
    settings.myIP = true;
    settings.randomizeTZ = false;
    log.info("Timezone updated from local system time");
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
    settings.myIP = false;
    settings.timezone = selectedZoneId;
    log.info(`Selected Timezone: ${selectedZoneId}`);
  }
  await browser.storage.sync.set(settings);
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
