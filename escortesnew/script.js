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

  function buildStoryLink(href, icon, title) {
    var link = document.createElement("a");
    var image = document.createElement("img");
    var label = document.createElement("span");

    link.href = href;
    link.className = "escortesnew-story-link";
    link.setAttribute("data-escortesnew-story-link", title.toLowerCase().replace(/\s+/g, "-"));

    image.src = ASSET_BASE + "/icons/" + icon + ".svg";
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";

    label.textContent = title;

    link.appendChild(image);
    link.appendChild(label);
    return link;
  }

  function ensureInfoPanelWidgets() {
    var container = document.querySelector('[data-mj="widget-info-panel-container"]');
    if (!container) return;

    if (!container.querySelector('scroll-welcome-banner[data-escortesnew-info-banner="true"]')) {
      var banner = document.createElement("scroll-welcome-banner");
      banner.setAttribute("data-escortesnew-info-banner", "true");

      var copy = document.createElement("div");
      copy.className = "escortesnew-welcome-copy";

      var eyebrow = document.createElement("span");
      eyebrow.textContent = "New World of Casino";

      var title = document.createElement("strong");
      title.textContent = "Welcome to Escortes";

      var text = document.createElement("p");
      text.textContent = "Choose your next table, spin, match, or prize drop.";

      var button = document.createElement("a");
      button.href = "/en/casino";
      button.className = "escortesnew-welcome-button";
      button.textContent = "Play now";

      copy.appendChild(eyebrow);
      copy.appendChild(title);
      copy.appendChild(text);
      copy.appendChild(button);

      var art = document.createElement("div");
      art.className = "escortesnew-welcome-art";

      var artImage = document.createElement("img");
      artImage.src = ASSET_BASE + "/icons/casino.svg";
      artImage.alt = "";
      artImage.loading = "lazy";
      artImage.decoding = "async";

      art.appendChild(artImage);
      banner.appendChild(copy);
      banner.appendChild(art);
      container.insertBefore(banner, container.firstChild);
    }

    if (!container.querySelector('stories-widget[data-escortesnew-stories="true"]')) {
      var stories = document.createElement("stories-widget");
      stories.setAttribute("data-escortesnew-stories", "true");
      stories.appendChild(buildStoryLink("/en/sport/demo", "sport", "Sport"));
      stories.appendChild(buildStoryLink("/en/casino", "casino", "Casino"));
      stories.appendChild(buildStoryLink("/en/live-casino", "live-casino", "Live Casino"));
      stories.appendChild(buildStoryLink("/en/crash-games", "crash-games", "Crash Games"));
      stories.appendChild(buildStoryLink("/en/virtuals", "virtual-games", "Virtuals"));
      stories.appendChild(buildStoryLink("/en/promotions", "promotions", "Promotions"));

      var content = container.querySelector('[data-mj="widget-info-panel-content"]');
      container.insertBefore(stories, content || null);
    }
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

  function extractMaskUrl(value) {
    var match = value && value.match(/url\((['"]?)(.*?)\1\)/);
    return match && match[2] ? match[2] : "";
  }

  function convertHeaderMaskIcons() {
    document.querySelectorAll('[data-mj="header-nav-item"] > a > span').forEach(function (icon) {
      if (icon.getAttribute("data-escortesnew-bg-icon") === "true") return;

      var inlineMask = icon.style && (icon.style.maskImage || icon.style.webkitMaskImage);
      var computed = window.getComputedStyle(icon);
      var computedMask = computed.maskImage || computed.webkitMaskImage;
      var iconUrl = extractMaskUrl(inlineMask) || extractMaskUrl(computedMask);

      if (!iconUrl) return;

      icon.style.backgroundImage = 'url("' + iconUrl + '")';
      icon.style.backgroundSize = "contain";
      icon.style.backgroundRepeat = "no-repeat";
      icon.style.backgroundPosition = "center";
      icon.style.backgroundColor = "transparent";
      icon.style.maskImage = "none";
      icon.style.webkitMaskImage = "none";
      icon.setAttribute("data-escortesnew-bg-icon", "true");
    });
  }

  function bootTiltCards() {
    if (window.__escortesnewTiltCardsStarted) return;
    window.__escortesnewTiltCardsStarted = true;

    var selector = '[data-mj="game-catalog-card"]';
    var angle = 20;
    var lerpAmount = 0.08;
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    var cards = new Set();
    var animationFrame = 0;

    function lerp(start, end, amount) {
      return ((1 - amount) * start) + (amount * end);
    }

    function remap(value, oldMax, newMax) {
      var newValue = ((value + oldMax) * (newMax * 2)) / (oldMax * 2) - newMax;
      return Math.min(Math.max(newValue, -newMax), newMax);
    }

    function shouldRun() {
      return !reducedMotion.matches && canHover.matches;
    }

    function resetCard(card) {
      card.dataset.rotateX = "0";
      card.dataset.rotateY = "0";
      card.style.setProperty("--rotateX", "0deg");
      card.style.setProperty("--rotateY", "0deg");
      card.style.setProperty("--escortesnew-tilt-transform", "perspective(900px) rotateX(0deg) rotateY(0deg)");
    }

    function onMouseMove(event) {
      if (!shouldRun()) return;
      var card = event.currentTarget;
      var rect = card.getBoundingClientRect();
      var centerX = rect.left + (rect.width / 2);
      var centerY = rect.top + (rect.height / 2);
      var posX = event.clientX - centerX;
      var posY = event.clientY - centerY;
      var x = remap(posX, rect.width / 2, angle);
      var y = remap(posY, rect.height / 2, angle);
      card.dataset.rotateY = String(x);
      card.dataset.rotateX = String(-y);
    }

    function onMouseLeave(event) {
      event.currentTarget.dataset.rotateX = "0";
      event.currentTarget.dataset.rotateY = "0";
    }

    function enhanceCard(card) {
      if (card.dataset.escortesnewTilt === "1") return;
      card.dataset.escortesnewTilt = "1";
      resetCard(card);
      card.addEventListener("mousemove", onMouseMove);
      card.addEventListener("mouseleave", onMouseLeave);
      cards.add(card);
    }

    function enhanceCards(root) {
      (root || document).querySelectorAll?.(selector).forEach(enhanceCard);
    }

    function update() {
      cards.forEach(function (card) {
        if (!card.isConnected) {
          cards.delete(card);
          return;
        }

        if (!shouldRun()) {
          resetCard(card);
          return;
        }

        var currentX = parseFloat(card.style.getPropertyValue("--rotateX")) || 0;
        var currentY = parseFloat(card.style.getPropertyValue("--rotateY")) || 0;
        var targetX = parseFloat(card.dataset.rotateX) || 0;
        var targetY = parseFloat(card.dataset.rotateY) || 0;
        var nextX = Math.abs(targetX - currentX) < 0.01 ? targetX : lerp(currentX, targetX, lerpAmount);
        var nextY = Math.abs(targetY - currentY) < 0.01 ? targetY : lerp(currentY, targetY, lerpAmount);

        card.style.setProperty("--rotateX", nextX + "deg");
        card.style.setProperty("--rotateY", nextY + "deg");
        card.style.setProperty("--escortesnew-tilt-transform", "perspective(900px) rotateX(" + nextX + "deg) rotateY(" + nextY + "deg)");
      });

      animationFrame = requestAnimationFrame(update);
    }

    function onCapabilityChange() {
      cards.forEach(resetCard);
    }

    reducedMotion.addEventListener?.("change", onCapabilityChange);
    canHover.addEventListener?.("change", onCapabilityChange);

    enhanceCards(document);
    new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          if (node.matches?.(selector)) enhanceCard(node);
          enhanceCards(node);
        });
      });
    }).observe(document.documentElement, { childList: true, subtree: true });

    if (!animationFrame) animationFrame = requestAnimationFrame(update);
  }

  function boot() {
    ensureCss();
    ensureInfoPanelWidgets();
    ensureFooterAssets();
    convertHeaderMaskIcons();
    bootTiltCards();
  }

  boot();
  new MutationObserver(boot).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
