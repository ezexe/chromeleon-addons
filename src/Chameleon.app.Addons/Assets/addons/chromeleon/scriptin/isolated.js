{
  [
    "cffjcbnflngjpnjenjogeaojacooflng-sandboxed-rects",
    "cffjcbnflngjpnjenjogeaojacooflng-sandboxed-gl",
    "cffjcbnflngjpnjenjogeaojacooflng-sandboxed-canvas",
    "cffjcbnflngjpnjenjogeaojacooflng-sandboxed-fonts",
  ].forEach((ikey) => {
    if (document.documentElement.getAttribute(ikey) === null) {
      parent.postMessage({ key: ikey }, "*");
      window.top.postMessage({ key: ikey }, "*");
    } else {
      document.documentElement.removeAttribute(ikey);
    }
  });
}
