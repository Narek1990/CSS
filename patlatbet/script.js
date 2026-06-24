(function () {
  "use strict";

  var currentScript = document.currentScript;
  var baseUrl = currentScript && currentScript.src
    ? currentScript.src.split("?")[0].replace(/\/[^/]+$/, "")
    : "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/patlatbet";

  function ensureStylesheet() {
    var href = baseUrl + "/patlatbet.css?v=" + Date.now();
    var existing = document.querySelector('link[data-patlatbet-css="true"]');

    if (existing) {
      existing.href = href;
      return;
    }

    document.head.appendChild(
      Object.assign(document.createElement("link"), {
        rel: "stylesheet",
        href: href,
        "data-patlatbet-css": "true"
      })
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureStylesheet, { once: true });
  } else {
    ensureStylesheet();
  }
})();
