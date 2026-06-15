(function () {
  "use strict";

  var currentScript = document.currentScript;
  var baseUrl = currentScript && currentScript.src
    ? currentScript.src.split("?")[0].replace(/\/[^/]+$/, "")
    : "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/inancbet";

  function ensureStylesheet() {
    var href = baseUrl + "/inancbet.css?v=" + Date.now();
    var existing = document.querySelector('link[data-inancbet-css="true"]');

    if (existing) {
      existing.href = href;
      return;
    }

    document.head.appendChild(
      Object.assign(document.createElement("link"), {
        rel: "stylesheet",
        href: href,
        "data-inancbet-css": "true"
      })
    );
  }

  function addBodyFlag() {
    document.body.setAttribute("data-inancbet-theme", "true");
  }

  function runEnhancements() {
    addBodyFlag();
  }

  var observer = new MutationObserver(runEnhancements);

  function init() {
    ensureStylesheet();
    runEnhancements();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
