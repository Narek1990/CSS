(function () {
  "use strict";

  var notVerifiedSelector = "a.app-ltr-1a59aej, a.app-rtl-1a59aej";
  var statusCardSelector = ".app-ltr-1mfp3qc, .app-rtl-1mfp3qc";
  var depositButtonSelector = 'button[aria-label="deposit"][name="deposit"].sl-icon';
  var vipImageSrc = (function () {
    var scriptSource = document.currentScript && document.currentScript.src;

    try {
      if (scriptSource) {
        return new URL("assets/vip-button.png", scriptSource).href;
      }
    } catch (error) {
      /* Fall through to the public CDN URL. */
    }

    return "https://cdn.jsdelivr.net/gh/Narek1990/CSS@refs/heads/main/donebets/assets/vip-button.png";
  })();
  var depositIconSrc = (function () {
    var scriptSource = document.currentScript && document.currentScript.src;

    try {
      if (scriptSource) {
        return new URL("assets/deposit-icon.png", scriptSource).href;
      }
    } catch (error) {
      /* Fall through to the public CDN URL. */
    }

    return "https://cdn.jsdelivr.net/gh/Narek1990/CSS@refs/heads/main/donebets/assets/deposit-icon.png";
  })();
  var observer;

  function normalizeText(node) {
    return (node && node.textContent ? node.textContent : "").replace(/\s+/g, " ").trim();
  }

  function buildContactDetailsHref() {
    var url = new URL(window.location.href);
    url.searchParams.set("m", "account");
    url.searchParams.set("t", "contact_details");
    return url.pathname + url.search + url.hash;
  }

  function enhanceNotVerifiedLink(anchor) {
    var value;

    if (!anchor) {
      return;
    }

    value = (anchor.textContent || "").trim().toLowerCase();

    if (value !== "not verified") {
      return;
    }

    anchor.href = buildContactDetailsHref();
    anchor.setAttribute("data-donebets-contact-link", "true");
    anchor.style.setProperty("cursor", "pointer", "important");
  }

  function enhanceDepositButton(button) {
    var image;
    var label;
    var children;

    if (!button) {
      return;
    }

    image = button.querySelector('img[data-donebets-deposit-icon="true"]');
    label = button.querySelector('[data-donebets-deposit-label="true"]');

    if (
      button.getAttribute("data-donebets-deposit-ready") === "true" &&
      image &&
      label &&
      image.getAttribute("src") === depositIconSrc &&
      label.textContent === "DEPOSIT" &&
      button.childNodes.length === 2 &&
      button.firstChild === image &&
      button.lastChild === label
    ) {
      return;
    }

    if (!image) {
      image = document.createElement("img");
    }

    if (!label) {
      label = document.createElement("span");
    }

    image.src = depositIconSrc;
    image.alt = "";
    image.className = "donebets-deposit-icon";
    image.setAttribute("data-donebets-deposit-icon", "true");
    image.decoding = "async";
    image.loading = "eager";

    label.className = "donebets-deposit-label";
    label.setAttribute("data-donebets-deposit-label", "true");
    label.textContent = "DEPOSIT";

    children = Array.prototype.slice.call(button.childNodes);
    children.forEach(function (child) {
      if (child !== image && child !== label) {
        button.removeChild(child);
      }
    });

    if (button.firstChild !== image) {
      button.insertBefore(image, button.firstChild);
    }

    if (image.nextSibling !== label) {
      button.insertBefore(label, image.nextSibling);
    }

    button.classList.add("donebets-deposit-button");
    button.setAttribute("data-donebets-deposit-ready", "true");
  }

  function isMyStatusLabel(element) {
    return element && element.tagName === "P" && normalizeText(element) === "My Status";
  }

  function isVipStatusValue(element) {
    return element && element.tagName === "P" && normalizeText(element) === "VIP";
  }

  function enhanceVipStatusCard(card) {
    var label;
    var value;
    var image;

    if (!card || !card.querySelectorAll || card.getAttribute("data-donebets-vip-status-ready") === "true") {
      return;
    }

    card.querySelectorAll("p").forEach(function (paragraph) {
      if (!label && isMyStatusLabel(paragraph)) {
        label = paragraph;
      }

      if (!value && isVipStatusValue(paragraph)) {
        value = paragraph;
      }
    });

    if (!label || !value || value.querySelector("[data-donebets-vip-status-image]")) {
      return;
    }

    image = document.createElement("img");
    image.src = vipImageSrc;
    image.alt = "VIP";
    image.className = "donebets-vip-status-image";
    image.setAttribute("data-donebets-vip-status-image", "true");
    image.setAttribute("fetchpriority", "high");
    image.decoding = "async";
    image.loading = "eager";

    if (label.parentNode) {
      label.parentNode.removeChild(label);
    }

    if (value.parentNode) {
      value.parentNode.replaceChild(image, value);
    }
    card.setAttribute("data-donebets-vip-status-ready", "true");
  }

  function enhanceVipStatusFromText(root) {
    if (!root || !root.querySelectorAll) {
      return;
    }

    root.querySelectorAll("p").forEach(function (paragraph) {
      var text = normalizeText(paragraph);

      if ((text === "My Status" || text === "VIP") && paragraph.parentElement) {
        enhanceVipStatusCard(paragraph.parentElement);
      }
    });
  }

  function applyToNode(node) {
    if (!node || (node.nodeType !== 1 && node.nodeType !== 9)) {
      return;
    }

    if (node.matches && node.matches(notVerifiedSelector)) {
      enhanceNotVerifiedLink(node);
    }

    if (node.matches && node.matches(depositButtonSelector)) {
      enhanceDepositButton(node);
    }

    if (node.querySelectorAll) {
      node.querySelectorAll(notVerifiedSelector).forEach(enhanceNotVerifiedLink);
      node.querySelectorAll(depositButtonSelector).forEach(enhanceDepositButton);
    }

    if (node.matches && node.matches(statusCardSelector)) {
      enhanceVipStatusCard(node);
    }

    if (node.closest) {
      enhanceVipStatusCard(node.closest(statusCardSelector));
    }

    if (node.tagName === "P" && node.parentElement) {
      enhanceVipStatusCard(node.parentElement);
    }

    if (node.querySelectorAll) {
      node.querySelectorAll(statusCardSelector).forEach(enhanceVipStatusCard);
      enhanceVipStatusFromText(node);
    }
  }

  var betWinImageSelector = '[data-mj="widget-bet-win"] img';
  var betWinWidgetId = "";
  var betWinScanScheduled = false;
  var betWinMetadataPromise = null;
  var betWinMetadataLoaded = false;
  var betWinMetadataRefreshTimer = null;
  var betWinGameDetails = Object.create(null);
  var betWinGameDetailsByTitle = Object.create(null);

  function getBetWinLanguage() {
    return ((document.documentElement && document.documentElement.lang) || "en").split("-")[0];
  }

  function extractBetWinArray(payload) {
    if (Array.isArray(payload)) {
      return payload;
    }

    if (!payload || typeof payload !== "object") {
      return [];
    }

    if (Array.isArray(payload.data)) {
      return payload.data;
    }

    if (Array.isArray(payload.items)) {
      return payload.items;
    }

    if (Array.isArray(payload.result)) {
      return payload.result;
    }

    if (payload.data && typeof payload.data === "object") {
      return extractBetWinArray(payload.data);
    }

    return [];
  }

  function normalizeBetWinId(value) {
    return value === null || value === undefined ? "" : String(value).trim();
  }

  function normalizeBetWinTitle(value) {
    return String(value || "")
      .replace(/[™®©]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function fetchBetWinJson(path, options) {
    var requestOptions = Object.assign(
      {
        credentials: "same-origin",
        headers: {
          "Accept-Language": getBetWinLanguage()
        }
      },
      options || {}
    );

    requestOptions.headers = Object.assign(
      {
        "Accept-Language": getBetWinLanguage()
      },
      requestOptions.headers || {}
    );

    return window.fetch(window.location.origin + path, requestOptions).then(function (response) {
      if (!response.ok) {
        throw new Error("Donebets API request failed: " + response.status);
      }

      return response.json();
    });
  }

  function findBetWinWidgetId(value) {
    var keys;
    var index;
    var key;
    var found;

    if (!value || typeof value !== "object") {
      return "";
    }

    if (!Array.isArray(value) && value.betWinId !== undefined && value.betWinId !== null) {
      return normalizeBetWinId(value.betWinId);
    }

    if (Array.isArray(value)) {
      for (index = 0; index < value.length; index += 1) {
        found = findBetWinWidgetId(value[index]);
        if (found) {
          return found;
        }
      }

      return "";
    }

    keys = Object.keys(value);
    for (index = 0; index < keys.length; index += 1) {
      key = keys[index];

      if (key === "data" && typeof value[key] === "string") {
        try {
          found = findBetWinWidgetId(JSON.parse(value[key]));
          if (found) {
            return found;
          }
        } catch (error) {
          /* Ignore non-JSON widget fields. */
        }
      }

      found = findBetWinWidgetId(value[key]);
      if (found) {
        return found;
      }
    }

    return "";
  }

  function resolveBetWinWidgetId() {
    if (betWinWidgetId) {
      return Promise.resolve(betWinWidgetId);
    }

    return fetchBetWinJson("/api/app/api/v1/SiteWidgets?pageIdentifier=home")
      .then(function (payload) {
        betWinWidgetId = findBetWinWidgetId(payload) || "122";
        return betWinWidgetId;
      })
      .catch(function () {
        betWinWidgetId = "122";
        return betWinWidgetId;
      });
  }

  function getGameImageId(src) {
    var match = (src || "").match(/(?:gameimage\/|game(?:id)?[=/:_-])(\d+)/i);
    return match ? match[1] : "";
  }

  function getBetWinImageId(image) {
    var id =
      image.getAttribute("data-game-id") ||
      image.getAttribute("data-gameid") ||
      image.getAttribute("data-id") ||
      "";

    if (/^\d+$/.test(id)) {
      return id;
    }

    id = getGameImageId(image.getAttribute("src") || "");
    if (id) {
      return id;
    }

    var link = image.closest("a[href]");
    return link ? getGameImageId(link.getAttribute("href") || "") : "";
  }

  function getBetWinImageTitle(image) {
    return (
      image.getAttribute("data-game-name") ||
      image.getAttribute("data-gamename") ||
      image.getAttribute("alt") ||
      image.getAttribute("title") ||
      ""
    ).replace(/\s+/g, " ").trim();
  }

  function findBetWinUserRow(card) {
    var paragraphs;
    var index;

    if (!card || !card.querySelectorAll) {
      return null;
    }

    paragraphs = card.querySelectorAll("p");

    for (index = 0; index < paragraphs.length; index += 1) {
      if (paragraphs[index].querySelector('i[aria-label="user"]')) {
        return paragraphs[index];
      }
    }

    return null;
  }

  function findBetWinCard(image) {
    var widget = image.closest('[data-mj="widget-bet-win"]');
    var root = image.parentElement;

    while (root && root !== widget) {
      if (findBetWinUserRow(root)) {
        return root;
      }

      root = root.parentElement;
    }

    return null;
  }

  function getBetWinImages() {
    var images = [];

    document.querySelectorAll(betWinImageSelector).forEach(function (image) {
      if (findBetWinCard(image)) {
        images.push(image);
      }
    });

    return images;
  }

  function collectBetWinDomGames() {
    var byId = Object.create(null);
    var titles = [];

    getBetWinImages().forEach(function (image) {
      var id = getBetWinImageId(image);
      var title = getBetWinImageTitle(image);

      if (title && titles.indexOf(title) === -1) {
        titles.push(title);
      }

      if (id && !byId[id]) {
        byId[id] = {
          title: title
        };
      }
    });

    return {
      byId: byId,
      titles: titles
    };
  }

  function collectBetWinLiveGames(payload) {
    var liveGames = Object.create(null);

    extractBetWinArray(payload).forEach(function (item) {
      var id = normalizeBetWinId(item && (item.gameId !== undefined ? item.gameId : item.id));
      var title = item && (item.gameName || item.name);

      if (id && title) {
        liveGames[id] = String(title).trim();
      }
    });

    return liveGames;
  }

  function addBetWinTitleDetail(index, detail) {
    var key = normalizeBetWinTitle(detail && detail.title);
    var existing;

    if (!key || !detail) {
      return;
    }

    if (!Object.prototype.hasOwnProperty.call(index, key)) {
      index[key] = detail;
      return;
    }

    existing = index[key];

    if (
      !existing ||
      existing.provider !== detail.provider ||
      existing.title !== detail.title
    ) {
      index[key] = null;
    }
  }

  function findExactBetWinSearchGame(title) {
    if (!title) {
      return Promise.resolve(null);
    }

    return fetchBetWinJson(
      "/api/integration/api/v1/WebSites/searchgames?query=" + encodeURIComponent(title)
    )
      .then(function (payload) {
        var matches = extractBetWinArray(payload).filter(function (game) {
          return (
            game &&
            normalizeBetWinTitle(game.name || game.gameName) === normalizeBetWinTitle(title) &&
            (game.providerName || game.provider)
          );
        });
        var providers = Object.create(null);

        matches.forEach(function (game) {
          providers[String(game.providerName || game.provider).trim()] = true;
        });

        if (!matches.length || Object.keys(providers).length !== 1) {
          return null;
        }

        return {
          title: String(matches[0].name || matches[0].gameName).trim(),
          provider: Object.keys(providers)[0]
        };
      })
      .catch(function () {
        return null;
      });
  }

  function loadBetWinMetadata() {
    if (betWinMetadataPromise) {
      return betWinMetadataPromise;
    }

    betWinMetadataPromise = resolveBetWinWidgetId()
      .then(function (widgetId) {
        return fetchBetWinJson("/api/livewidget/api/v1/LiveWidget/" + encodeURIComponent(widgetId) + "/list");
      })
      .then(function (payload) {
        var liveGames = collectBetWinLiveGames(payload);
        var domGames = collectBetWinDomGames();
        var gameTitles = Object.create(null);
        var gameIds;

        Object.keys(liveGames).forEach(function (id) {
          gameTitles[id] = liveGames[id];
        });

        Object.keys(domGames.byId).forEach(function (id) {
          if (domGames.byId[id].title) {
            gameTitles[id] = domGames.byId[id].title;
          }
        });

        gameIds = Object.keys(gameTitles);

        if (!gameIds.length) {
          return {
            domGames: domGames,
            gameTitles: gameTitles,
            details: []
          };
        }

        return fetchBetWinJson("/api/integration/api/v1/WebSites/games/details", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(gameIds.map(function (id) {
            return Number(id);
          }))
        }).then(function (detailsPayload) {
          return {
            domGames: domGames,
            gameTitles: gameTitles,
            details: extractBetWinArray(detailsPayload)
          };
        });
      })
      .then(function (result) {
        var nextDetails = Object.create(null);
        var nextDetailsByTitle = Object.create(null);
        var searchTitles = Object.create(null);
        var unresolvedIds;

        result.details.forEach(function (game) {
          var id = normalizeBetWinId(game && (game.id !== undefined ? game.id : game.gameId));
          var title = game && (game.name || game.gameName);
          var provider = game && (game.providerName || game.provider);
          var domGame = result.domGames.byId[id];

          if (
            id &&
            title &&
            provider &&
            (!domGame ||
              !domGame.title ||
              normalizeBetWinTitle(domGame.title) === normalizeBetWinTitle(title))
          ) {
            nextDetails[id] = {
              title: String(title).trim(),
              provider: String(provider).trim()
            };
            addBetWinTitleDetail(nextDetailsByTitle, nextDetails[id]);
          }
        });

        unresolvedIds = Object.keys(result.gameTitles).filter(function (id) {
          return !nextDetails[id];
        });

        unresolvedIds.forEach(function (id) {
          var title = result.gameTitles[id];
          var key = normalizeBetWinTitle(title);

          if (key && !Object.prototype.hasOwnProperty.call(nextDetailsByTitle, key)) {
            searchTitles[key] = title;
          }
        });

        result.domGames.titles.forEach(function (title) {
          var key = normalizeBetWinTitle(title);

          if (key && !Object.prototype.hasOwnProperty.call(nextDetailsByTitle, key)) {
            searchTitles[key] = title;
          }
        });

        return Promise.all(
          Object.keys(searchTitles).map(function (key) {
            return findExactBetWinSearchGame(searchTitles[key]).then(function (details) {
              return {
                key: key,
                details: details
              };
            });
          })
        ).then(function (searchResults) {
          var searchedByTitle = Object.create(null);

          searchResults.forEach(function (resultItem) {
            if (resultItem.details) {
              searchedByTitle[resultItem.key] = resultItem.details;
              addBetWinTitleDetail(nextDetailsByTitle, resultItem.details);
            }
          });

          unresolvedIds.forEach(function (id) {
            var key = normalizeBetWinTitle(result.gameTitles[id]);

            if (!nextDetails[id] && searchedByTitle[key]) {
              nextDetails[id] = searchedByTitle[key];
            }
          });

          betWinGameDetails = nextDetails;
          betWinGameDetailsByTitle = nextDetailsByTitle;
          betWinMetadataLoaded = true;
          return nextDetails;
        });
      })
      .catch(function (error) {
        betWinMetadataLoaded = true;
        betWinGameDetails = Object.create(null);
        betWinGameDetailsByTitle = Object.create(null);

        if (window.console && console.warn) {
          console.warn("[Donebets] Could not load exact bet-win game metadata.", error);
        }

        return betWinGameDetails;
      })
      .then(function (details) {
        betWinMetadataPromise = null;
        return details;
      });

    return betWinMetadataPromise;
  }

  function scheduleBetWinMetadataRefresh() {
    if (betWinMetadataRefreshTimer) {
      return;
    }

    betWinMetadataRefreshTimer = window.setTimeout(function () {
      betWinMetadataRefreshTimer = null;
      betWinMetadataLoaded = false;
      loadBetWinMetadata().then(function () {
        injectBetWinGameDetails();
      });
    }, 30000);
  }

  function getBetWinMeta(info) {
    return info.querySelector(
      '[data-donebets-bet-win-meta="true"], .esportesnow-bet-win-meta'
    );
  }

  function styleBetWinMeta(meta, titleElement, providerElement) {
    meta.style.setProperty("display", "flex", "important");
    meta.style.setProperty("flex-direction", "column", "important");
    meta.style.setProperty("align-items", "flex-start", "important");
    meta.style.setProperty("gap", "1px", "important");
    meta.style.setProperty("width", "100%", "important");
    meta.style.setProperty("min-width", "0", "important");
    meta.style.setProperty("max-width", "100%", "important");
    meta.style.setProperty("overflow", "hidden", "important");
    meta.style.setProperty("visibility", "visible", "important");
    meta.style.setProperty("opacity", "1", "important");

    [titleElement, providerElement].forEach(function (element) {
      element.style.setProperty("display", "block", "important");
      element.style.setProperty("max-width", "100%", "important");
      element.style.setProperty("overflow", "hidden", "important");
      element.style.setProperty("text-overflow", "ellipsis", "important");
      element.style.setProperty("white-space", "nowrap", "important");
      element.style.setProperty("visibility", "visible", "important");
      element.style.setProperty("opacity", "1", "important");
    });

    titleElement.style.setProperty("color", "#ffffff", "important");
    providerElement.style.setProperty("color", "rgba(255, 255, 255, 0.72)", "important");
    titleElement.style.setProperty("font-size", "14px", "important");
    providerElement.style.setProperty("font-size", "11px", "important");
    titleElement.style.setProperty("font-weight", "800", "important");
    providerElement.style.setProperty("font-weight", "650", "important");
  }

  function createBetWinMeta(title, provider) {
    var meta = document.createElement("div");
    var titleElement = document.createElement("span");
    var providerElement = document.createElement("span");

    meta.className = "esportesnow-bet-win-meta";
    meta.setAttribute("data-donebets-bet-win-meta", "true");
    titleElement.className = "esportesnow-bet-win-title";
    providerElement.className = "esportesnow-bet-win-provider";
    titleElement.textContent = title;
    providerElement.textContent = provider;
    styleBetWinMeta(meta, titleElement, providerElement);
    meta.appendChild(titleElement);
    meta.appendChild(providerElement);

    return meta;
  }

  function removeBetWinMeta(meta) {
    if (meta && meta.parentNode) {
      meta.parentNode.removeChild(meta);
    }
  }

  function injectBetWinGameDetails() {
    if (!betWinMetadataLoaded) {
      loadBetWinMetadata().then(function () {
        injectBetWinGameDetails();
      });
      return;
    }

    getBetWinImages().forEach(function (image) {
      var card = findBetWinCard(image);
      var userRow = findBetWinUserRow(card);
      var info = userRow && userRow.parentElement;
      var id = getBetWinImageId(image);
      var title = getBetWinImageTitle(image);
      var details = (id && betWinGameDetails[id]) ||
        (title && betWinGameDetailsByTitle[normalizeBetWinTitle(title)]);
      var meta = info && getBetWinMeta(info);
      var titleElement;
      var providerElement;

      if (!info || !userRow) {
        return;
      }

      card.classList.add("donebets-bet-win-card");
      info.classList.add("donebets-bet-win-info");

      if (!details || !details.title || !details.provider) {
        removeBetWinMeta(meta);
        return;
      }

      if (!meta) {
        meta = createBetWinMeta(details.title, details.provider);
        info.insertBefore(meta, userRow);
        return;
      }

      titleElement = meta.querySelector(".esportesnow-bet-win-title");
      providerElement = meta.querySelector(".esportesnow-bet-win-provider");

      if (!titleElement || !providerElement) {
        removeBetWinMeta(meta);
        info.insertBefore(createBetWinMeta(details.title, details.provider), userRow);
        return;
      }

      if (titleElement.textContent !== details.title) {
        titleElement.textContent = details.title;
      }

      if (providerElement.textContent !== details.provider) {
        providerElement.textContent = details.provider;
      }

      styleBetWinMeta(meta, titleElement, providerElement);
    });

    scheduleBetWinMetadataRefresh();
  }

  function scheduleBetWinScan() {
    if (betWinScanScheduled) {
      return;
    }

    betWinScanScheduled = true;
    window.requestAnimationFrame(function () {
      betWinScanScheduled = false;
      injectBetWinGameDetails();
    });
  }

  (function () {
    "use strict";

    var eventsSelector = '[data-mj="widget-phoenix-sport-container"] #ph-sport-widget .top-events';

    function findEvents(header, index) {
      var root = header.parentElement;
      var events;

      while (root && root !== document.body) {
        events = root.querySelector(eventsSelector);
        if (events) return events;
        root = root.parentElement;
      }

      return document.querySelectorAll(eventsSelector)[index] || null;
    }

    function cloneArrow(direction) {
      var name = "arrow_" + direction;
      var source = document.querySelector(
        'button[aria-label="' + name + '"][name="' + name + '"].sl-icon:not([data-inancbet-slider-control])'
      );
      var button;

      if (!source) return null;

      button = source.cloneNode(true);
      button.removeAttribute("id");
      button.removeAttribute("aria-controls");
      button.removeAttribute("data-state");
      button.type = "button";
      button.setAttribute("data-inancbet-slider-control", direction);
      button.classList.add("inancbet-slider-control");
      return button;
    }

    function scrollEvents(events, direction) {
      var card = events.querySelector(".ph-event-card");
      var styles = window.getComputedStyle(events);
      var gap = parseFloat(styles.columnGap || styles.gap) || 24;
      var distance = (card ? card.getBoundingClientRect().width : 420) + gap;

      events.scrollBy({ left: direction * distance, behavior: "smooth" });
    }

    function enableMouseDrag(events) {
      var dragging = false;
      var moved = false;
      var suppressClick = false;
      var startX = 0;
      var startScrollLeft = 0;

      if (events.getAttribute("data-inancbet-mouse-drag") === "true") return;

      events.setAttribute("data-inancbet-mouse-drag", "true");
      events.classList.add("inancbet-mouse-drag");

      events.addEventListener("pointerdown", function (event) {
        if (event.pointerType !== "mouse" || event.button !== 0) return;
        dragging = true;
        moved = false;
        startX = event.clientX;
        startScrollLeft = events.scrollLeft;
        events.setPointerCapture(event.pointerId);
        events.classList.add("is-dragging");
      });

      events.addEventListener("pointermove", function (event) {
        var distance;

        if (!dragging) return;
        distance = event.clientX - startX;
        if (Math.abs(distance) > 4) moved = true;
        if (!moved) return;
        event.preventDefault();
        events.scrollLeft = startScrollLeft - distance;
      });

      function stopDragging(event) {
        if (!dragging) return;
        dragging = false;
        suppressClick = moved;
        events.classList.remove("is-dragging");

        if (events.hasPointerCapture(event.pointerId)) {
          events.releasePointerCapture(event.pointerId);
        }

        window.setTimeout(function () {
          suppressClick = false;
        }, 0);
      }

      events.addEventListener("pointerup", stopDragging);
      events.addEventListener("pointercancel", stopDragging);
      events.addEventListener("click", function (event) {
        if (!suppressClick) return;
        event.preventDefault();
        event.stopPropagation();
      }, true);
    }

    function addSliderButtons() {
      document.querySelectorAll('[data-mj="widget-phoenix-sport-header"]').forEach(function (header, index) {
        var actions = header.querySelector(".app-ltr-1dzjkmt, .app-rtl-1dzjkmt");
        var allLink = actions && actions.querySelector(".app-ltr-1qyij3p, .app-rtl-1qyij3p");
        var events = findEvents(header, index);
        var previousButton;
        var nextButton;
        var controls;

        if (!actions || !allLink || !events) return;

        enableMouseDrag(events);

        if (actions.querySelector('[data-inancbet-slider-controls="true"]')) return;

        previousButton = cloneArrow("left");
        nextButton = cloneArrow("right");
        if (!previousButton || !nextButton) return;

        controls = document.createElement("div");
        controls.className = "inancbet-slider-controls";
        controls.setAttribute("data-inancbet-slider-controls", "true");
        previousButton.addEventListener("click", function () {
          var currentEvents = findEvents(header, index);
          if (currentEvents) scrollEvents(currentEvents, -1);
        });
        nextButton.addEventListener("click", function () {
          var currentEvents = findEvents(header, index);
          if (currentEvents) scrollEvents(currentEvents, 1);
        });
        controls.append(previousButton, nextButton);
        actions.insertBefore(controls, allLink.nextSibling);
      });
    }

    var scheduled = false;
    var observer = new MutationObserver(function () {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(function () {
        scheduled = false;
        addSliderButtons();
      });
    });

    function initSliderButtons() {
      observer.observe(document.body, { childList: true, subtree: true });
      addSliderButtons();
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initSliderButtons, { once: true });
    } else {
      initSliderButtons();
    }
  })();

  function observe() {
    if (observer) {
      return;
    }

    observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(applyToNode);

        if (mutation.type === "characterData" && mutation.target && mutation.target.parentElement) {
          applyToNode(mutation.target.parentElement);
        }
      });

      scheduleBetWinScan();
    });

    observer.observe(document.documentElement, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  applyToNode(document);
  observe();
  scheduleBetWinScan();
})();
