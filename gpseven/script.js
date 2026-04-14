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

  function applyOverrides() {
    document.querySelectorAll(maxWidthSelector).forEach(function (element) {
      element.style.setProperty("max-width", "none", "important");
    });

    document.querySelectorAll(spanColorSelector).forEach(function (element) {
      element.style.setProperty("color", "#c9c4c4", "important");
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
