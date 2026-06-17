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

  function enhancePhoenixSportSliders() {
    document.querySelectorAll("#ph-sport-widget").forEach(function (widget) {
      var events = widget.querySelector(".top-events");

      if (!events || widget.querySelector(".slider-nav")) {
        return;
      }

      var nav = document.createElement("div");
      nav.className = "slider-nav";

      var prev = document.createElement("button");
      prev.className = "nav-btn prev";
      prev.type = "button";
      prev.setAttribute("aria-label", "Previous events");

      var next = document.createElement("button");
      next.className = "nav-btn next";
      next.type = "button";
      next.setAttribute("aria-label", "Next events");

      nav.append(prev, next);
      events.insertAdjacentElement("afterend", nav);

      function scrollEvents(direction) {
        var card = events.querySelector(".ph-event-card");
        var cardWidth = card ? card.getBoundingClientRect().width : 420;
        events.scrollBy({
          left: direction * (cardWidth + 24),
          behavior: "smooth"
        });
      }

      prev.addEventListener("click", function () {
        scrollEvents(-1);
      });

      next.addEventListener("click", function () {
        scrollEvents(1);
      });
    });
  }

  function runEnhancements() {
    addBodyFlag();
    enhancePhoenixSportSliders();
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
