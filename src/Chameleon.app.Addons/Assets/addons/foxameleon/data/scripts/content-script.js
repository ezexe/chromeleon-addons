(async function () {
  let { SETTINGS_ARRAY, promptDictionary, Actions } = await import(browser.runtime.getURL("modules/settings.js"));
  let settings = await browser.storage.sync.get(SETTINGS_ARRAY);

  let { setLogLevel, log } = await import(browser.runtime.getURL("modules/logger.js"));
  setLogLevel(settings.debug);

  const background = {
    async send(id, data) {
      try {
        const response = await browser.runtime.sendMessage({
          action: id,
          data: data,
        });
        log.info("Message sent successfully:", response);
        return response;
      } catch (error) {
        log.error("Error sending message:", error);
        throw error;
      }
    },
    listen() {
      browser.runtime.onMessage.addListener(async function (
        request,
        sender,
        sendResponse
      ) {
        log.info("Received message in content script:", request);
        if (request.action === Actions.TZ_RESET || request.action === Actions.GEO_RESET) {
          const { promptText, defaultInput } = promptDictionary[request.action];
          const userInput = prompt(promptText, defaultInput);
          if (userInput === null) {
            return { status: "cancelled" };
          } else {
            return { status: "success", userInput: userInput };
          }
        }
      });
    },
  };
  background.listen();
})();
