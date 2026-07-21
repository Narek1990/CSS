(function () {
  "use strict";

  var MOBILE_QUERY = "(max-width: 1024px)";
  var GAME_URL_PATTERN = /(?:\/(?:game|games|play)(?:\/|$)|\/casino\/[^/?#]+|[?&#](?:gameId|gameUrl|providerGameId|launch|realGame|demoGame|game|play)=|[?&#](?:m|t)=game\b)/i;
  var GAME_FRAME_PATTERN = /(game|launch|casino|slot|spribe|aviator|evolution|pragmatic|softswiss|betconstruct|playtech|player)/i;
  var GAME_SHELL_SELECTOR = [
    "#game-dialog-overlay",
    "[id*='game-dialog']",
    "[id*='gameDialog']",
    "[class*='game-dialog']",
    "[class*='gameDialog']",
    "[class*='game-iframe']",
    "[class*='game-container']",
    "[class*='game-player']",
    "[data-mj='game-dialog']",
    "[data-mj='game-view']",
    "[data-mj='game-page']",
    "[class*='app-ltr-mhyosn']",
    "[class*='app-ltr-15v05ez'] iframe"
  ].join(",");
  var scheduled = false;
  var observer = null;

  function isMobile() {
    if (window.matchMedia) {
      return window.matchMedia(MOBILE_QUERY).matches;
    }

    return window.innerWidth <= 1024;
  }

  function hasGameUrl() {
    return GAME_URL_PATTERN.test(
      window.location.pathname + window.location.search + window.location.hash
    );
  }

  function isGameIframe(iframe) {
    var src = (iframe.getAttribute("src") || "").trim();
    var id = iframe.getAttribute("id") || "";
    var name = iframe.getAttribute("name") || "";
    var className = iframe.getAttribute("class") || "";
    var title = iframe.getAttribute("title") || "";
    var ariaLabel = iframe.getAttribute("aria-label") || "";
    var haystack = [src, id, name, className, title, ariaLabel].join(" ");

    if (!src || /^about:blank$/i.test(src) || /^chrome-extension:/i.test(src)) {
      return GAME_FRAME_PATTERN.test([id, name, className, title, ariaLabel].join(" "));
    }

    return GAME_FRAME_PATTERN.test(haystack);
  }

  function hasGameIframe() {
    return Array.prototype.some.call(document.querySelectorAll("iframe"), isGameIframe);
  }

  function hasGameShell() {
    try {
      return Boolean(document.querySelector(GAME_SHELL_SELECTOR));
    } catch (error) {
      return false;
    }
  }

  function shouldHideBottomNav() {
    return isMobile() && (hasGameUrl() || hasGameIframe() || hasGameShell());
  }

  function setPageState(active) {
    document.documentElement.classList.toggle("betfaya-game-open", active);

    if (document.body) {
      document.body.classList.toggle("betfaya-game-open", active);
    }
  }

  function hideNav(nav) {
    if (nav.getAttribute("data-betfaya-game-hidden") === "true") {
      return;
    }

    nav.setAttribute("data-betfaya-game-hidden", "true");
    nav.style.setProperty("display", "none", "important");
    nav.style.setProperty("visibility", "hidden", "important");
    nav.style.setProperty("opacity", "0", "important");
    nav.style.setProperty("pointer-events", "none", "important");
    nav.style.setProperty("height", "0", "important");
    nav.style.setProperty("min-height", "0", "important");
    nav.style.setProperty("max-height", "0", "important");
    nav.style.setProperty("margin", "0", "important");
    nav.style.setProperty("padding", "0", "important");
    nav.style.setProperty("overflow", "hidden", "important");
  }

  function showNav(nav) {
    if (nav.getAttribute("data-betfaya-game-hidden") !== "true") {
      return;
    }

    nav.removeAttribute("data-betfaya-game-hidden");
    [
      "display",
      "visibility",
      "opacity",
      "pointer-events",
      "height",
      "min-height",
      "max-height",
      "margin",
      "padding",
      "overflow"
    ].forEach(function (property) {
      nav.style.removeProperty(property);
    });
  }

  function apply() {
    var active = shouldHideBottomNav();
    var navs = document.querySelectorAll('[data-mj="bottom-nav"]');

    scheduled = false;
    setPageState(active);

    Array.prototype.forEach.call(navs, function (nav) {
      if (active) {
        hideNav(nav);
      } else {
        showNav(nav);
      }
    });
  }

  function schedule() {
    if (scheduled) {
      return;
    }

    scheduled = true;
    window.requestAnimationFrame(apply);
  }

  function patchHistoryMethod(method) {
    var original = window.history && window.history[method];

    if (!original || original.__betfayaGameNavPatched) {
      return;
    }

    window.history[method] = function () {
      var result = original.apply(this, arguments);
      schedule();
      return result;
    };

    window.history[method].__betfayaGameNavPatched = true;
  }

  function start() {
    schedule();
    patchHistoryMethod("pushState");
    patchHistoryMethod("replaceState");

    window.addEventListener("popstate", schedule);
    window.addEventListener("hashchange", schedule);
    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);

    if (observer) {
      observer.disconnect();
    }

    observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style", "src", "href", "data-mj"]
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
