(function () {
  "use strict";

  var currentScript = document.currentScript;
  var baseUrl = currentScript && currentScript.src
    ? currentScript.src.split("?")[0].replace(/\/[^/]+$/, "")
    : "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/gpseven";

  var href = baseUrl + "/gpseven.css?v=" + Date.now();
  var existing = document.querySelector('link[data-gpseven-css="true"]');
  var selector = ".css-fkpkqq";

  function removeMaxWidth() {
    document.querySelectorAll(selector).forEach(function (element) {
      element.style.setProperty("max-width", "none", "important");
    });
  }

  if (existing) {
    existing.href = href;
    removeMaxWidth();
    return;
  }

  document.head.appendChild(
    Object.assign(document.createElement("link"), {
      rel: "stylesheet",
      href: href,
      "data-gpseven-css": "true"
    })
  );

  removeMaxWidth();

  new MutationObserver(removeMaxWidth).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
