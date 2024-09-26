(async () => {
  // const webglSpoofing = await import(
  //   browser.runtime.getURL("modules/spoof/webgl.js")
  // );
  // const canvasSpoofing = await import(
  //   browser.runtime.getURL("modules/spoof/canvas.js")
  // );
  // const clientRectsSpoofing = await import(
  //   browser.runtime.getURL("modules/spoof/clientrects.js")
  // );
  // const fontsSpoofing = await import(
  //   browser.runtime.getURL("modules/spoof/fonts.js")
  // );

  // webglSpoofing.apply();
  // canvasSpoofing.apply();
  // clientRectsSpoofing.apply();
  // fontsSpoofing.apply();

  log.log("Page context script loaded and active");
})();
