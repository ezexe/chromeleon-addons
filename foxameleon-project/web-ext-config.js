module.exports = {
    run: {
      firefox: "firefox",
      startUrl: ["about:debugging"],
      browserConsole: true,
      pref: [
        "extensions.webextensions.uuids={\"foxameleon@yourdomain.com\":\"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\"}"
      ]
    }
  };