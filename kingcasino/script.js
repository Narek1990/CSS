(function () {
  "use strict";

  var currentScript = document.currentScript;
  var baseUrl = currentScript && currentScript.src
    ? currentScript.src.split("?")[0].replace(/\/[^/]+$/, "")
    : "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/kingcasino";

  var href = baseUrl + "/kingcasino.css?v=" + Date.now();
  var existing = document.querySelector("link[data-kingcasino-css=\"true\"]");

  if (existing) {
    existing.href = href;
    return;
  }

  document.head.appendChild(
    Object.assign(document.createElement("link"), {
      rel: "stylesheet",
      href: href,
      "data-kingcasino-css": "true"
    })
  );
})();
