(function () {
  "use strict";

  var currentScript = document.currentScript;
  var baseUrl = currentScript && currentScript.src
    ? currentScript.src.split("?")[0].replace(/\/[^/]+$/, "")
    : "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/gpseven";

  var href = baseUrl + "/gpseven.css?v=" + Date.now();
  var existing = document.querySelector('link[data-gpseven-css="true"]');
  var maxWidthSelector = ".css-fkpkqq";
  var spanColorSelector = ".css-l5xv05 .css-25j2b4 span";
  var wideContainerSelector = ".css-11xzi44 .css-1huuf1k";
  var narrowContainerSelector = ".css-11xzi44 .css-17u1px6";
  var wideContainerIconSelector = ".css-11xzi44 .css-1huuf1k .sl-icon.css-1nqq47m";
  var shadowContainerSelector = ".css-fkpkqq .css-1pyebjd";
  var bannerContainerSelector = '[data-mj="widget-banner-container"]';
  var grayPanelSelector = ".css-i58pjb .css-yqvym2";
  var noRadiusSelector = ".css-9hd24o";

  function applyOverrides() {
    document.querySelectorAll(maxWidthSelector).forEach(function (element) {
      element.style.setProperty("max-width", "none", "important");
    });

    document.querySelectorAll(spanColorSelector).forEach(function (element) {
      element.style.setProperty("color", "#c9c4c4", "important");
    });

    document.querySelectorAll(wideContainerSelector).forEach(function (element) {
      element.style.setProperty("padding", "0", "important");
      element.style.setProperty("width", "260px", "important");
    });

    document.querySelectorAll(narrowContainerSelector).forEach(function (element) {
      element.style.setProperty("padding", "0", "important");
      element.style.setProperty("width", "80px", "important");
    });

    document.querySelectorAll(wideContainerIconSelector).forEach(function (element) {
      element.style.removeProperty("width");
      element.style.removeProperty("min-width");
      element.style.removeProperty("height");
      element.style.setProperty("width", "auto", "important");
      element.style.setProperty("min-width", "0", "important");
      element.style.setProperty("height", "auto", "important");
    });

    document.querySelectorAll(shadowContainerSelector).forEach(function (element) {
      element.style.setProperty("box-shadow", "none", "important");
      element.style.setProperty("background-color", "rgb(229, 229, 229)", "important");
    });

    document.querySelectorAll(bannerContainerSelector).forEach(function (element) {
      element.style.setProperty("max-width", "1550px", "important");
    });

    document.querySelectorAll(grayPanelSelector).forEach(function (element) {
      element.style.setProperty("background-color", "rgb(229, 229, 229)", "important");
    });

    document.querySelectorAll(noRadiusSelector).forEach(function (element) {
      element.style.setProperty("border-radius", "0", "important");
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
