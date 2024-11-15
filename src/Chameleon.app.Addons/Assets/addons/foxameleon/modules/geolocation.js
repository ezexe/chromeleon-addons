import { SETTINGS_ARRAY, Actions } from "./settings.js";
import { tryPrompt } from "./prompter.js";
import { log } from "./logger.js";

export async function createGeoContextMenus() {
  let settings = await browser.storage.sync.get(SETTINGS_ARRAY);
  chrome.contextMenus.create({
    title: "GEO",
    id: "geo",
    contexts: ["browser_action"],
  });
  chrome.contextMenus.create({
    title: "Enabled",
    id: "geo-enabled",
    contexts: ["browser_action"],
    type: "checkbox",
    checked: settings.geoSpoofing,
    parentId: "geo",
  });
  chrome.contextMenus.create({
    title: "Reset GEO data (ask for new values)",
    id: "geo-reset",
    contexts: ["browser_action"],
    parentId: "geo",
  });
  chrome.contextMenus.create({
    title: "Test GEO location",
    id: "geo-test",
    contexts: ["browser_action"],
    parentId: "geo",
  });
  chrome.contextMenus.create({
    title: "Options",
    id: "options",
    contexts: ["browser_action"],
    parentId: "geo",
  });
  chrome.contextMenus.create({
    title: "Randomize",
    id: "randomizeGeo",
    contexts: ["browser_action"],
    parentId: "options",
  });
  const randomizeOptions = [
    { title: "Disabled", value: false },
    { title: "0.1", value: 0.1 },
    { title: "0.01", value: 0.01 },
    { title: "0.001", value: 0.001 },
    { title: "0.0001", value: 0.0001 },
    { title: "0.00001", value: 0.00001 },
  ];
  randomizeOptions.forEach((option) => {
    chrome.contextMenus.create({
      title: option.title,
      id: `randomizeGeo:${option.value}`,
      contexts: ["browser_action"],
      checked: settings.randomizeGeo === option.value,
      type: "radio",
      parentId: "randomizeGeo",
    });
  });
  chrome.contextMenus.create({
    title: "Accuracy",
    id: "accuracy",
    contexts: ["browser_action"],
    parentId: "options",
  });
  const accuracyOptions = [64.0999, 34.0999, 10.0999];
  accuracyOptions.forEach((accuracy) => {
    chrome.contextMenus.create({
      title: accuracy.toString(),
      id: `accuracy:${accuracy}`,
      contexts: ["browser_action"],
      checked: settings.accuracy === accuracy,
      type: "radio",
      parentId: "accuracy",
    });
  });
  chrome.contextMenus.create({
    title: "GEO History",
    id: "history",
    contexts: ["browser_action"],
    visible: settings.history.length !== 0,
    parentId: "options",
  });
  for (const [a, b] of settings.history) {
    chrome.contextMenus.create({
      title: `${a}, ${b}`,
      id: `set:${a}|${b}`,
      contexts: ["browser_action"],
      parentId: "history",
      type: "radio",
      checked: settings.latitude === a && settings.longitude === b,
    });
  }
  chrome.contextMenus.create({
    title: "Bypass Spoofing",
    id: "bypass",
    contexts: ["browser_action"],
    parentId: "options",
  });
  chrome.contextMenus.create({
    title: "Add to the Exception List",
    id: "add-exception",
    contexts: ["browser_action"],
    parentId: "bypass",
  });
  chrome.contextMenus.create({
    title: "Remove from the Exception List",
    id: "remove-exception",
    contexts: ["browser_action"],
    parentId: "bypass",
  });
  chrome.contextMenus.create({
    title: "Open Exception List in Editor",
    id: "exception-editor",
    contexts: ["browser_action"],
    parentId: "bypass",
  });
}

export async function handleGeoMenuClick(info, tab) {
  let settings = await browser.storage.sync.get(SETTINGS_ARRAY);
  if (info.menuItemId === "geo-reset") {
    try {
      let userInput = await tryPrompt(tab, Actions.GEO_RESET);
      if (userInput === undefined) return;
      const [latitude, longitude] = userInput.split(",");
      settings.latitude = parseFloat(latitude.trim());
      settings.longitude = parseFloat(longitude.trim());
      updateGeoHistory();
    } catch (e) {
      log.error("Failed to reset GEO data", e);
    }
  } else if (info.menuItemId === "geo-enabled") {
    settings.geoSpoofing = info.checked;
  } else if (info.menuItemId === "geo-test") {
    chrome.tabs.create({
      url: "https://browserleaks.com/geo",
      index: tab.index + 1,
    });
  } else if (info.menuItemId.startsWith("set:")) {
    const [latitude, longitude] = info.menuItemId
      .slice(4)
      .split("|")
      .map(Number);
    settings.latitude = latitude;
    settings.longitude = longitude;
  } else if (info.menuItemId.startsWith("randomizeGeo:")) {
    settings.randomizeGeo =
      info.menuItemId === "randomizeGeo:false"
        ? false
        : parseFloat(info.menuItemId.slice(13));
  } else if (info.menuItemId.startsWith("accuracy:")) {
    settings.accuracy = parseFloat(info.menuItemId.slice(9));
  } else if (
    info.menuItemId === "add-exception" ||
    info.menuItemId === "remove-exception"
  ) {
    handleExceptionList(info.menuItemId, tab);
  } else if (info.menuItemId === "exception-editor") {
    openExceptionEditor();
  }
  await browser.storage.sync.set(settings);
}

function updateGeoHistory() {
  const names = settings.history.map(([a, b]) => `${a}|${b}`);
  if (!names.includes(`${settings.latitude}|${settings.longitude}`)) {
    settings.history.unshift([settings.latitude, settings.longitude]);
    settings.history = settings.history.slice(0, 10);
  }
}

function handleExceptionList(action, tab) {
  const url = tab.url;
  if (url.startsWith("http")) {
    const d = new URL(url).hostname;
    const hosts = new Set(settings.bypass);
    if (action === "add-exception") {
      hosts.add(d);
      hosts.add(`*.${d}`);
      log.info(`Adding ${d} and *.${d} to the exception list`);
    } else {
      hosts.delete(d);
      hosts.delete(`*.${d}`);
      log.info(`Removing ${d} and *.${d} from the exception list`);
    }
    settings.bypass = [...hosts];
  }
}

function openExceptionEditor() {
  const msg = `Insert one hostname per line. Press the "Save List" button to update the list.

Example of valid formats:

  example.com
  *.example.com
  https://example.com/*
  *://*.example.com/*`;
  chrome.windows.getCurrent((win) => {
    chrome.windows.create({
      url: `data/editor/index.html?msg=${encodeURIComponent(
        msg
      )}&storage=bypass`,
      width: 600,
      height: 600,
      left: win.left + Math.round((win.width - 600) / 2),
      top: win.top + Math.round((win.height - 600) / 2),
      type: "popup",
    });
  });
}
