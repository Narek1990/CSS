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

  function annotateLayout() {
    var header = document.querySelector('[aria-label="site-header"]');
    if (header) {
      header.setAttribute("data-kc-header", "true");

      var headerInner = header.parentElement;
      if (headerInner) {
        headerInner.setAttribute("data-kc-header-inner", "true");
      }

      var menuButton = header.querySelector('button[aria-label="menu"]');
      if (menuButton) menuButton.setAttribute("data-kc-menu-button", "true");

      var logoLink = header.querySelector('a[href="/en/"]');
      if (logoLink) logoLink.setAttribute("data-kc-logo", "true");

      var promoLink = header.querySelector('a[href="/en/promotions"]');
      if (promoLink) promoLink.setAttribute("data-kc-promo-link", "true");

      var loginLink = header.querySelector('a[href*="?m=login"]');
      if (loginLink) loginLink.setAttribute("data-kc-login", "true");

      var registerLink = header.querySelector('a[href*="?m=registration"]');
      if (registerLink) registerLink.setAttribute("data-kc-register", "true");

      var leftBlock = menuButton && menuButton.parentElement;
      if (leftBlock) leftBlock.setAttribute("data-kc-header-left", "true");

      var rightBlock = registerLink && registerLink.parentElement && registerLink.parentElement.parentElement;
      if (rightBlock) rightBlock.setAttribute("data-kc-header-right", "true");
    }

    var footer = document.querySelector("footer");
    if (footer) {
      footer.setAttribute("data-kc-footer", "true");
    }
  }

  function runEnhancements() {
    addBodyFlag();
    annotateLayout();
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
