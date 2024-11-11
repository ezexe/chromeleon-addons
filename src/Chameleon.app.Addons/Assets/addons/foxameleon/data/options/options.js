import { SETTINGS_ARRAY } from "../../modules/settings.js";
document.addEventListener("DOMContentLoaded", async function () {
  let settings = await chrome.storage.sync.get(SETTINGS_ARRAY);
  const toast = document.getElementById("toast");

  function notify(msg) {
    toast.textContent = msg;
    clearTimeout(notify.id);
    notify.id = setTimeout(() => (toast.textContent = ""), 750);
  }

    chrome.extension.isAllowedIncognitoAccess((result) => {
      document.getElementById("incognito").textContent = result ? "Yes" : "No";
      document.getElementById("incognito").dataset.enabled = result;
    });

    document.getElementById("reset").addEventListener("click", (e) => {
      if (e.detail === 1) {
        notify("Double-click to reset!");
      } else {
        resetSettings();
      }
    });

  function resetSettings() {
    localStorage.clear();
    chrome.storage.session.clear(() => {
      chrome.storage.sync.clear(async () => {
        chrome.runtime.reload();
          await chrome.storage.sync.set(settings);
        settings = await chrome.storage.sync.get(SETTINGS_ARRAY);
        toast.textContent = "Options Reset";
        window.setTimeout(() => (toast.textContent = ""), 750);
        window.close();
      });
    });
  }
});
