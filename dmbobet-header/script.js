(function () {
  var baseUrl = "https://YOUR_USERNAME.github.io/dmbobet-header";

  function loadStylesheet(href) {
    var existing = document.querySelector('link[data-dmbobet-header-override="true"]');
    if (existing) {
      existing.href = href;
      return;
    }

    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-dmbobet-header-override", "true");
    document.head.appendChild(link);
  }

  function init() {
    loadStylesheet(baseUrl + "/styles.css?v=" + Date.now());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
