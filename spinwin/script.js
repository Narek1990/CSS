(function () {
  "use strict";

  var currentScript = document.currentScript;
  var baseUrl = currentScript && currentScript.src
    ? currentScript.src.split("?")[0].replace(/\/[^/]+$/, "")
    : "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/spinwin";

  function ensureStylesheet() {
    var href = baseUrl + "/spinwin.css?v=" + Date.now();
    var existing = document.querySelector('link[data-spinwin-css="true"]');

    if (existing) {
      existing.href = href;
      return;
    }

    document.head.appendChild(
      Object.assign(document.createElement("link"), {
        rel: "stylesheet",
        href: href,
        "data-spinwin-css": "true"
      })
    );
  }

  function addBodyFlag() {
    document.body.setAttribute("data-spinwin-theme", "true");
  }

  function enableSingleCurrencyToggle() {
    var modalTitles = document.querySelectorAll(".modal .app-ltr-1vtec85");

    modalTitles.forEach(function (title) {
      if (!title || title.textContent.trim() !== "Wallet Settings") {
        return;
      }

      var modal = title.closest(".modal");

      if (!modal) {
        return;
      }

      var toggle = modal.querySelector('input[type="checkbox"][aria-label="Show all in single currency"]');

      if (!toggle || toggle.checked || toggle.disabled) {
        return;
      }

      toggle.click();
      toggle.dispatchEvent(new Event("input", { bubbles: true }));
      toggle.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  function addFixedBannerDepositLink() {
    document.querySelectorAll('[data-mj="widget-fixed-image-banner-container"]').forEach(function (container) {
      var image = container.querySelector('img[src*="0e0fb228-dd69-4bbc-b39d-b91c07cb5b24"]');

      if (!image || container.querySelector(".spinwin-fixed-banner-deposit")) {
        return;
      }

      container.appendChild(
        Object.assign(document.createElement("a"), {
          className: "spinwin-fixed-banner-deposit",
          href: "/en/home/promotions/first-deposit",
          "aria-label": "Deposit promotion"
        })
      );
    });
  }

  function runEnhancements() {
    addBodyFlag();
    enableSingleCurrencyToggle();
    addFixedBannerDepositLink();
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
