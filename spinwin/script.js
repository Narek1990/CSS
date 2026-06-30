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
      var image = container.querySelector("img");
      var link = container.querySelector(".spinwin-fixed-banner-deposit");

      if (!image) {
        return;
      }

      if (!link) {
        link = document.createElement("a");
        link.className = "spinwin-fixed-banner-deposit";
        container.appendChild(link);
      }

      link.href = "/en/home/promotions/first-deposit";
      link.setAttribute("aria-label", "Deposit promotion");
    });
  }

  function getMaskUrl(icon) {
    var maskImage = icon.style.maskImage || icon.style.webkitMaskImage;

    if (!maskImage || maskImage === "none") {
      maskImage = window.getComputedStyle(icon).maskImage || window.getComputedStyle(icon).webkitMaskImage;
    }

    if (!maskImage || maskImage === "none") {
      return "";
    }

    var match = maskImage.match(/url\((['"]?)(.*?)\1\)/);

    return match ? match[2] : "";
  }

  function showOriginalSidebarIcons() {
    document.querySelectorAll([
      '[data-mj="sidebar-content"] [class~="app-ltr-1trb7go"]',
      '[data-mj="sidebar"] [class~="app-ltr-1trb7go"]',
      '[data-mj="bottom-nav"] span[style*="mask-image"]',
      '[data-mj="lobby-catalog-category-item"] span',
      '[data-mj="lobby-catalog-mobile-category-chip"] span',
      '[data-mj="lobby-catalog-category-list"] span',
      '[data-mj="lobby-catalog-mobile-categories"] span',
      '[data-mj="widget-pages"] span',
      '[data-mj="widget-pages-item"] span'
    ].join(",")).forEach(function (icon) {
      var url = getMaskUrl(icon);

      if (!url) {
        return;
      }

      icon.dataset.spinwinOriginalIcon = "true";
      icon.style.backgroundImage = 'url("' + url + '")';
      icon.style.backgroundColor = "transparent";
      icon.style.backgroundPosition = "center";
      icon.style.backgroundRepeat = "no-repeat";
      icon.style.backgroundSize = "contain";
      icon.style.maskImage = "none";
      icon.style.webkitMaskImage = "none";
    });
  }

  function runEnhancements() {
    addBodyFlag();
    enableSingleCurrencyToggle();
    addFixedBannerDepositLink();
    showOriginalSidebarIcons();
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
