module.exports = {
    run: {
      firefox: "firefox",
      startUrl: ["about:debugging"],
      browserConsole: true,
      pref: [
        "extensions.webextensions.uuids={\"foxameleon@chameleonmode.com\":\"ec048ff5-7001-4f5e-a65b-fb95f3575a71\"}"
      ]
    }
  };