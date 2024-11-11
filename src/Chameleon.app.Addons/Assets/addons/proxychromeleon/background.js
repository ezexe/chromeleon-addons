
chrome.webRequest.onAuthRequired.addListener(
  (details) => {
    log("Authentication required");
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

chrome.runtime.onInstalled.addListener(async () => {
  let tabs = await chrome.tabs.query({});
  for (let tab of tabs) {
    try {
      await chrome.tabs.discard(tab.id);
    }catch(e){
      log(e, "error");
    }
  }
  await updateProxy();
  // Connect to the receiver extension using its extension ID
  //const port = chrome.runtime.connect("cffjcbnflngjpnjenjogeaojacooflng", {
  //  name: "communication",
  //});

  //// Send a message
  //port.postMessage({ message: "reload" });

  // Listen for responses
   //port.onMessage.addListener((msg) => {
   //    port.postMessage({ message: BuildExtSettings });
    //});
    const extensionId = "cffjcbnflngjpnjenjogeaojacooflng";
    chrome.management.setEnabled(extensionId, false, function () {
        chrome.management.setEnabled(extensionId, true, function () {
                chrome.management.launchApp(extensionId);
        });
    });
});

function log(message, type = "info") {
  // get addons name fome manifest.json
  const addonName = `[${chrome.runtime.getManifest().name}]`;
  if (settings.debug) {
    if (type === "error") {
      console.log(`[error] ${addonName} ${message}`);
    } else {
      console.log(`${addonName} ${message}`);
    }
  }
}

async function updateProxy() {
  try {
    log("Updating proxy settings");

    const proxyConfig = settings.enabled
      ? {
          mode: "fixed_servers",
          rules: {
            singleProxy: {
              scheme: "http",
              host: settings.host,
              port: settings.port,
            },
            bypassList: ["<local>"],
          },
        }
      : { mode: "system" };
    await chrome.proxy.settings.set({ value: proxyConfig, scope: "regular" });
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab) {
      await chrome.tabs.update(tab.id, { url: settings.url });
    }
    log("Proxy settings updated successfully");
  } catch (error) {
    log(`Error updating proxy settings: ${error.message}`);
  }
}

// async function reloadExtensionsUsingApi() {
//   await updateProxy();

//   // find all unpacked extensions and reload them
//   //await chrome.management.getAll(function (a) {
//   //    var ext = {};
//   //    for (var i = 0; i < a.length; i++) {
//   //        ext = a[i];
//   //        if ((ext.name !== 'Chromeleon Auto Proxy') &&  // don't reload yourself
//   //            (ext.installType == "development") &&
//   //            (ext.enabled == true) &&
//   //            (ext.name != "Chromeleon Auto Proxy")) {
//   //            log(ext.name + " reloaded");
//   //            (function (extensionId, extensionType) {
//   //                // re-launch packaged app
//   //                if (extensionType == "packaged_app") {
//   //                    chrome.management.launchApp(extensionId);
//   //                }
//   //                // disable
//   //                chrome.management.setEnabled(extensionId, false, function () {
//   //                    // re-enable
//   //                    chrome.management.setEnabled(extensionId, true, function () {
//   //                        // re-launch packaged app
//   //                        //if (extensionType == "packaged_app") {
//   //                        //    chrome.management.launchApp(extensionId);
//   //                        //}
//   //                    });
//   //                });
//   //            })(ext.id, ext.type);
//   //        }
//   //    }
//   //});
// }
//reloadExtensionsUsingApi();

//chrome.runtime.onInstalled.addListener(() => {
//  chrome.storage.sync.set(settings, () => {
//    log('Default settings initialized');
//    // updateProxy();
//    // reloadAllTabs();
//  });
//});

//chrome.runtime.onStartup.addListener(async () => {
//  await updateProxy();
//  await reloadAllTabs();
//  chrome.storage.sync.get(null, (items) => {
//    settings = {...settings, ...items};
//    log('Settings loaded');
//    // reloadAllTabs();
//  });
//});

//chrome.storage.onChanged.addListener((changes, namespace) => {
//  for (let key in changes) {
//    settings[key] = changes[key].newValue;
//  }
//  log('Settings updated');
//  updateProxy();
//});

//chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//  if (request.action === 'updateSettings') {
//    chrome.storage.sync.set(request.settings, () => {
//      log('Settings updated via message');
//      sendResponse({status: 'Settings updated'});
//    });
//  } else if (request.action === 'getSettings') {
//    sendResponse(settings);
//  }
//  return true;
//});
