/*! Escortesnew Narcos inspired runtime.
    Adapts the Narcos reference approach to Escortesnew English routes and DOM. */
(function () {
  "use strict";

  var GLOBAL_KEY = "__escortesnewNarcosRuntime";
  var VERSION = "1.0.1";
  var previous = window[GLOBAL_KEY];

  if (previous && previous.version === VERSION && previous.refresh) {
    previous.refresh();
    return;
  }

  if (previous && previous.destroy) previous.destroy();

  function query(selector, root) {
    return (root || document).querySelector(selector);
  }

  function create(tag, className, textValue) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (textValue !== undefined) element.textContent = textValue;
    return element;
  }

  function place(parent, node, before) {
    before = before || null;
    if (!parent || !node) return node;
    if (node === before) return node;
    if (node.parentElement !== parent || node.nextSibling !== before) parent.insertBefore(node, before);
    return node;
  }

  function mount(id, tag, parent, before, render, signature) {
    var node = document.getElementById(id);
    if (!node) node = create(tag);
    node.id = id;
    signature = signature || VERSION;
    if (node.getAttribute("data-es-revision") !== signature) {
      node.textContent = "";
      render(node);
      node.setAttribute("data-es-revision", signature);
    }
    return place(parent, node, before);
  }

  function getBaseUrl() {
    var script = document.currentScript ||
      query('script[src*="escortesnew-narcos"]') ||
      query('script[src*="/escortesnew/script.js"]');
    var source = script && script.src;
    if (!source) {
      var stylesheet = query('link[href*="escortesnew-narcos.css"]');
      source = stylesheet && stylesheet.href;
    }
    try {
      return new URL(".", source || "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/escortesnew/").href;
    } catch (error) {
      return "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/escortesnew/";
    }
  }

  var BASE_URL = getBaseUrl();
  var CSS_HREF = BASE_URL + "escortesnew-narcos.css?v=" + VERSION;
  var WEBSITE_URL = "https://escortesnew.com/";
  var CASINO_PATH = "/en/casino";
  var LIVE_CASINO_PATH = "/en/live-casino";
  var SPORTS_PATH = "/en/sport/demo";
  var PROMOTIONS_PATH = "/en/promotions";
  var SUPPORT_PATH = "/en/support";

  var ASSETS = {
    casino: BASE_URL + "icons/casino.svg",
    liveCasino: BASE_URL + "icons/live-casino.svg",
    crashGames: BASE_URL + "icons/crash-games.svg",
    virtualGames: BASE_URL + "icons/virtual-games.svg",
    promotions: BASE_URL + "icons/promotions.svg",
    sport: BASE_URL + "icons/sport.svg",
    wheel: BASE_URL + "icons/wheel.svg",
    ios: BASE_URL + "footer/ios-img.svg",
    android: BASE_URL + "footer/android-img.svg",
    license: BASE_URL + "footer/anjouan-logo.png"
  };

  var runtime = {
    version: VERSION,
    observer: null,
    listeners: [],
    history: [],
    path: "",
    route: null,
    effectsTimer: 0,
    gameActive: false,
    gameReturnUrl: "",
    gameLobbyPath: CASINO_PATH,
    tiltStarted: false
  };

  window[GLOBAL_KEY] = runtime;

  function listen(target, type, handler, options) {
    if (!target || !target.addEventListener) return;
    target.addEventListener(type, handler, options);
    runtime.listeners.push([target, type, handler, options]);
  }

  function makeImage(src, className, alt, width, height, lazy) {
    var image = create("img", className);
    image.alt = alt || "";
    image.width = width || 1;
    image.height = height || 1;
    image.decoding = "async";
    if (lazy) image.loading = "lazy";
    image.src = src;
    return image;
  }

  function link(href, className, textValue, ariaLabel, external) {
    var anchor = create("a", className, textValue);
    anchor.href = href;
    if (external) {
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer external";
    }
    if (ariaLabel) anchor.setAttribute("aria-label", ariaLabel);
    return anchor;
  }

  function cleanPath() {
    return (window.location.pathname || "/").toLowerCase().replace(/\/+$/, "") || "/";
  }

  function classifyRoute(path) {
    var home = path === "/" || path === "/en";
    var casino = path === CASINO_PATH || path.indexOf("/en/casino") === 0;
    var liveCasino = path.indexOf("/en/live-casino") === 0 || path.indexOf("/en/livecasino") === 0;
    var promotions = path.indexOf("/en/promotions") === 0;
    var sports = /^\/en\/(?:sport|sports|sportsbook)(?:\/|$)/.test(path);
    var game = /^\/en\/(?:game|play|launch)(?:\/|$)/.test(path) ||
      /^\/en\/(?:casino|live-casino|livecasino)\/[^/]+\/[^/]+/.test(path);

    return {
      path: path,
      home: home,
      casino: casino,
      liveCasino: liveCasino,
      promotions: promotions,
      sports: sports,
      game: game,
      infoSafe: home || casino || liveCasino || promotions
    };
  }

  function applyRouteClasses() {
    var html = document.documentElement;
    runtime.route = classifyRoute(cleanPath());
    html.classList.toggle("es-home-route", runtime.route.home);
    html.classList.toggle("es-info-safe-route", runtime.route.infoSafe);
    html.classList.toggle("es-sports-route", runtime.route.sports);
    html.classList.toggle("es-game-route", runtime.route.game);
  }

  function ensureCss() {
    var existing = query('link[data-escortesnew-narcos-css="true"]');
    if (existing) {
      if (existing.href !== CSS_HREF) existing.href = CSS_HREF;
      return;
    }
    var linkEl = document.createElement("link");
    linkEl.rel = "stylesheet";
    linkEl.href = CSS_HREF;
    linkEl.setAttribute("data-escortesnew-narcos-css", "true");
    document.head.appendChild(linkEl);
  }

  function extractMaskUrl(value) {
    var match = value && value.match(/url\((['"]?)(.*?)\1\)/);
    return match && match[2] ? match[2] : "";
  }

  function convertHeaderMaskIcons(root) {
    var scope = root || document;
    var icons = scope.querySelectorAll ?
      scope.querySelectorAll('[data-mj="header-nav-item"] > a > span') : [];

    Array.prototype.forEach.call(icons, function (icon) {
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

  function renderInfoStrip(header) {
    if (!header || !runtime.route || !runtime.route.infoSafe) {
      document.documentElement.classList.remove("es-theme-info-mounted");
      var old = document.getElementById("escortesnew-info-strip");
      if (old) old.remove();
      return;
    }

    var currentHost = (window.location.hostname || "escortesnew.com").replace(/^www\./i, "");
    mount("escortesnew-info-strip", "aside", header, header.firstElementChild, function (strip) {
      var content = create("div", "es-info-strip-content");
      content.appendChild(link(WEBSITE_URL, "es-info-source", "Escortesnew", "Open Escortesnew official website", true));
      content.appendChild(create("span", "es-info-long", " premium casino lobby and secure game access."));
      content.appendChild(create("span", "es-info-separator", " | "));
      content.appendChild(create("span", "es-info-current-label", "Current domain: "));
      content.appendChild(create("strong", "es-info-current", currentHost));
      strip.appendChild(content);
    }, "info:" + currentHost + ":" + VERSION);

    document.documentElement.classList.add("es-theme-info-mounted");
  }

  function renderHeader() {
    var header = query('[data-mj="header"]');
    if (!header) return;

    renderInfoStrip(header);
    convertHeaderMaskIcons(header);

    var left = query('[data-mj="header-left"]', header);
    var logo = left && query('[data-mj="logo"]', left);
    if (left && logo) {
      var logoRoot = logo.closest('[data-mj="logo"]') || logo;
      mount("escortesnew-header-license", "a", left, logoRoot.nextSibling, function (node) {
        node.href = "/en/aml-policy";
        node.setAttribute("aria-label", "Open license and AML policy");
        node.appendChild(makeImage(ASSETS.license, "es-header-license-image", "Anjouan license", 42, 42, false));
      });
    }

    var gift = query('[data-mj="header-special-button"]', header);
    if (gift) {
      gift.classList.add("es-gift-button");
      gift.setAttribute("aria-label", gift.getAttribute("aria-label") || "Promotions");
      if (!query(".es-gift-icon", gift)) {
        gift.appendChild(create("span", "es-gift-icon"));
      }
    }
  }

  function buildStory(href, asset, label) {
    var item = link(href, "es-story-link", "", label);
    item.appendChild(makeImage(asset, "", "", 26, 26, true));
    item.appendChild(create("span", "", label));
    return item;
  }

  function renderWelcome(container) {
    mount("escortesnew-welcome-banner", "section", container, container.firstChild, function (banner) {
      var copy = create("div", "es-welcome-copy");
      copy.appendChild(create("span", "", "New world of casino"));
      copy.appendChild(create("strong", "", "Claim your welcome bonus"));
      copy.appendChild(create("p", "", "Your next winning moment starts here. Play top casino games and unlock exclusive rewards."));

      var actions = create("div", "es-welcome-actions");
      actions.appendChild(link(CASINO_PATH, "es-primary-button", "Play now"));
      actions.appendChild(link(PROMOTIONS_PATH, "es-secondary-button", "Promotions"));
      copy.appendChild(actions);

      var art = create("div", "es-welcome-art");
      art.appendChild(makeImage(ASSETS.casino, "", "", 128, 128, true));

      banner.appendChild(copy);
      banner.appendChild(art);
    });
  }

  function renderStoryStrip(container) {
    var content = query('[data-mj="widget-info-panel-content"]', container);
    mount("escortesnew-story-strip", "nav", container, content || null, function (strip) {
      strip.setAttribute("aria-label", "Escortesnew quick categories");
      strip.appendChild(buildStory(SPORTS_PATH, ASSETS.sport, "Sport"));
      strip.appendChild(buildStory(CASINO_PATH, ASSETS.casino, "Casino"));
      strip.appendChild(buildStory(LIVE_CASINO_PATH, ASSETS.liveCasino, "Live Casino"));
      strip.appendChild(buildStory("/en/crash-games", ASSETS.crashGames, "Crash Games"));
      strip.appendChild(buildStory("/en/virtual-games", ASSETS.virtualGames, "Virtuals"));
      strip.appendChild(buildStory(PROMOTIONS_PATH, ASSETS.promotions, "Promotions"));
    });
  }

  function renderHomeWidgets() {
    var infoPanel = query('[data-mj="widget-info-panel"]');
    var container = infoPanel && query('[data-mj="widget-info-panel-container"]', infoPanel);
    if (container) {
      renderWelcome(container);
      renderStoryStrip(container);
    }

    renderTrustHub();
    renderJackpotPanel();
  }

  function trustCard(icon, value, label) {
    var card = create("article", "es-trust-card");
    var wrap = create("span", "es-trust-icon-wrap");
    wrap.appendChild(create("span", "es-trust-icon", icon));
    var copy = create("span", "es-trust-copy");
    copy.appendChild(create("span", "es-trust-value", value));
    copy.appendChild(create("span", "es-trust-label", label));
    card.appendChild(wrap);
    card.appendChild(copy);
    return card;
  }

  function renderTrustHub() {
    var main = query('main[data-mj="page-content"]') || query("main");
    if (!main || document.getElementById("escortesnew-trust-hub")) return;

    var anchor = query('[data-mj="widget-pages"]', main) || query('[data-mj="widget-game-slider"]', main);
    mount("escortesnew-trust-hub", "section", main, anchor ? anchor.nextSibling : null, function (section) {
      var head = create("div", "es-trust-head");
      head.appendChild(create("span", "es-trust-eyebrow", "Escortesnew advantages"));
      head.appendChild(create("h2", "es-trust-title", "Premium play, fast access, cleaner discovery"));
      head.appendChild(create("p", "es-trust-lead", "A compact hub for casino, live tables, fast games, and promotions."));

      var grid = create("div", "es-trust-grid");
      grid.appendChild(trustCard("+", "10K+", "Games"));
      grid.appendChild(trustCard("*", "24/7", "Support"));
      grid.appendChild(trustCard("$", "Crypto", "Deposits"));
      grid.appendChild(trustCard("#", "18+", "Responsible play"));

      section.appendChild(head);
      section.appendChild(grid);
    });
  }

  function jackpotCard(suit, label, value) {
    var card = create("article", "es-jackpot-card");
    card.appendChild(create("span", "es-jackpot-suit", suit));
    card.appendChild(create("span", "es-jackpot-label", label));
    card.appendChild(create("strong", "es-jackpot-value", value));
    return card;
  }

  function renderJackpotPanel() {
    var main = query('main[data-mj="page-content"]') || query("main");
    if (!main || document.getElementById("escortesnew-jackpot-panel")) return;

    var firstSlider = query('[data-mj="widget-game-slider"]', main);
    if (!firstSlider) return;

    mount("escortesnew-jackpot-panel", "section", main, firstSlider.nextSibling, function (section) {
      var head = create("div", "es-jackpot-head");
      var copy = create("div", "");
      copy.appendChild(create("h2", "", "Hot jackpots"));
      copy.appendChild(create("p", "", "Live lobby highlights styled after the Narcos premium cards."));
      head.appendChild(copy);
      head.appendChild(link(CASINO_PATH, "es-primary-button", "Open casino"));

      var grid = create("div", "es-jackpot-grid");
      grid.appendChild(jackpotCard("A", "Gold Drop", "$125,480"));
      grid.appendChild(jackpotCard("K", "Live Tables", "$84,920"));
      grid.appendChild(jackpotCard("Q", "Fast Games", "$42,750"));
      grid.appendChild(jackpotCard("J", "Daily Boost", "$18,360"));

      section.appendChild(head);
      section.appendChild(grid);
    });
  }

  function normalizeHref(href) {
    try {
      return new URL(href, window.location.href).pathname.toLowerCase().replace(/\/+$/, "") || "/";
    } catch (error) {
      return String(href || "").split(/[?#]/)[0].toLowerCase().replace(/\/+$/, "") || "/";
    }
  }

  function footerColumn(title, links) {
    var column = create("section", "es-footer-column");
    column.appendChild(create("h3", "es-footer-column-title", title));
    links.forEach(function (sourceLink) {
      var clone = sourceLink.cloneNode(true);
      clone.className = "es-footer-column-link";
      column.appendChild(clone);
    });
    if (!links.length) column.appendChild(create("span", "es-footer-column-note", "Coming soon"));
    return column;
  }

  function renderFooterColumns(footer, footerTop) {
    var source = query('[data-mj="footer-nav"]', footerTop);
    if (!source) return;

    var links = Array.prototype.slice.call(source.querySelectorAll("a"));
    var groups = [
      { title: "About", hrefs: ["/en/about-us", "/en/responsible-gaming", "/en/affiliate-program"] },
      { title: "Rules", hrefs: ["/en/privacy-policy", "/en/aml-policy"] },
      { title: "Help", hrefs: ["/en/contact-us", "/en/support", "/en/sitemap"] },
      { title: "Mobile App", hrefs: [] }
    ];

    var signature = links.map(function (item) {
      return normalizeHref(item.getAttribute("href")) + ":" + item.textContent.trim();
    }).join("|");

    mount("escortesnew-footer-columns", "div", footerTop, null, function (columns) {
      groups.forEach(function (group) {
        var matched = links.filter(function (item) {
          return group.hrefs.indexOf(normalizeHref(item.getAttribute("href"))) >= 0;
        });
        columns.appendChild(footerColumn(group.title, matched));
      });
    }, "footer-columns:" + signature);

    footer.setAttribute("data-es-enhanced-footer", "true");
  }

  function renderFooterAssets(content, before) {
    if (query('[data-escortesnew-footer-assets="true"]', content)) return;

    var wrap = create("div", "escortesnew-footer-assets");
    wrap.setAttribute("data-escortesnew-footer-assets", "true");

    var ios = link("https://apps.apple.com/", "", "", "Download on iOS", true);
    ios.setAttribute("data-escortesnew-footer-link", "ios");
    ios.appendChild(makeImage(ASSETS.ios, "", "Download on iOS", 132, 44, true));

    var android = link("https://play.google.com/", "", "", "Download on Android", true);
    android.setAttribute("data-escortesnew-footer-link", "android");
    android.appendChild(makeImage(ASSETS.android, "", "Download on Android", 132, 44, true));

    wrap.appendChild(ios);
    wrap.appendChild(android);
    content.insertBefore(wrap, before || null);
  }

  function valueCard(title, text) {
    var card = create("article", "es-value-card");
    card.appendChild(create("h3", "", title));
    card.appendChild(create("p", "", text));
    return card;
  }

  function socialCard(href, iconText, label, value, external) {
    var card = link(href, "es-social-card", "", label, external);
    card.appendChild(create("span", "es-social-icon", iconText));
    var copy = create("span", "es-social-copy");
    copy.appendChild(create("span", "es-social-label", label));
    copy.appendChild(create("span", "es-social-value", value));
    card.appendChild(copy);
    card.appendChild(create("span", "es-social-arrow", ">"));
    return card;
  }

  function renderFooterPanels(footer, content) {
    mount("escortesnew-values-panel", "section", content, content.firstChild, function (section) {
      section.appendChild(valueCard("Vision", "A polished casino lobby that makes high value games, live tables, and campaigns easier to find."));
      section.appendChild(valueCard("Experience", "Fast category access, premium visual hierarchy, and compact controls designed for repeat players."));
    });

    mount("escortesnew-social-panel", "section", content, query("#escortesnew-values-panel", content).nextSibling, function (section) {
      var heading = create("div", "es-social-heading");
      heading.appendChild(create("span", "es-social-kicker", "Official channels"));
      heading.appendChild(create("span", "es-social-title", "Stay close to the lobby"));
      section.appendChild(heading);
      section.appendChild(socialCard(WEBSITE_URL, "W", "Website", "escortesnew.com", true));
      section.appendChild(socialCard(PROMOTIONS_PATH, "%", "Promotions", "Daily offers", false));
      section.appendChild(socialCard(SUPPORT_PATH, "?", "Support", "Help center", false));
    });

    mount("escortesnew-license-banner", "section", content, null, function (section) {
      var panel = create("div", "es-license-panel");
      panel.appendChild(makeImage(ASSETS.license, "es-license-badge", "Anjouan license", 68, 68, true));

      var copy = create("div", "es-license-copy");
      copy.appendChild(create("span", "es-license-eyebrow", "Regulation and responsible play"));
      copy.appendChild(create("p", "es-license-title", "Escortesnew is styled with a premium casino interface while keeping policy, support, and responsible gaming links visible."));
      panel.appendChild(copy);
      panel.appendChild(link("/en/responsible-gaming", "es-license-action", "Responsible gaming"));
      section.appendChild(panel);
    });

    renderFooterAssets(content, query("#escortesnew-license-banner", content));
  }

  function renderFooter() {
    var footer = query('[data-mj="footer"]') || query("footer");
    if (!footer) return;
    var content = query('[data-mj="footer-content"]', footer) || footer;
    var footerTop = query('[data-mj="footer-top"]', footer);

    if (footerTop) renderFooterColumns(footer, footerTop);
    renderFooterPanels(footer, content);
  }

  function inferGameLobbyPath(sourceNode) {
    var node = sourceNode;
    var collected = [];
    for (var depth = 0; node && depth < 4; depth += 1, node = node.parentElement) {
      ["href", "data-mj", "data-testid", "id", "class", "aria-label"].forEach(function (name) {
        var value = node.getAttribute && node.getAttribute(name);
        if (value) collected.push(value);
      });
      if (node.textContent) collected.push(node.textContent.slice(0, 140));
    }
    return /live[-_\s]?casino/i.test(collected.join(" ")) ? LIVE_CASINO_PATH : CASINO_PATH;
  }

  function rememberSafePage(candidate) {
    if (!candidate || runtime.gameActive) return;
    runtime.gameReturnUrl = candidate;
  }

  function renderGameReturn() {
    var header = query('[data-mj="header"]') || document.body;
    var active = runtime.gameActive || (runtime.route && runtime.route.game);
    document.documentElement.classList.toggle("es-game-return-ready", !!active);

    var existing = document.getElementById("escortesnew-game-return");
    if (!active) {
      if (existing) existing.remove();
      return;
    }

    mount("escortesnew-game-return", "a", header, null, function (button) {
      button.className = "es-game-return";
      button.setAttribute("data-es-action", "game-return");
      button.appendChild(create("span", "es-game-return-icon", "<"));
      button.appendChild(create("span", "es-game-return-label", "Back to lobby"));
    });
    document.getElementById("escortesnew-game-return").href = runtime.gameReturnUrl || runtime.gameLobbyPath || CASINO_PATH;
  }

  function isPotentialGameFrame(frame) {
    if (!frame || frame.closest && frame.closest("#sportsbook-wrapper")) return false;
    var source = (frame.getAttribute("src") || "").trim();
    var sourceDoc = (frame.getAttribute("srcdoc") || "").trim();
    if (!source && !sourceDoc) return false;
    return /(?:game|casino|slot|launch|play|rgs|softswiss|spribe|evolution|ezugi|pragmatic|playtech)/i.test(source + " " + sourceDoc);
  }

  function syncGameFrameState() {
    var main = query('main[data-mj="page-content"]') || query("main");
    var frames = main ? main.querySelectorAll("iframe") : [];
    var active = false;

    Array.prototype.forEach.call(frames, function (frame) {
      if (!isPotentialGameFrame(frame)) return;
      var rect = frame.getBoundingClientRect();
      if (rect.width > 80 && rect.height > 80) active = true;
    });

    runtime.gameActive = active;
    document.documentElement.classList.toggle("es-game-embed", active);
    renderGameReturn();
  }

  function bootTiltCards() {
    if (runtime.tiltStarted) return;
    runtime.tiltStarted = true;

    var selector = '[data-mj="game-catalog-card"],[data-mj="widget-game-card"]';
    var angle = 14;
    var lerpAmount = 0.08;
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    var cards = new Set();

    function remap(value, oldMax, newMax) {
      var next = ((value + oldMax) * (newMax * 2)) / (oldMax * 2) - newMax;
      return Math.min(Math.max(next, -newMax), newMax);
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
      var x = remap(event.clientX - rect.left - rect.width / 2, rect.width / 2, angle);
      var y = remap(event.clientY - rect.top - rect.height / 2, rect.height / 2, angle);
      card.dataset.rotateY = String(x);
      card.dataset.rotateX = String(-y);
    }

    function onMouseLeave(event) {
      event.currentTarget.dataset.rotateX = "0";
      event.currentTarget.dataset.rotateY = "0";
    }

    function enhanceCard(card) {
      if (!card || card.dataset.escortesnewTilt === "1") return;
      card.dataset.escortesnewTilt = "1";
      resetCard(card);
      card.addEventListener("mousemove", onMouseMove);
      card.addEventListener("mouseleave", onMouseLeave);
      cards.add(card);
    }

    function enhanceCards(root) {
      if (!root || !root.querySelectorAll) return;
      if (root.matches && root.matches(selector)) enhanceCard(root);
      Array.prototype.forEach.call(root.querySelectorAll(selector), enhanceCard);
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
        var nextX = currentX + (targetX - currentX) * lerpAmount;
        var nextY = currentY + (targetY - currentY) * lerpAmount;
        card.style.setProperty("--rotateX", nextX + "deg");
        card.style.setProperty("--rotateY", nextY + "deg");
        card.style.setProperty("--escortesnew-tilt-transform", "perspective(900px) rotateX(" + nextX + "deg) rotateY(" + nextY + "deg)");
      });
      requestAnimationFrame(update);
    }

    enhanceCards(document);
    requestAnimationFrame(update);
  }

  function onDocumentClick(event) {
    var target = event.target;
    if (!target || !target.closest) return;

    var action = target.closest("[data-es-action]");
    if (action && action.getAttribute("data-es-action") === "game-return") {
      event.preventDefault();
      window.location.assign(action.getAttribute("href") || runtime.gameLobbyPath || CASINO_PATH);
      return;
    }

    var gameCard = target.closest('[data-mj="game-catalog-card"],[data-mj="widget-game-card"],[data-mj*="game-card"],[class*="game-card"]');
    if (gameCard) {
      runtime.gameLobbyPath = inferGameLobbyPath(gameCard);
      rememberSafePage(window.location.href);
    }

    var anchor = target.closest("a[href]");
    if (anchor && !runtime.gameActive) rememberSafePage(window.location.href);
  }

  function patchHistory() {
    ["pushState", "replaceState"].forEach(function (name) {
      var original = window.history[name];
      if (!original || original.__escortesnewNarcosWrapped) return;
      var wrapped = function () {
        if (!runtime.gameActive) rememberSafePage(window.location.href);
        var result = original.apply(this, arguments);
        setTimeout(refresh, 0);
        return result;
      };
      wrapped.__escortesnewNarcosWrapped = true;
      window.history[name] = wrapped;
      runtime.history.push([name, original, wrapped]);
    });
  }

  function scheduleEffectsReady() {
    if (runtime.effectsTimer) return;
    runtime.effectsTimer = window.setTimeout(function () {
      runtime.effectsTimer = 0;
      document.documentElement.classList.add("es-effects-ready");
    }, 240);
  }

  function refresh() {
    applyRouteClasses();
    ensureCss();
    renderHeader();
    renderHomeWidgets();
    renderFooter();
    convertHeaderMaskIcons(document);
    bootTiltCards();
    syncGameFrameState();
    scheduleEffectsReady();
  }

  function destroy() {
    runtime.listeners.forEach(function (entry) {
      entry[0].removeEventListener(entry[1], entry[2], entry[3]);
    });
    runtime.history.forEach(function (entry) {
      if (window.history[entry[0]] === entry[2]) window.history[entry[0]] = entry[1];
    });
    if (runtime.observer) runtime.observer.disconnect();
    if (runtime.effectsTimer) window.clearTimeout(runtime.effectsTimer);
    [
      "escortesnew-info-strip",
      "escortesnew-header-license",
      "escortesnew-welcome-banner",
      "escortesnew-story-strip",
      "escortesnew-trust-hub",
      "escortesnew-jackpot-panel",
      "escortesnew-footer-columns",
      "escortesnew-values-panel",
      "escortesnew-social-panel",
      "escortesnew-license-banner",
      "escortesnew-game-return"
    ].forEach(function (id) {
      var node = document.getElementById(id);
      if (node) node.remove();
    });
    document.documentElement.classList.remove(
      "es-home-route",
      "es-info-safe-route",
      "es-sports-route",
      "es-game-route",
      "es-game-embed",
      "es-game-return-ready",
      "es-theme-info-mounted",
      "es-effects-ready"
    );
    var footer = query('[data-mj="footer"]');
    if (footer) footer.removeAttribute("data-es-enhanced-footer");
  }

  runtime.refresh = refresh;
  runtime.destroy = destroy;

  listen(document, "click", onDocumentClick, true);
  listen(window, "popstate", function () { setTimeout(refresh, 0); });
  listen(window, "hashchange", function () { setTimeout(refresh, 0); });
  listen(window, "resize", function () { setTimeout(syncGameFrameState, 80); });
  listen(window, "orientationchange", function () { setTimeout(syncGameFrameState, 180); });

  patchHistory();
  refresh();

  if (typeof MutationObserver === "function") {
    runtime.observer = new MutationObserver(function (records) {
      var shouldRefresh = false;
      records.forEach(function (record) {
        if (shouldRefresh) return;
        if (record.target && record.target.closest && record.target.closest('[id^="escortesnew-"]')) return;
        Array.prototype.forEach.call(record.addedNodes, function (node) {
          if (shouldRefresh || node.nodeType !== 1) return;
          if (node.id && node.id.indexOf("escortesnew-") === 0) return;
          shouldRefresh = true;
        });
      });
      if (shouldRefresh) requestAnimationFrame(refresh);
    });
    runtime.observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
