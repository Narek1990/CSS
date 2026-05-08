(function () {
  "use strict";

  var currentScript = document.currentScript;
  var assetBaseUrl = "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/donebets";
  var baseUrl = currentScript && currentScript.src
    ? currentScript.src.split("?")[0].replace(/\/[^/]+$/, "")
    : assetBaseUrl;
  var cssHref = baseUrl + "/donebets.css?v=" + Date.now();
  var targetSelector = "span.app-ltr-1phvdj0, span.app-rtl-1phvdj0";
  var gifSrc = assetBaseUrl + "/bonussuccessindicator.gif?v=" + Date.now();

  function ensureCss() {
    var existing = document.querySelector('link[data-donebets-css="true"]');

    if (existing) {
      existing.href = cssHref;
      return;
    }

    document.head.appendChild(
      Object.assign(document.createElement("link"), {
        rel: "stylesheet",
        href: cssHref,
        "data-donebets-css": "true"
      })
    );
  }

  function injectGif(element) {
    if (!element) {
      return;
    }

    element.innerHTML = "";
    element.style.setProperty("background-image", 'url("' + gifSrc + '")', "important");
    element.style.setProperty("background-color", "transparent", "important");
    element.style.setProperty("mask-image", "none", "important");
    element.style.setProperty("-webkit-mask-image", "none", "important");
    element.style.setProperty("color", "transparent", "important");
    element.setAttribute("data-donebets-applied", "true");
  }

  function apply() {
    ensureCss();
    document.querySelectorAll(targetSelector).forEach(injectGif);
  }

  apply();

  new MutationObserver(apply).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
