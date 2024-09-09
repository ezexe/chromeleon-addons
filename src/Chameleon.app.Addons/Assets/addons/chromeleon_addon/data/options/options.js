import logger from "../../modules/logger.js";
import { SETTINGS_ARRAY } from "../../modules/settings.js";
let settings = {};

const toast = document.getElementById("toast");

function notify(msg) {
  toast.textContent = msg;
  clearTimeout(notify.id);
  notify.id = setTimeout(() => (toast.textContent = ""), 750);
}

function initializeUI() {
  if (!isFirefox) {
    document.querySelector('[value="proxy_only"]').disabled = true;
  }

  chrome.extension.isAllowedIncognitoAccess((result) => {
    document.getElementById("incognito").textContent = result ? "Yes" : "No";
    document.getElementById("incognito").dataset.enabled = result;
  });

  loadSettings();
  setupEventListeners();
}

function loadSettings() {
  chrome.storage.sync.get(SETTINGS_ARRAY, function(p) {
    settings = p || settings;
      document.getElementById(
        settings.enabled ? "enabled" : "disabled"
      ).checked = true;
      document.getElementById("when-enabled").value = settings.eMode;
      document.getElementById("when-disabled").value = settings.dMode;
      document.getElementById("device-enum-api").checked = settings.dAPI;
  }).catch((error) => logger("error", "Error loading settings", error));
}

async function saveSettings() {
  settings.enabled = document.getElementById("enabled").checked;
  settings.eMode = document.getElementById("when-enabled").value;
  settings.dMode = document.getElementById("when-disabled").value;
  settings.dAPI = document.getElementById("device-enum-api").checked;
  await chrome.storage.sync.set(settings);
}

function resetSettings() {
  // TODO: Reset to default settings
}

function setupEventListeners() {
  document.getElementById("save").addEventListener("click", saveSettings);

  document.getElementById("reset").addEventListener("click", (e) => {
    if (e.detail === 1) {
      notify("Double-click to reset!");
    } else {
      resetSettings();
    }
  });

  document.getElementById("support").addEventListener("click", () => {
    chrome.tabs.create({
      url: chrome.runtime.getManifest().homepage_url + "?rd=donate",
    });
  });
}

document.addEventListener("DOMContentLoaded", initializeUI);

logger("log", "Options script loaded");
