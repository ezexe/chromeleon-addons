// // To update settings
// chrome.runtime.sendMessage({action: 'updateSettings', settings: {server: 'http://new-proxy.example.com:8080'}}, response => {
//   console.log(response.status);
// });

// // To get current settings
// chrome.runtime.sendMessage({action: 'getSettings'}, settings => {
//   console.log(settings);
// });


function log(message, type = 'info') {
  // get addons name fome manifest.json
  const addonName = `[${chrome.runtime.getManifest().name}]`;
  if (settings.debug) {
    if (type === 'error') {
      console.error(`${addonName} ${message}`);
    } else {
      console.log(`${addonName} ${message}`);
    }
  }
}

function updateProxyConfig() {
  return {
    mode: "fixed_servers",
    rules: {
      singleProxy: {
        scheme: "http",
        host: settings.host,
        port: settings.port
      },
      bypassList: ["<local>"]
    }
  };
}

function updateNoProxyConfig() {
    return {
        mode: "system"
    };
}
async function updateProxy() {
  try {
    log('Updating proxy settings');
    const proxyConfig = settings.enabled ? updateProxyConfig() : updateNoProxyConfig();
    await chrome.proxy.settings.set({value: proxyConfig, scope: 'regular'});
    let tabs = await chrome.tabs.query({});
    //if (tabs.length > 1) {
    //  await chrome.tabs.remove(tabs[tabs.length - 1].id);
    //}
      await chrome.tabs.update({ url: settings.url });
    /*  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });*/
   /*   await chrome.tabs.update({ url: url });*/
      
    log('Proxy settings updated successfully');
  } catch (error) {
    log(`Error updating proxy settings: ${error.message}`);
  }
}

async function reloadAllTabs() {
  try {
    log('Reloading all tabs');
    let tabs = await chrome.tabs.query({});
    for(let tab of tabs) {
      await chrome.tabs.reload(tab.id);
    }
    log('All tabs reloaded successfully');
  } catch (error) {
    log(`Error reloading tabs: ${error.message}`, 'error');
  }
}

chrome.webRequest.onAuthRequired.addListener(
  (details) => {
    log('Authentication required');
    return {
      authCredentials: {
        username: settings.username,
        password: settings.password,
      },
    };
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set(settings, () => {
    log('Default settings initialized');
    // updateProxy();
    // reloadAllTabs();
  });
});

chrome.runtime.onStartup.addListener(async () => {
  await updateProxy();
  await reloadAllTabs();
  chrome.storage.sync.get(null, (items) => {
    settings = {...settings, ...items};
    log('Settings loaded');
    // reloadAllTabs();
  });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let key in changes) {
    settings[key] = changes[key].newValue;
  }
  log('Settings updated');
  updateProxy();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateSettings') {
    chrome.storage.sync.set(request.settings, () => {
      log('Settings updated via message');
      sendResponse({status: 'Settings updated'});
    });
  } else if (request.action === 'getSettings') {
    sendResponse(settings);
  }
  return true;
});
