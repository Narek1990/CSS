(function () {
  "use strict";

  var embeddedGif =
    "data:image/gif;base64,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";
  var currentScript = document.currentScript;
  var scriptUrl = currentScript ? currentScript.src.split("?")[0] : "";
  var baseUrl = scriptUrl
    ? scriptUrl.replace(/\/script\.js$/, "")
    : "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/donebets";
  var cssHref = baseUrl + "/donebets.css";
  var targetSelector = "span.app-ltr-1phvdj0, span.app-rtl-1phvdj0";
  var observer;

  function ensureCss() {
    var existing = document.querySelector('link[data-donebets-css="true"]');

    if (existing) {
      return;
    }

    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssHref;
    link.setAttribute("data-donebets-css", "true");
    document.head.appendChild(link);
  }

  function injectGif(element) {
    if (!element || element.getAttribute("data-donebets-applied") === "true") {
      return;
    }

    element.innerHTML = "";
    element.style.setProperty("background-color", "transparent", "important");
    element.style.setProperty("mask-image", "none", "important");
    element.style.setProperty("-webkit-mask-image", "none", "important");
    element.style.setProperty("color", "transparent", "important");
    element.style.setProperty("font-size", "0", "important");

    var image = document.createElement("img");
    image.src = embeddedGif;
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    image.style.setProperty("display", "block");
    image.style.setProperty("width", "100%");
    image.style.setProperty("height", "100%");
    image.style.setProperty("object-fit", "contain");
    image.style.setProperty("pointer-events", "none");
    element.appendChild(image);
    element.setAttribute("data-donebets-applied", "true");
  }

  function applyToNode(node) {
    if (!node || node.nodeType !== 1) {
      return;
    }

    if (node.matches && node.matches(targetSelector)) {
      injectGif(node);
    }

    if (node.querySelectorAll) {
      node.querySelectorAll(targetSelector).forEach(injectGif);
    }
  }

  function applyInitial() {
    ensureCss();
    applyToNode(document);
  }

  function observe() {
    if (observer) {
      return;
    }

    observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(applyToNode);
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  applyInitial();
  observe();
})();
