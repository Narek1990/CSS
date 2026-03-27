(function () {
  var currentScript = document.currentScript;
  var baseUrl = currentScript && currentScript.src
    ? currentScript.src.split("?")[0].replace(/\/[^/]+$/, "")
    : "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/css";

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

  function runSectionIds() {
    setSectionIdByText("kraldo-originals", "Kraldo Orijinalleri");
    setSectionIdByText("populer-saglayicilar", "Populer Saglayicilar");
    setSectionIdByText("populer-saglayicilar", "Popüler Sağlayıcılar");
  }

  var LICENSE_SEALS = [
    {
      url: "https://jacknicholsan.github.io/kraldo/images/kraldo_footer_web_award.webp",
      alt: "Kraldo Web Award",
      className: "kraldo-web-award"
    },
    {
      url: "https://jacknicholsan.github.io/kraldo/images/GCB_Seal.svg",
      alt: "GCB Seal"
    },
    {
      url: "https://jacknicholsan.github.io/kraldo/images/valid-seal.png",
      alt: "Valid Seal"
    }
  ];

  function initFooterLicenses() {
    var footerBottom =
      document.querySelector('[data-mj="footer-bottom"]') ||
      document.querySelector('[data-mj="footer-content"]') ||
      document.querySelector(".app-ltr-13ukv3g .app-ltr-176106l");

    if (!footerBottom) return;

    var wrap = footerBottom.querySelector(".kraldo-license-seals");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "kraldo-license-seals";
      footerBottom.appendChild(wrap);
    }

    for (var i = 0; i < LICENSE_SEALS.length; i++) {
      var seal = LICENSE_SEALS[i];
      if (wrap.querySelector('img[src="' + seal.url + '"]')) continue;

      var link = document.createElement("a");
      link.href = "#";
      link.setAttribute("aria-label", seal.alt);
      if (seal.className) {
        link.className = seal.className;
      }

      var img = document.createElement("img");
      img.src = seal.url;
      img.alt = seal.alt;

      link.appendChild(img);
      wrap.appendChild(link);
    }
  }

  function runDomEnhancements() {
    runSectionIds();
    initFooterLicenses();
  }

  var domObserver = new MutationObserver(runDomEnhancements);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
    document.addEventListener("DOMContentLoaded", function () {
      runDomEnhancements();
      domObserver.observe(document.body, { childList: true, subtree: true });
    }, { once: true });
  } else {
    init();
    runDomEnhancements();
    domObserver.observe(document.body, { childList: true, subtree: true });
  }
})();
