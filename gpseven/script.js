(function () {
  "use strict";

  var currentScript = document.currentScript;
  var baseUrl = currentScript && currentScript.src
    ? currentScript.src.split("?")[0].replace(/\/[^/]+$/, "")
    : "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/gpseven";

  var href = baseUrl + "/gpseven.css?v=" + Date.now();
  var existing = document.querySelector('link[data-gpseven-css="true"]');
  var maxWidthSelector = ".css-fkpkqq";
  var spanColorSelector = ".css-l5xv05 .css-25j2b4 span.css-1aiujm0";
  var wideContainerSelector = ".css-11xzi44 .css-1huuf1k";
  var narrowContainerSelector = ".css-11xzi44 .css-17u1px6";
  var wideContainerButtonSelector = ".css-11xzi44 .css-1huuf1k button.sl-icon.css-1mh9jgv";

  function applyOverrides() {
    document.querySelectorAll(maxWidthSelector).forEach(function (element) {
      element.style.setProperty("max-width", "none", "important");
    });

    document.querySelectorAll(spanColorSelector).forEach(function (element) {
      element.style.setProperty("color", "rgb(200 207 215)", "important");
    });

    document.querySelectorAll(wideContainerSelector).forEach(function (element) {
      element.style.setProperty("padding", "0", "important");
      element.style.setProperty("width", "260px", "important");
    });

    document.querySelectorAll(narrowContainerSelector).forEach(function (element) {
      element.style.setProperty("padding", "0", "important");
      element.style.setProperty("width", "80px", "important");
    });

    document.querySelectorAll(wideContainerButtonSelector).forEach(function (element) {
      element.style.setProperty("position", "absolute", "important");
      element.style.setProperty("top", "59px", "important");
      element.style.setProperty("width", "32px", "important");
      element.style.setProperty("min-width", "32px", "important");
      element.style.setProperty("height", "32px", "important");
    });
  }

  if (existing) {
    existing.href = href;
    applyOverrides();
    return;
  }

  document.head.appendChild(
    Object.assign(document.createElement("link"), {
      rel: "stylesheet",
      href: href,
      "data-gpseven-css": "true"
    })
  );

  applyOverrides();

  new MutationObserver(applyOverrides).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
