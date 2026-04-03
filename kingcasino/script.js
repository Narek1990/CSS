(function () {
  "use strict";

  var currentScript = document.currentScript;
  var baseUrl = currentScript && currentScript.src
    ? currentScript.src.split("?")[0].replace(/\/[^/]+$/, "")
    : "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/kingcasino";

  function ensureStylesheet() {
    var href = baseUrl + "/kingcasino.css?v=" + Date.now();
    var existing = document.querySelector('link[data-kingcasino-css="true"]');

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
  }

  function setSectionIdByText(id, text) {
    var sections = document.querySelectorAll("section");
    for (var i = 0; i < sections.length; i++) {
      var section = sections[i];
      if (section.id === id) continue;
      if ((section.textContent || "").indexOf(text) !== -1) {
        section.id = id;
        break;
      }
    }
  }

  function addBodyFlag() {
    document.body.setAttribute("data-kingcasino-theme", "stake");
  }

  function runEnhancements() {
    addBodyFlag();
    setSectionIdByText("kingcasino-originals", "Original");
    setSectionIdByText("kingcasino-sports", "Sport");
    setSectionIdByText("kingcasino-live", "Live");
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
