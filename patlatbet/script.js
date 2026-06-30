(function () {
  "use strict";

  var currentScript = document.currentScript;
  var baseUrl = currentScript && currentScript.src
    ? currentScript.src.split("?")[0].replace(/\/[^/]+$/, "")
    : "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/patlatbet";

  function ensureStylesheet() {
    var href = baseUrl + "/patlatbet.css";
    var managed = document.querySelector('link[data-patlatbet-css="true"]');

    if (managed) {
      if (managed.href.split("?")[0] !== href) {
        managed.href = href;
      }

      return;
    }

    var external = document.querySelector('link[href*="/patlatbet/patlatbet.css"]');

    if (external) {
      external.setAttribute("data-patlatbet-css-external", "true");
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
