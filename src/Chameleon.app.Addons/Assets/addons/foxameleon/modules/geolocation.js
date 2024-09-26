const { settings, updateSettings, Actions } = require('./settings.js');
const { tryPrompt } = require('./prompter.js');
const { log } = require('./logger.js');

function createGeoContextMenus() {
  browser.contextMenus.create({ title: "GEO", id: "geo", contexts: ["browser_action"] });
  browser.contextMenus.create({ title: "Allow/Disallow GEO requests", id: "enabled", contexts: ["browser_action"], type: "checkbox", checked: settings.geoSpoofing, parentId: "geo" });
  browser.contextMenus.create({ title: "Reset GEO data (ask for new values)", id: "reset", contexts: ["browser_action"], parentId: "geo" });
  browser.contextMenus.create({ title: "Test GEO location", id: "geo-test", contexts: ["browser_action"], parentId: "geo" });
  browser.contextMenus.create({ title: "Options", id: "options", contexts: ["browser_action"], parentId: "geo" });
  createRandomizeGeoMenu();
  createAccuracyMenu();
  createHistoryMenu();
  createBypassMenu();
}

function createRandomizeGeoMenu() {
  browser.contextMenus.create({ title: "Randomize", id: "randomizeGeo", contexts: ["browser_action"], parentId: "options" });
  const randomizeOptions = [
    { title: "Disabled", value: false },
    { title: "0.1", value: 0.1 },
    { title: "0.01", value: 0.01 },
    { title: "0.001", value: 0.001 },
    { title: "0.0001", value: 0.0001 },
    { title: "0.00001", value: 0.00001 },
  ];
  randomizeOptions.forEach(option => {
    browser.contextMenus.create({
      title: option.title,
      id: `randomizeGeo:${option.value}`,
      contexts: ["browser_action"],
      checked: settings.randomizeGeo === option.value,
      type: "radio",
      parentId: "randomizeGeo",
    });
  });
}

function createAccuracyMenu() {
  browser.contextMenus.create({ title: "Accuracy", id: "accuracy", contexts: ["browser_action"], parentId: "options" });
  const accuracyOptions = [64.0999, 34.0999, 10.0999];
  accuracyOptions.forEach(accuracy => {
    browser.contextMenus.create({
      title: accuracy.toString(),
      id: `accuracy:${accuracy}`,
      contexts: ["browser_action"],
      checked: settings.accuracy === accuracy,
      type: "radio",
      parentId: "accuracy",
    });
  });
}

function createHistoryMenu() {
  browser.contextMenus.create({
    title: "GEO History",
    id: "history",
    contexts: ["browser_action"],
    visible: settings.history.length !== 0,
    parentId: "options",
  });
  for (const [a, b] of settings.history) {
    browser.contextMenus.create({
      title: `${a}, ${b}`,
      id: `set:${a}|${b}`,
      contexts: ["browser_action"],
      parentId: "history",
      type: "radio",
      checked: settings.latitude === a && settings.longitude === b,
    });
  }
}

function createBypassMenu() {
  browser.contextMenus.create({ title: "Bypass Spoofing", id: "bypass", contexts: ["browser_action"], parentId: "options" });
  browser.contextMenus.create({ title: "Add to the Exception List", id: "add-exception", contexts: ["browser_action"], parentId: "bypass" });
  browser.contextMenus.create({ title: "Remove from the Exception List", id: "remove-exception", contexts: ["browser_action"], parentId: "bypass" });
  browser.contextMenus.create({ title: "Open Exception List in Editor", id: "exception-editor", contexts: ["browser_action"], parentId: "bypass" });
}

async function handleGeoMenuClick(info, tab) {
  if (info.menuItemId === "reset") {
    let userInput = await tryPrompt(tab, Actions.GEO_RESET);
    if (userInput === null) return;
    const [latitude, longitude] = userInput.split(",");
    settings.latitude = parseFloat(latitude.trim());
    settings.longitude = parseFloat(longitude.trim());
    updateGeoHistory();
  } else if (info.menuItemId === "enabled") {
    settings.geoSpoofing = info.checked;
  } else if (info.menuItemId === "geo-test") {
    browser.tabs.create({ url: "https://webbrowsertools.com/geolocation/", index: tab.index + 1 });
  } else if (info.menuItemId.startsWith("set:")) {
    const [latitude, longitude] = info.menuItemId.slice(4).split("|").map(Number);
    settings.latitude = latitude;
    settings.longitude = longitude;
  } else if (info.menuItemId.startsWith("randomizeGeo:")) {
    settings.randomizeGeo = info.menuItemId === "randomizeGeo:false" ? false : parseFloat(info.menuItemId.slice(13));
  } else if (info.menuItemId.startsWith("accuracy:")) {
    settings.accuracy = parseFloat(info.menuItemId.slice(9));
  } else if (info.menuItemId === "add-exception" || info.menuItemId === "remove-exception") {
    handleExceptionList(info.menuItemId, tab);
  } else if (info.menuItemId === "exception-editor") {
    openExceptionEditor();
  }
  updateSettings();
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
  browser.windows.getCurrent((win) => {
    browser.windows.create({
      url: `data/editor/index.html?msg=${encodeURIComponent(msg)}&storage=bypass`,
      width: 600,
      height: 600,
      left: win.left + Math.round((win.width - 600) / 2),
      top: win.top + Math.round((win.height - 600) / 2),
      type: "popup",
    });
  });
}

module.exports = {
  createGeoContextMenus,
  handleGeoMenuClick
};