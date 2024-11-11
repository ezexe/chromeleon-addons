{
  // Asynchronously retrieve data from storage.sync, then cache it.
  browser.storage.sync
    .get([
      "enabled",
      "noiseLevel",
      "webglSpoofing",
      "canvasProtection",
      "clientRectsSpoofing",
      "fontsSpoofing",
      "dAPI",
      "webRtcEnabled",
      "eMode",
      "dMode",
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
    ])
    .then((settings) => {
      window.postMessage({ type: "cffjcbnflngjpnjenjogeaojacooflng-settings", settings }, "*");
    });

  // [
  //   "cffjcbnflngjpnjenjogeaojacooflng-sandboxed-rects",
  //   // "cffjcbnflngjpnjenjogeaojacooflng-sandboxed-gl",
  //   // "cffjcbnflngjpnjenjogeaojacooflng-sandboxed-canvas",
  //   // "cffjcbnflngjpnjenjogeaojacooflng-sandboxed-fonts",
  // ].forEach((ikey) => {
  //   if (document.documentElement.getAttribute(ikey) === null) {
  //     parent.postMessage({ key: ikey }, "*");
  //     window.top.postMessage({ key: ikey }, "*");
  //   } else {
  //     document.documentElement.removeAttribute(ikey);
  //   }
  // });
}
