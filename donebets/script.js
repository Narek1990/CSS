(function () {
  "use strict";

  var currentScript = document.currentScript;
  var baseUrl = currentScript && currentScript.src
    ? currentScript.src.split("?")[0].replace(/\/[^/]+$/, "")
    : "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/donebets";
  var svgUrl = baseUrl + "/giftbox.svg?v=" + Date.now();
  var targetSelector = "span.app-ltr-1phvdj0, span.app-rtl-1phvdj0";
  var svgMarkup = null;
  var inflight = null;

  function fetchSvg() {
    if (svgMarkup) {
      return Promise.resolve(svgMarkup);
    }

    if (inflight) {
      return inflight;
    }

    inflight = fetch(svgUrl)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Failed to load SVG: " + response.status);
        }

        return response.text();
      })
      .then(function (text) {
        svgMarkup = text;
        return text;
      })
      .finally(function () {
        inflight = null;
      });

    return inflight;
  }

  function buildSvgNode(markup, className) {
    var template = document.createElement("template");
    template.innerHTML = markup.trim();

    var svg = template.content.firstElementChild;
    if (!svg) {
      return null;
    }

    svg.setAttribute("data-donebets-giftbox", "true");
    svg.style.display = "inline-block";
    svg.style.flexShrink = "0";

    if (className) {
      svg.setAttribute("class", className);
    }

    return svg;
  }

  function replaceTargets() {
    fetchSvg()
      .then(function (markup) {
        document.querySelectorAll(targetSelector).forEach(function (element) {
          if (element.getAttribute("data-donebets-replaced") === "true") {
            return;
          }

          var svg = buildSvgNode(markup, element.className);
          if (!svg) {
            return;
          }

          element.setAttribute("data-donebets-replaced", "true");
          element.replaceWith(svg);
        });
      })
      .catch(function () {
        /* ignore fetch failures */
      });
  }

  replaceTargets();

  new MutationObserver(replaceTargets).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
