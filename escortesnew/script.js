(function () {
  var currentScript = document.currentScript && document.currentScript.src;
  var ASSET_BASE = currentScript
    ? currentScript.replace(/\/script\.js(?:\?.*)?$/, "")
    : "https://cdn.jsdelivr.net/gh/Narek1990/CSS@refs/heads/main/escortesnew";
  var CSS_HREF = ASSET_BASE + "/escortesnew.css?v=" + Date.now();

  function ensureCss() {
    if (document.querySelector('link[data-escortesnew-css="true"]')) return;

    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = CSS_HREF;
    link.setAttribute("data-escortesnew-css", "true");
    document.head.appendChild(link);
  }

  function buildImage(src, alt, key) {
    var img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.loading = "lazy";
    img.decoding = "async";
    img.setAttribute("data-escortesnew-footer-img", key);
    return img;
  }

  function buildImageLink(href, src, alt, key) {
    var link = document.createElement("a");
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("data-escortesnew-footer-link", key);
    link.appendChild(buildImage(src, alt, key));
    return link;
  }

  function ensureFooterAssets() {
    var footer = document.querySelector('[data-mj="footer"]');
    var content = footer && footer.querySelector('[data-mj="footer-content"]');
    if (!content || content.querySelector('[data-escortesnew-footer-assets="true"]')) return;

    var target = content.querySelector(".app-ltr-19zdw54, [class~='app-ltr-19zdw54']");
    var wrap = document.createElement("div");
    wrap.className = "escortesnew-footer-assets";
    wrap.setAttribute("data-escortesnew-footer-assets", "true");

    var apps = document.createElement("div");
    apps.className = "escortesnew-footer-assets-apps";
    apps.appendChild(buildImageLink("https://apps.apple.com/", ASSET_BASE + "/footer/ios-img.svg", "Download on iOS", "ios"));
    apps.appendChild(buildImageLink("https://play.google.com/", ASSET_BASE + "/footer/android-img.svg", "Download on Android", "android"));

    var license = document.createElement("div");
    license.className = "escortesnew-footer-assets-license";
    license.appendChild(buildImage(ASSET_BASE + "/footer/anjouan-logo.png", "Anjouan license", "anjouan"));

    wrap.appendChild(apps);
    wrap.appendChild(license);

    content.insertBefore(wrap, target || null);
  }

  function boot() {
    ensureCss();
    ensureFooterAssets();
  }

  boot();
  new MutationObserver(boot).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
