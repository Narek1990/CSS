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

  function removeRestrictedCountries() {
    document.querySelectorAll(".sl-select__option, [role='option']").forEach(function (option) {
      if (isRestrictedCountry(option)) {
        option.remove();
      }
    });
  }

  function init() {
    ensureStylesheet();
    removeRestrictedCountries();

    new MutationObserver(removeRestrictedCountries).observe(document.body, {
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
