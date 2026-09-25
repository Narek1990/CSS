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

  var betWinImageSelector = '[data-mj="widget-bet-win"] img[src*="/gameimage/"]';
  var betWinWidgetId = "";
  var betWinScanScheduled = false;
  var betWinMetadataPromise = null;
  var betWinMetadataLoaded = false;
  var betWinMetadataRefreshTimer = null;
  var betWinGameDetails = Object.create(null);

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
    var match = (src || "").match(/gameimage\/([^/?#]+?)(?:\.(?:webp|png|jpe?g))?(?:[?#]|$)/i);
    return match ? match[1] : "";
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

  function normalizeBetWinTitle(value) {
    return String(value || "")
      .replace(/[™®©]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
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
        var gameIds = Object.keys(liveGames);

        if (!gameIds.length) {
          return {
            liveGames: liveGames,
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
            liveGames: liveGames,
            details: extractBetWinArray(detailsPayload)
          };
        });
      })
      .then(function (result) {
        var liveGames = result.liveGames;
        var nextDetails = Object.create(null);
        var unresolvedIds;

        result.details.forEach(function (game) {
          var id = normalizeBetWinId(game && (game.id !== undefined ? game.id : game.gameId));
          var title = game && (game.name || game.gameName);
          var provider = game && (game.providerName || game.provider);

          if (id && title && provider) {
            nextDetails[id] = {
              title: String(title).trim(),
              provider: String(provider).trim()
            };
          }
        });

        unresolvedIds = Object.keys(liveGames).filter(function (id) {
          return !nextDetails[id];
        });

        return Promise.all(
          unresolvedIds.map(function (id) {
            return findExactBetWinSearchGame(liveGames[id]).then(function (details) {
              return {
                id: id,
                details: details
              };
            });
          })
        ).then(function (fallbackDetails) {
          fallbackDetails.forEach(function (item) {
            if (item.details) {
              nextDetails[item.id] = item.details;
            }
          });

          betWinGameDetails = nextDetails;
          betWinMetadataLoaded = true;
          return nextDetails;
        });
      })
      .catch(function (error) {
        betWinMetadataLoaded = true;
        betWinGameDetails = Object.create(null);
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

    document.querySelectorAll(betWinImageSelector).forEach(function (image) {
      var imageContainer = image.parentElement;
      var card = imageContainer && imageContainer.parentElement;
      var userRow = card && card.querySelector('p:has(i[aria-label="user"])');
      var info = userRow && userRow.parentElement;
      var id = image && getGameImageId(image.getAttribute("src"));
      var details = id ? betWinGameDetails[id] : null;
      var meta = info && getBetWinMeta(info);
      var titleElement;
      var providerElement;

      if (!info || !userRow) {
        return;
      }

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
