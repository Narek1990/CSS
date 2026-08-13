(function () {
  "use strict";

  var SPORT_CLASS = "pixwinners-sport-launched";
  var MOBILE_QUERY = "(max-width: 1024px)";
  var observer = null;
  var scheduled = false;

  function isMobile() {
    return !window.matchMedia || window.matchMedia(MOBILE_QUERY).matches;
  }

  function isSportLaunched() {
    var path = (window.location.pathname || "").toLowerCase();

    return (
      isMobile() &&
      (
        !!document.querySelector("#sportsbook-wrapper, #firstSportbook") ||
        path.indexOf("/sports") !== -1 ||
        path.indexOf("/sport") !== -1
      )
    );
  }

  function updateSportClass() {
    scheduled = false;

    if (!document.body) {
      return;
    }

    document.body.classList.toggle(SPORT_CLASS, isSportLaunched());
  }

  function scheduleUpdate() {
    if (scheduled) {
      return;
    }

    scheduled = true;
    window.requestAnimationFrame(updateSportClass);
  }

  function hookHistoryMethod(methodName) {
    var original = window.history && window.history[methodName];

    if (typeof original !== "function" || original.__pixwinnersHooked) {
      return;
    }

    window.history[methodName] = function () {
      var result = original.apply(this, arguments);

      scheduleUpdate();
      setTimeout(scheduleUpdate, 120);

      return result;
    };

    window.history[methodName].__pixwinnersHooked = true;
  }

  function init() {
    hookHistoryMethod("pushState");
    hookHistoryMethod("replaceState");

    window.addEventListener("popstate", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    window.addEventListener("orientationchange", scheduleUpdate, { passive: true });

    if (!observer && document.documentElement) {
      observer = new MutationObserver(scheduleUpdate);
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    }

    scheduleUpdate();
    setTimeout(scheduleUpdate, 300);
    setTimeout(scheduleUpdate, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
