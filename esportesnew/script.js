(function () {
  "use strict";

  var currentScript = document.currentScript;
  var baseUrl = currentScript && currentScript.src
    ? currentScript.src.split("?")[0].replace(/\/[^/]+$/, "")
    : "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/gpseven";

  var href = baseUrl + "/gpseven.css?v=" + Date.now();
  var existing = document.querySelector('link[data-gpseven-css="true"]');
  var maxWidthSelector = ".css-fkpkqq";
  var spanColorSelector = ".css-l5xv05 .css-25j2b4 span";
  var wideContainerSelector = ".css-11xzi44 .css-1huuf1k";
  var narrowContainerSelector = ".css-11xzi44 .css-17u1px6";
  var wideContainerIconSelector = ".css-11xzi44 .css-1huuf1k .sl-icon.css-1nqq47m";
  var shadowContainerSelector = ".css-fkpkqq .css-1pyebjd";
  var topContainerSelector = ".css-0 .css-10a4mqi";
  var menuIconSelector = ".sl-icon.css-17sgcqa";
  var menuSvg = '<svg data-esportesnew-svg="true" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" height="14" viewBox="0 0 19 14" width="19" xmlns="http://www.w3.org/2000/svg"><path d="M1.26049 13.5939H8.30622C8.86214 13.5939 9.31284 13.1433 9.31284 12.5874C9.31284 12.0315 8.86214 11.5808 8.30622 11.5808H1.26049C0.70458 11.5808 0.253944 12.0315 0.253944 12.5874C0.253944 13.1433 0.70458 13.5939 1.26049 13.5939ZM1.26049 8.17949H17.365C17.9209 8.17949 18.3715 7.72887 18.3715 7.17296C18.3715 6.61704 17.9209 6.16642 17.365 6.16642H1.26045C0.704542 6.16642 0.253906 6.61704 0.253906 7.17296C0.253906 7.72887 0.70458 8.17949 1.26049 8.17949ZM1.26049 2.76505H17.365C17.9209 2.76505 18.3715 2.31441 18.3715 1.7585C18.3715 1.20259 17.9209 0.751953 17.365 0.751953H1.26045C0.704542 0.751953 0.253906 1.20259 0.253906 1.7585C0.253906 2.31441 0.70458 2.76505 1.26049 2.76505Z" fill="#E8E5FF"></path></svg>';

  function createMenuSvg() {
    var template = document.createElement("template");
    template.innerHTML = menuSvg;
    return template.content.firstElementChild;
  }

  function setMenuIconPosition(element) {
    element.style.setProperty("right", "201px", "important");
    element.style.setProperty("top", "19px", "important");
  }

  function replaceMenuSvg(element) {
    var targetSvg = element.matches("svg") ? element : element.querySelector("svg");

    if (!targetSvg || targetSvg.getAttribute("data-esportesnew-svg") === "true") {
      return;
    }

    var replacement = createMenuSvg();
    replacement.setAttribute("class", targetSvg.getAttribute("class") || "sl-icon css-17sgcqa");
    targetSvg.replaceWith(replacement);
    setMenuIconPosition(replacement);
  }

  function applyOverrides() {
    document.querySelectorAll(maxWidthSelector).forEach(function (element) {
      element.style.setProperty("max-width", "none", "important");
    });

    document.querySelectorAll(spanColorSelector).forEach(function (element) {
      element.style.setProperty("color", "#c9c4c4", "important");
    });

    document.querySelectorAll(wideContainerSelector).forEach(function (element) {
      element.style.setProperty("padding", "0", "important");
      element.style.setProperty("width", "260px", "important");
    });

    document.querySelectorAll(narrowContainerSelector).forEach(function (element) {
      element.style.setProperty("padding", "0", "important");
      element.style.setProperty("width", "80px", "important");
    });

    document.querySelectorAll(wideContainerIconSelector).forEach(function (element) {
      element.style.removeProperty("width");
      element.style.removeProperty("min-width");
      element.style.removeProperty("height");
      element.style.setProperty("width", "auto", "important");
      element.style.setProperty("min-width", "0", "important");
      element.style.setProperty("height", "auto", "important");
    });

    document.querySelectorAll(shadowContainerSelector).forEach(function (element) {
      element.style.setProperty("box-shadow", "none", "important");
    });

    document.querySelectorAll(topContainerSelector).forEach(function (element) {
      element.style.setProperty("width", "180px", "important");
      element.style.setProperty("margin-left", "48px", "important");
    });

    document.querySelectorAll(menuIconSelector).forEach(function (element) {
      setMenuIconPosition(element);
      replaceMenuSvg(element);
    });
  }

  if (existing) {
    existing.href = href;
    applyOverrides();
    return;
  }

  document.head.appendChild(
    Object.assign(document.createElement("link"), {
      rel: "stylesheet",
      href: href,
      "data-gpseven-css": "true"
    })
  );

  applyOverrides();

  new MutationObserver(applyOverrides).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
