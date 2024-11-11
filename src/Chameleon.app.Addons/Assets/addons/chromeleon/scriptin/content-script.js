(async function () {
  let { SETTINGS_ARRAY, promptDictionary, Actions } = await import(
    chrome.runtime.getURL("modules/settings.js")
  );
  let settings = await chrome.storage.sync.get(SETTINGS_ARRAY);

  const background = {
    send(id, data, callback) {
      chrome.runtime.sendMessage(
        {
          action: id,
          data: data,
        },
        function (response) {
          if (chrome.runtime.lastError) {
          } else {
            callback && callback(response);
          }
        }
      );
    },
    listen() {
      chrome.runtime.onMessage.addListener(async function (
        request,
        sender,
        sendResponse
      ) {
        if (
          request.action === Actions.TZ_RESET ||
          request.action === Actions.GEO_RESET
        ) {
          let { promptText, defaultInput } = promptDictionary[request.action];
          if (request.action === Actions.GEO_RESET)
            defaultInput = `${settings.latitude}, ${settings.longitude}`;

          const userInput = prompt(promptText, defaultInput);
          if (userInput === null) {
            sendResponse({ status: "cancelled" });
          } else {
            sendResponse({ status: "success", userInput: userInput });
          }
        }
      });
    },
  };
  background.listen();

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getGeolocation") {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            sendResponse({ latitude, longitude });
          },
          (error) => {
            sendResponse({ error: `Geolocation error: ${error.message}` });
          }
        );
      } else {
        sendResponse({ error: "Geolocation API not supported" });
      }
    }
    return true; // Required for asynchronous sendResponse
  });
})();
