import logger from "../../modules/logger.js";
import { SETTINGS_ARRAY } from "../../modules/settings.js";
let settings = {};
let isFirefox = null;

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
  console.log(SETTINGS_ARRAY,"--SETTINGS_ARRAY--");
  try
  {
    chrome.storage.sync.get(SETTINGS_ARRAY, function(p) {
      settings = p || settings;
        document.getElementById(
          settings.enabled ? "enabled" : "disabled"
        ).checked = true;
        document.getElementById("when-enabled").value = settings.eMode;
        document.getElementById("when-disabled").value = settings.dMode;
        document.getElementById("device-enum-api").checked = settings.dAPI;
    });
  }
  catch(error)
  {
    logger("error", "Error loading settings", error)
  }
}

async function saveSettings() {
  settings.enabled = document.getElementById("enabled").checked;
  settings.eMode = document.getElementById("when-enabled").value;
  settings.dMode = document.getElementById("when-disabled").value;
  settings.dAPI = document.getElementById("device-enum-api").checked;
  await chrome.storage.sync.set(settings);

  chrome.storage.local.set({
    timezone: user.value,
    random: document.getElementById('random').checked,
    myIP: document.getElementById('update').checked,
    locale: 'en-US'
  }, () => {
    chrome.runtime.sendMessage({
      method: 'update-offset'
    });
    toast.textContent = 'Options saved';
    window.setTimeout(() => toast.textContent = '', 750);
  });

}

function resetSettings() {
  // TODO: Reset to default settings
  localStorage.clear();
  chrome.storage.session.clear(() => {
    chrome.storage.local.clear(() => {
      chrome.runtime.reload();
      window.close();
    });
  });
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

// timezone addon

/* global offsets */
'use strict';

const offset = document.getElementById('offset');
const user = document.getElementById('user');

console.log(offsets,"--offsets--");

const update = () => chrome.runtime.sendMessage({
  method: 'get-offset',
  value: user.value
}, offset => document.getElementById('minutes').value = offset);

offset.addEventListener('change', update);

const initializeTimezoneUI = () => 
{
  console.log("--initializeTimezoneUI--");
  const f = document.createDocumentFragment();
  Object.keys(offsets).sort((a, b) => offsets[b].offset - offsets[a].offset).forEach(key => {
    const option = document.createElement('option');
    option.value = key;

    const of = offsets[key].offset === 0 ? 'GMT' : (
      (offsets[key].offset > 0 ? '+' : '-') +
      (Math.abs(offsets[key].offset) / 60).toString().split('.')[0].padStart(2, '0') + ':' +
      (Math.abs(offsets[key].offset) % 60).toString().padStart(2, '0')
    );
    option.textContent = `${key} (${of})`;
    f.appendChild(option);
  });
  offset.appendChild(f);
  chrome.storage.local.get({
    timezone: 'Etc/GMT',
    random: false,
    myIP: false,
    locale: 'en-US'
  }, prefs => {
    console.log(offset,user,prefs,prefs.timezone,"--prefs--");
    offset.value = user.value = prefs.timezone;
    offset.dispatchEvent(new Event('change'));
    document.getElementById('random').checked = prefs.random;
    document.getElementById('update').checked = prefs.myIP;
  });
}

offset.onchange = e => {
  if (e.target.value) {
    user.value = e.target.value;
    user.dispatchEvent(new Event('input'));
  } 
};

const date = new Date();
user.oninput = e => {
  try {
    date.toLocaleString('en', {
      timeZone: e.target.value,
      timeZoneName: 'longOffset'
    });
    update();
    offset.value = user.value;
    e.target.setCustomValidity('');
  }
  catch (ee) {
    e.target.setCustomValidity('Not a valid timezone');
  }
};

document.addEventListener("DOMContentLoaded", function(){
  initializeUI();
  initializeTimezoneUI();
});

logger("log", "Options script loaded");
