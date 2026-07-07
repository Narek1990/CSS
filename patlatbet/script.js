(function () {
  "use strict";

  if (window.__patlatbetSidebarPromoReady) return;
  window.__patlatbetSidebarPromoReady = true;

  var currentScript = document.currentScript;
  var baseUrl = currentScript && currentScript.src
    ? currentScript.src.split("?")[0].replace(/\/[^/]+$/, "")
    : "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/patlatbet";
  var syncScheduled = false;

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

  function syncSidebarPromo() {
    syncScheduled = false;

    document.querySelectorAll('[data-mj="sidebar-footer"]').forEach(function (footer) {
      var selectControl = footer.querySelector(".sl-select__control");
      var fallback = footer.querySelector('[data-patlatbet-sidebar-promo="true"]');

      if (selectControl) {
        if (fallback) fallback.remove();
        return;
      }

      if (!fallback) {
        fallback = document.createElement("div");
        fallback.className = "patlatbet-sidebar-promo";
        fallback.setAttribute("data-patlatbet-sidebar-promo", "true");
        fallback.setAttribute("role", "img");
        fallback.setAttribute("aria-label", "Patlatbet mobile application promotion");
        footer.appendChild(fallback);
      }
    });
  }

  function scheduleSidebarPromoSync() {
    if (syncScheduled) return;
    syncScheduled = true;
    requestAnimationFrame(syncSidebarPromo);
  }

  function initialize() {
    ensureStylesheet();
    syncSidebarPromo();

    new MutationObserver(scheduleSidebarPromoSync).observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
