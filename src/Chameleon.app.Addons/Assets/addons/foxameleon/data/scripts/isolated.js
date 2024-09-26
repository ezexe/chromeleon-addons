(async () => {
  let { SETTINGS_ARRAY } = await import(browser.runtime.getURL("modules/settings.js"));
  let settings = await browser.storage.sync.get(SETTINGS_ARRAY);

  const win = {
    send(type, data) {
      // Relay settings to page context script
      window.postMessage({ type: type, data: data }, "*");
    },
    listen() {
      // Listen for messages from the main script
      window.addEventListener(
        "message",
        async function (e) {
          if (
            e.data &&
            e.data.type === "REQUEST_FOXAMELEON_DEFENDER_SETTINGS"
          ) { 
            e.preventDefault();
            e.stopPropagation();
            win.send("FOXAMELEON_DEFENDER_SETTINGS_RESPONSE", settings);
          }
        },
        false
      );
    },
  };
  win.listen();
})();
