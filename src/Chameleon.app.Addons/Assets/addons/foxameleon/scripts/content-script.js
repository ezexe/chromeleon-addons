(async function () {
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
          let settings = await browser.storage.sync.get([
            "enabled",
            "webglSpoofing",
            "canvasProtection",
            "clientRectsSpoofing",
            "fontsSpoofing",
            "geoSpoofing",
            "timezoneSpoofing",
            "dAPI",
            "webRtcEnabled",
            "randomizeTZ",
            "randomizeGeo",
            "noiseLevel",
            "eMode",
            "dMode",
            "timezone",
            "locale",
            "debug",
            "latitude",
            "longitude",
            "accuracy",
            "myIP",
            "bypass",
            "history",
            "DOMRectnoise",
            "DOMRectReadOnlynoise",
            "WebGLnoise",
            "WebGLnoiseAmplitude",
            "canvasR",
            "canvasG",
            "canvasB",
            "canvasA",
            "Fontsnoise",
            "Fontssign",
          ]);
          if (request.action === "geo_reset") {
          const promptText = "Enter a \"latitude\" and \"longitude\" separated by a comma. Use https://www.latlong.net/ to find these values";
          const defaultInput = `${settings.latitude}, ${settings.longitude}`;

          const userInput = prompt(promptText, defaultInput);
          if (userInput === undefined) {
            sendResponse({status: "cancelled"});
          } else {
              /* sendResponse({status: "success", userInput: userInput});*/
              try {
                  const [latitude, longitude] = userInput.split(",");
                  settings.latitude = parseFloat(latitude.trim());
                  settings.longitude = parseFloat(longitude.trim());
                  await browser.storage.sync.set(settings);
              } catch (e) {
                  log.error("Failed to reset GEO data", e);
              }
          }
        }
      });
    },
  };
  background.listen();

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'getGeolocation') {
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
                sendResponse({ error: 'Geolocation API not supported' });
            }
        }
        return true;  // Required for asynchronous sendResponse
    });
})();
