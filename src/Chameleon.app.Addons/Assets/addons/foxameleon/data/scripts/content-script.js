(async function () {
  let { SETTINGS_ARRAY, promptDictionary, Actions } = await import(chrome.runtime.getURL("modules/settings.js"));
  let settings = await chrome.storage.sync.get(SETTINGS_ARRAY);

  let { setLogLevel, log } = await import(chrome.runtime.getURL("modules/logger.js"));
  setLogLevel(settings.debug);

  const background = {
    send(id, data, callback) {
      chrome.runtime.sendMessage(
        {
          action: id,
          data: data,
        },
        function (response) {
          if (chrome.runtime.lastError) {
            log.error("Error sending message:", chrome.runtime.lastError);
          } else {
            log.info("Message sent successfully:", response);
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
        log.info("Received message in content script:", request);
        if (request.action === Actions.TZ_RESET || request.action === Actions.GEO_RESET) {
          const { promptText, defaultInput } = promptDictionary[request.action];
          const userInput = prompt(promptText, defaultInput);
          if (userInput === null) {
            sendResponse({status: "cancelled"});
          } else {
            sendResponse({status: "success", userInput: userInput});
          }
        }
      });
    },
  };
  background.listen();
})();
