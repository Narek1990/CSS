(function () {
  "use strict";

  var currentScript = document.currentScript;
  var baseUrl = currentScript && currentScript.src
    ? currentScript.src.split("?")[0].replace(/\/[^/]+$/, "")
    : "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/atlasbet";

  function ensureStylesheet() {
    var href = baseUrl + "/atlasbet.css?v=" + Date.now();
    var existing = document.querySelector('link[data-atlasbet-css="true"]');

    if (existing) {
      existing.href = href;
      return;
    }

    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-atlasbet-css", "true");
    document.head.appendChild(link);
  }

  function isRestrictedCountry(option) {
    var flag = option.querySelector("img");
    if (!flag) {
      return false;
    }

    var src = flag.getAttribute("src") || "";
    var alt = (flag.getAttribute("alt") || "").trim().toLowerCase();

    return src.indexOf("/flags/RU.svg") !== -1 ||
      src.indexOf("/flags/BY.svg") !== -1 ||
      alt === "russia" ||
      alt === "belarus";
  }

  function hideRestrictedCountries() {
    document.querySelectorAll(".sl-select__option, [role='option']").forEach(function (option) {
      if (isRestrictedCountry(option)) {
        option.setAttribute("data-atlasbet-restricted-country", "true");
        option.setAttribute("aria-disabled", "true");
        option.style.setProperty("display", "none", "important");
        option.style.setProperty("visibility", "hidden", "important");
        option.style.setProperty("height", "0", "important");
        option.style.setProperty("min-height", "0", "important");
        option.style.setProperty("padding", "0", "important");
        option.style.setProperty("margin", "0", "important");
        option.style.setProperty("overflow", "hidden", "important");
        option.style.setProperty("pointer-events", "none", "important");
      }
    });
  }

  function init() {
    ensureStylesheet();
    hideRestrictedCountries();

    new MutationObserver(hideRestrictedCountries).observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
