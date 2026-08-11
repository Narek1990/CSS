(function () {
  "use strict";

  var HIGH_SCORES_PAGE_ATTR = "data-myluck-highscores-page";
  var HIGH_SCORES_HIDDEN_ATTR = "data-myluck-highscores-hidden";
  var HIGH_SCORES_EVENTS_ATTR = "data-myluck-highscores-events";
  var HIGH_SCORES_SIGNATURE_ATTR = "data-myluck-highscores-signature";
  var HOME_BANNER_READY_ATTR = "data-myluck-home-banner-ready";
  var WHEEL_READY_ATTR = "data-myluck-wheel-modal-ready";
  var WHEEL_CHROME_ATTR = "data-myluck-wheel-modal-chrome";
  var WHEEL_PREVIOUS_PATH_KEY = "myluck-wheel-previous-path";
  var WHEEL_IFRAME_PARAM = "myluckWheelFrame";
  var WHEEL_IFRAME_NAME = "myluck-wheel-frame";
  var WHEEL_IFRAME_MODAL_ATTR = "data-myluck-wheel-iframe-modal";
  var WHEEL_IFRAME_SRC_ATTR = "data-myluck-wheel-iframe-src";
  var WHEEL_ROUTE_MODAL_ATTR = "data-myluck-wheel-route-modal";
  var WHEEL_ROUTE_CLOSE_ATTR = "data-myluck-wheel-route-close";
  var scriptSrc =
    (document.currentScript && document.currentScript.src) ||
    "https://cdn.jsdelivr.net/gh/Narek1990/CSS@refs/heads/main/myluck/script.js";
  var ASSET_BASE_URL = scriptSrc.replace(/\/script\.js(?:\?.*)?$/, "/");
  var HOME_BANNER_SRC = ASSET_BASE_URL + "assets/home-banner.gif";

  var highScoresHistoryHooked = false;
  var routeHistoryHooked = false;
  var wheelEventsHooked = false;
  var wheelLinkEventsHooked = false;
  var wheelModalOpenedInPlace = false;
  var wheelIframeSrcOverride = "";
  var highScoresState = {
    tab: "winners",
    period: "all",
    query: "",
    page: 1,
    pageSize: 10
  };

  var HIGH_SCORES_TABS = [
    { key: "winners", label: "Biggest Winners", column: "Profit" },
    { key: "losers", label: "Biggest Losers", column: "Loss" },
    { key: "wagers", label: "Top Wagers", column: "Wagered" },
    { key: "wins", label: "Biggest Wins", column: "Win" },
    { key: "losses", label: "Biggest Losses", column: "Loss" },
    { key: "luckiest", label: "Luckiest Wins", column: "Multiplier" }
  ];

  var HIGH_SCORES_PERIODS = [
    { key: "all", label: "All Time" },
    { key: "month", label: "Last Month" },
    { key: "week", label: "Last Week" },
    { key: "day", label: "Last Day" }
  ];

  var HIGH_SCORES_ROWS_BY_PERIOD = {
    all: [
      {
        player: "Sharik",
        winners: "$12,341,874.77",
        losers: "-$921,338.10",
        wagers: "$82,494,771.21",
        wins: "$4,184,910.66",
        losses: "-$614,221.08",
        luckiest: "9,421x"
      },
      {
        player: "PrayingMantis",
        winners: "$11,460,127.74",
        losers: "-$882,711.45",
        wagers: "$76,928,450.90",
        wins: "$3,992,018.43",
        losses: "-$573,109.84",
        luckiest: "8,732x"
      },
      {
        player: "signature",
        winners: "$7,683,143.74",
        losers: "-$744,190.26",
        wagers: "$59,334,882.16",
        wins: "$3,147,611.82",
        losses: "-$491,200.77",
        luckiest: "7,610x"
      },
      {
        player: "ggg1",
        winners: "$4,427,055.41",
        losers: "-$612,484.31",
        wagers: "$48,041,773.55",
        wins: "$2,713,594.04",
        losses: "-$426,889.92",
        luckiest: "6,986x"
      },
      {
        player: "punkism",
        winners: "$3,552,268.15",
        losers: "-$530,871.76",
        wagers: "$42,189,090.64",
        wins: "$2,139,884.55",
        losses: "-$389,714.61",
        luckiest: "6,540x"
      },
      {
        player: "Duteren111",
        winners: "$2,565,356.31",
        losers: "-$492,374.88",
        wagers: "$39,021,357.48",
        wins: "$1,884,090.13",
        losses: "-$351,278.10",
        luckiest: "6,191x"
      },
      {
        player: "manto3",
        winners: "$2,297,569.55",
        losers: "-$446,500.12",
        wagers: "$34,782,030.73",
        wins: "$1,637,112.05",
        losses: "-$302,871.66",
        luckiest: "5,780x"
      },
      {
        player: "FloatBet",
        winners: "$2,201,181.38",
        losers: "-$401,920.89",
        wagers: "$31,654,908.44",
        wins: "$1,502,401.19",
        losses: "-$276,440.02",
        luckiest: "5,302x"
      },
      {
        player: "darcoking",
        winners: "$2,124,699.83",
        losers: "-$365,211.08",
        wagers: "$29,870,441.19",
        wins: "$1,341,994.29",
        losses: "-$244,013.55",
        luckiest: "4,980x"
      },
      {
        player: "kidcudifan",
        winners: "$1,919,201.85",
        losers: "-$331,487.44",
        wagers: "$25,940,820.73",
        wins: "$1,190,001.44",
        losses: "-$210,904.70",
        luckiest: "4,612x"
      }
    ],
    month: [
      {
        player: "PrayingMantis",
        winners: "$1,284,917.22",
        losers: "-$211,840.50",
        wagers: "$9,812,550.33",
        wins: "$718,406.11",
        losses: "-$142,006.88",
        luckiest: "3,412x"
      },
      {
        player: "signature",
        winners: "$1,044,330.90",
        losers: "-$190,227.30",
        wagers: "$8,663,907.44",
        wins: "$602,771.19",
        losses: "-$119,424.21",
        luckiest: "3,108x"
      },
      {
        player: "Sharik",
        winners: "$934,772.18",
        losers: "-$177,619.70",
        wagers: "$8,110,420.54",
        wins: "$541,208.67",
        losses: "-$104,517.40",
        luckiest: "2,944x"
      },
      {
        player: "FloatBet",
        winners: "$820,147.64",
        losers: "-$151,442.12",
        wagers: "$7,602,040.31",
        wins: "$498,611.42",
        losses: "-$96,224.10",
        luckiest: "2,708x"
      },
      {
        player: "ggg1",
        winners: "$716,904.21",
        losers: "-$136,070.55",
        wagers: "$6,998,104.90",
        wins: "$421,609.73",
        losses: "-$88,151.64",
        luckiest: "2,384x"
      },
      {
        player: "manto3",
        winners: "$608,552.74",
        losers: "-$112,884.01",
        wagers: "$5,822,701.62",
        wins: "$369,511.20",
        losses: "-$73,808.47",
        luckiest: "2,101x"
      },
      {
        player: "punkism",
        winners: "$501,331.40",
        losers: "-$98,115.34",
        wagers: "$4,915,320.88",
        wins: "$310,005.78",
        losses: "-$61,007.20",
        luckiest: "1,933x"
      },
      {
        player: "darcoking",
        winners: "$445,221.35",
        losers: "-$82,490.92",
        wagers: "$4,201,774.12",
        wins: "$284,991.66",
        losses: "-$54,629.71",
        luckiest: "1,740x"
      },
      {
        player: "kidcudifan",
        winners: "$392,188.76",
        losers: "-$76,006.18",
        wagers: "$3,747,622.09",
        wins: "$242,881.55",
        losses: "-$48,190.44",
        luckiest: "1,508x"
      },
      {
        player: "Duteren111",
        winners: "$319,448.29",
        losers: "-$64,704.81",
        wagers: "$3,181,220.10",
        wins: "$198,111.04",
        losses: "-$39,907.38",
        luckiest: "1,366x"
      }
    ],
    week: [
      {
        player: "Sharik",
        winners: "$281,640.91",
        losers: "-$52,844.20",
        wagers: "$2,104,808.90",
        wins: "$162,421.10",
        losses: "-$31,604.91",
        luckiest: "1,184x"
      },
      {
        player: "FloatBet",
        winners: "$244,980.33",
        losers: "-$48,120.77",
        wagers: "$1,920,507.64",
        wins: "$140,901.25",
        losses: "-$28,445.88",
        luckiest: "1,042x"
      },
      {
        player: "signature",
        winners: "$218,410.55",
        losers: "-$41,900.42",
        wagers: "$1,774,119.08",
        wins: "$122,706.47",
        losses: "-$24,901.40",
        luckiest: "984x"
      },
      {
        player: "manto3",
        winners: "$196,775.10",
        losers: "-$35,612.64",
        wagers: "$1,608,504.91",
        wins: "$110,420.88",
        losses: "-$21,604.16",
        luckiest: "871x"
      },
      {
        player: "PrayingMantis",
        winners: "$176,330.18",
        losers: "-$30,201.80",
        wagers: "$1,405,882.33",
        wins: "$96,118.75",
        losses: "-$18,991.10",
        luckiest: "742x"
      },
      {
        player: "punkism",
        winners: "$142,907.52",
        losers: "-$27,990.11",
        wagers: "$1,104,551.72",
        wins: "$80,000.81",
        losses: "-$15,604.45",
        luckiest: "691x"
      },
      {
        player: "ggg1",
        winners: "$117,604.44",
        losers: "-$24,005.90",
        wagers: "$982,744.67",
        wins: "$70,441.03",
        losses: "-$12,887.04",
        luckiest: "618x"
      },
      {
        player: "Duteren111",
        winners: "$98,211.36",
        losers: "-$20,781.35",
        wagers: "$801,234.19",
        wins: "$61,449.18",
        losses: "-$10,441.70",
        luckiest: "542x"
      },
      {
        player: "darcoking",
        winners: "$82,770.50",
        losers: "-$18,605.40",
        wagers: "$690,820.54",
        wins: "$52,178.44",
        losses: "-$8,903.22",
        luckiest: "496x"
      },
      {
        player: "kidcudifan",
        winners: "$66,480.74",
        losers: "-$15,244.09",
        wagers: "$544,018.80",
        wins: "$41,106.72",
        losses: "-$7,018.16",
        luckiest: "420x"
      }
    ],
    day: [
      {
        player: "FloatBet",
        winners: "$41,288.44",
        losers: "-$8,901.55",
        wagers: "$284,902.70",
        wins: "$24,680.11",
        losses: "-$5,209.33",
        luckiest: "284x"
      },
      {
        player: "Sharik",
        winners: "$36,884.20",
        losers: "-$7,448.12",
        wagers: "$250,417.66",
        wins: "$21,904.60",
        losses: "-$4,817.02",
        luckiest: "255x"
      },
      {
        player: "manto3",
        winners: "$31,007.18",
        losers: "-$6,882.91",
        wagers: "$219,008.44",
        wins: "$18,610.42",
        losses: "-$4,114.92",
        luckiest: "231x"
      },
      {
        player: "signature",
        winners: "$28,771.40",
        losers: "-$6,004.23",
        wagers: "$201,667.14",
        wins: "$16,882.05",
        losses: "-$3,774.61",
        luckiest: "209x"
      },
      {
        player: "PrayingMantis",
        winners: "$24,180.11",
        losers: "-$5,422.44",
        wagers: "$178,991.20",
        wins: "$14,220.90",
        losses: "-$3,208.75",
        luckiest: "181x"
      },
      {
        player: "ggg1",
        winners: "$19,775.93",
        losers: "-$4,810.18",
        wagers: "$151,440.76",
        wins: "$12,014.33",
        losses: "-$2,840.18",
        luckiest: "164x"
      },
      {
        player: "punkism",
        winners: "$16,140.82",
        losers: "-$4,009.62",
        wagers: "$121,774.19",
        wins: "$9,660.14",
        losses: "-$2,171.50",
        luckiest: "142x"
      },
      {
        player: "kidcudifan",
        winners: "$12,907.35",
        losers: "-$3,405.88",
        wagers: "$98,230.40",
        wins: "$7,811.55",
        losses: "-$1,902.36",
        luckiest: "118x"
      },
      {
        player: "Duteren111",
        winners: "$10,480.09",
        losers: "-$2,901.42",
        wagers: "$82,640.90",
        wins: "$6,604.11",
        losses: "-$1,622.84",
        luckiest: "96x"
      },
      {
        player: "darcoking",
        winners: "$8,991.62",
        losers: "-$2,442.70",
        wagers: "$70,114.50",
        wins: "$5,211.80",
        losses: "-$1,388.10",
        luckiest: "82x"
      }
    ]
  };

  var HIGH_SCORES_RANKS_BY_PERIOD = {
    all: {
      wagers: "#2",
      winners: "#1",
      losers: "Not Ranked",
      wins: "#2",
      losses: "#89",
      luckiest: "#6194"
    },
    month: {
      wagers: "#4",
      winners: "#3",
      losers: "#17",
      wins: "#3",
      losses: "#41",
      luckiest: "#944"
    },
    week: {
      wagers: "#1",
      winners: "#1",
      losers: "#8",
      wins: "#1",
      losses: "#22",
      luckiest: "#128"
    },
    day: {
      wagers: "#2",
      winners: "#2",
      losers: "#11",
      wins: "#2",
      losses: "#19",
      luckiest: "#64"
    }
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getActiveHighScoresTab() {
    return (
      HIGH_SCORES_TABS.filter(function (tab) {
        return tab.key === highScoresState.tab;
      })[0] || HIGH_SCORES_TABS[0]
    );
  }

  function replaceHomeBannerImages() {
    document
      .querySelectorAll(
        '[data-mj="widget-banner"] [data-mj="widget-banner-link"] img, [data-mj="widget-banner"] img[src*="ea665672-bd41-4e71-8a6a-6d4b346f3a0b"]'
      )
      .forEach(function (image) {
        if (!image || image.nodeType !== 1) {
          return;
        }

        if (
          image.getAttribute(HOME_BANNER_READY_ATTR) === "true" &&
          image.getAttribute("src") === HOME_BANNER_SRC
        ) {
          return;
        }

        image.setAttribute(HOME_BANNER_READY_ATTR, "true");
        image.setAttribute("src", HOME_BANNER_SRC);
        image.setAttribute("alt", image.getAttribute("alt") || "home");
        image.setAttribute("loading", "eager");
        image.setAttribute("decoding", "async");
        image.setAttribute("fetchpriority", "high");
      });
  }

  function isHighScoresContext() {
    var path = (window.location.pathname || "").toLowerCase();

    if (path.indexOf("high-scores") !== -1) {
      return true;
    }

    return !!document.querySelector(
      'a[href*="high-scores"].active-link, a[href*="high-scores"][aria-current="page"]'
    );
  }

  function getPageContent() {
    return document.querySelector('main[data-mj="page-content"]');
  }

  function isWheelContext() {
    var path = (window.location.pathname || "").toLowerCase();

    if (path.indexOf("/wheel") !== -1) {
      return true;
    }

    return !!document.querySelector(
      'a[href*="/wheel"].active-link, a[href*="/wheel"][aria-current="page"]'
    );
  }

  function isWheelFrameContext() {
    if (window.name === WHEEL_IFRAME_NAME) {
      return true;
    }

    try {
      return (
        new URLSearchParams(window.location.search || "").get(WHEEL_IFRAME_PARAM) ===
        "1"
      );
    } catch (error) {
      return (window.location.search || "").indexOf(WHEEL_IFRAME_PARAM + "=1") !== -1;
    }
  }

  function setWheelFrameMode(active) {
    if (document.documentElement) {
      document.documentElement.classList.toggle("myluck-wheel-frame-mode", !!active);
    }

    if (document.body) {
      document.body.classList.toggle("myluck-wheel-frame-mode", !!active);
    }
  }

  function rememberNonWheelPath() {
    var path = window.location.pathname || "/";
    var value;

    if (path.toLowerCase().indexOf("/wheel") !== -1) {
      return;
    }

    value = path + (window.location.search || "") + (window.location.hash || "");

    try {
      window.sessionStorage.setItem(WHEEL_PREVIOUS_PATH_KEY, value);
    } catch (error) {
      /* noop */
    }
  }

  function getWheelReturnPath() {
    var saved = "";
    var path = window.location.pathname || "/";
    var parts = path.split("/").filter(Boolean);
    var locale = parts[0] || "en";

    try {
      saved = window.sessionStorage.getItem(WHEEL_PREVIOUS_PATH_KEY) || "";
    } catch (error) {
      saved = "";
    }

    if (saved && saved.charAt(0) === "/" && saved.toLowerCase().indexOf("/wheel") === -1) {
      return saved;
    }

    return "/" + locale + "/";
  }

  function getCloseIconMarkup() {
    return (
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="M6.4 5 5 6.4l5.6 5.6L5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6L19 6.4 17.6 5 12 10.6 6.4 5Z" fill="currentColor"></path>' +
      "</svg>"
    );
  }

  function getWheelIframeSrc(sourceHref) {
    var url;
    var source = sourceHref || wheelIframeSrcOverride || window.location.href;

    try {
      url = new URL(source, window.location.origin);
      url.searchParams.delete(WHEEL_IFRAME_PARAM);
      return url.href;
    } catch (error) {
      return (window.location.pathname || "/en/wheel") + (window.location.hash || "");
    }
  }

  function ensureWheelIframeModal() {
    var modal = document.querySelector("[" + WHEEL_IFRAME_MODAL_ATTR + ']');
    var iframe;
    var src = getWheelIframeSrc();

    if (!document.body) {
      return;
    }

    if (!modal) {
      modal = document.createElement("div");
      modal.className = "myluck-wheel-iframe-modal";
      modal.setAttribute(WHEEL_IFRAME_MODAL_ATTR, "true");
      modal.innerHTML =
        '<div class="myluck-wheel-iframe-dialog" role="dialog" aria-modal="true" aria-label="MyLuck Wheel">' +
        '<button type="button" class="myluck-wheel-modal-close" aria-label="Close wheel">' +
        getCloseIconMarkup() +
        "</button>" +
        '<iframe class="myluck-wheel-iframe" name="' +
        WHEEL_IFRAME_NAME +
        '" title="MyLuck Wheel" loading="eager" allow="autoplay; fullscreen; clipboard-write"></iframe>' +
        "</div>";
      document.body.appendChild(modal);
    }

    iframe = modal.querySelector(".myluck-wheel-iframe");

    if (iframe && iframe.getAttribute(WHEEL_IFRAME_SRC_ATTR) !== src) {
      iframe.setAttribute(WHEEL_IFRAME_SRC_ATTR, src);
      iframe.src = src;
    }
  }

  function closeWheelModal() {
    window.location.href = getWheelReturnPath();
  }

  function ensureWheelRouteModalChrome() {
    var closeButton = document.querySelector("[" + WHEEL_ROUTE_CLOSE_ATTR + ']');

    if (!document.body || closeButton) {
      return;
    }

    closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "myluck-wheel-route-modal-close";
    closeButton.setAttribute(WHEEL_ROUTE_CLOSE_ATTR, "true");
    closeButton.setAttribute("aria-label", "Close wheel");
    closeButton.innerHTML = getCloseIconMarkup();
    document.body.appendChild(closeButton);
  }

  function openWheelModalFromLink(href) {
    rememberNonWheelPath();
    wheelModalOpenedInPlace = true;
    wheelIframeSrcOverride = getWheelIframeSrc(href);

    if (document.documentElement) {
      document.documentElement.classList.add("myluck-wheel-iframe-active");
    }

    if (document.body) {
      document.body.classList.add("myluck-wheel-iframe-active");
    }

    ensureWheelIframeModal();
    hookWheelModalEvents();
  }

  function hookWheelLinkEvents() {
    if (wheelLinkEventsHooked) {
      return;
    }

    wheelLinkEventsHooked = true;

    document.addEventListener(
      "click",
      function (event) {
        var target;
        var link;
        var href;

        if (isWheelFrameContext()) {
          return;
        }

        target =
          event.target && typeof event.target.closest === "function"
            ? event.target
            : null;
        link = target && target.closest('a[href*="/wheel"]');

        if (!link || link.closest("[" + WHEEL_IFRAME_MODAL_ATTR + ']')) {
          return;
        }

        href = link.getAttribute("href") || "";

        if (href.indexOf("/wheel") === -1) {
          return;
        }

        rememberNonWheelPath();
      },
      true
    );
  }

  function hookWheelModalEvents() {
    if (wheelEventsHooked) {
      return;
    }

    wheelEventsHooked = true;

    document.addEventListener("click", function (event) {
      var target =
        event.target && typeof event.target.closest === "function"
          ? event.target
          : null;
      var closeButton = target && target.closest(".myluck-wheel-modal-close");
      var routeCloseButton =
        target && target.closest("[" + WHEEL_ROUTE_CLOSE_ATTR + "]");

      if (closeButton || routeCloseButton) {
        event.preventDefault();
        closeWheelModal();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (
        event.key === "Escape" &&
        document.body &&
        (document.body.classList.contains("myluck-wheel-modal-active") ||
          document.body.classList.contains("myluck-wheel-iframe-active") ||
          document.body.classList.contains("myluck-wheel-route-modal-active"))
      ) {
        closeWheelModal();
      }
    });
  }

  function restoreWheelModal() {
    var wrappers = document.querySelectorAll("[" + WHEEL_READY_ATTR + ']');
    var iframeModal = document.querySelector("[" + WHEEL_IFRAME_MODAL_ATTR + ']');
    var routeCloseButton = document.querySelector("[" + WHEEL_ROUTE_CLOSE_ATTR + ']');
    var routeModal = document.querySelector("[" + WHEEL_ROUTE_MODAL_ATTR + ']');

    wheelModalOpenedInPlace = false;
    wheelIframeSrcOverride = "";

    if (document.documentElement) {
      document.documentElement.classList.remove("myluck-wheel-modal-active");
      document.documentElement.classList.remove("myluck-wheel-iframe-active");
      document.documentElement.classList.remove("myluck-wheel-route-modal-active");
    }

    if (document.body) {
      document.body.classList.remove("myluck-wheel-modal-active");
      document.body.classList.remove("myluck-wheel-iframe-active");
      document.body.classList.remove("myluck-wheel-route-modal-active");
    }

    Array.prototype.forEach.call(wrappers, function (wrapper) {
      wrapper.removeAttribute(WHEEL_READY_ATTR);
    });

    if (iframeModal && iframeModal.parentNode) {
      iframeModal.parentNode.removeChild(iframeModal);
    }

    if (routeCloseButton && routeCloseButton.parentNode) {
      routeCloseButton.parentNode.removeChild(routeCloseButton);
    }

    if (routeModal) {
      routeModal.removeAttribute(WHEEL_ROUTE_MODAL_ATTR);
    }
  }

  function removeLegacyWheelIframeModal() {
    var iframeModal = document.querySelector("[" + WHEEL_IFRAME_MODAL_ATTR + ']');

    if (document.documentElement) {
      document.documentElement.classList.remove("myluck-wheel-iframe-active");
      document.documentElement.classList.remove("myluck-wheel-modal-active");
    }

    if (document.body) {
      document.body.classList.remove("myluck-wheel-iframe-active");
      document.body.classList.remove("myluck-wheel-modal-active");
    }

    if (iframeModal && iframeModal.parentNode) {
      iframeModal.parentNode.removeChild(iframeModal);
    }
  }

  function renderWheelModal() {
    var main;

    if (isWheelFrameContext()) {
      restoreWheelModal();
      setWheelFrameMode(true);
      return;
    }

    setWheelFrameMode(false);

    if (!isWheelContext()) {
      rememberNonWheelPath();
      restoreWheelModal();
      return;
    }

    if (!document.body) {
      return;
    }

    removeLegacyWheelIframeModal();
    main = getPageContent();
    document.documentElement.classList.add("myluck-wheel-route-modal-active");
    document.body.classList.add("myluck-wheel-route-modal-active");
    if (main) {
      main.setAttribute(WHEEL_ROUTE_MODAL_ATTR, "true");
    }
    ensureWheelRouteModalChrome();
    hookWheelModalEvents();
  }

  function getCurrentHighScoresRows() {
    return (
      HIGH_SCORES_ROWS_BY_PERIOD[highScoresState.period] ||
      HIGH_SCORES_ROWS_BY_PERIOD.all
    );
  }

  function getCurrentHighScoresRanks() {
    return (
      HIGH_SCORES_RANKS_BY_PERIOD[highScoresState.period] ||
      HIGH_SCORES_RANKS_BY_PERIOD.all
    );
  }

  function getHighScoresContainer(main) {
    var children = main ? main.children : [];
    var index;

    for (index = 0; index < children.length; index += 1) {
      if (children[index].getAttribute(HIGH_SCORES_PAGE_ATTR) === "true") {
        return children[index];
      }
    }

    return null;
  }

  function ensureHighScoresContainer(main) {
    var container = getHighScoresContainer(main);

    if (container) {
      return container;
    }

    container = document.createElement("div");
    container.setAttribute(HIGH_SCORES_PAGE_ATTR, "true");
    container.className = "myluck-highscores-page";
    main.insertBefore(container, main.firstChild);

    return container;
  }

  function setHighScoresShellVisibility(main, isActive, container) {
    Array.prototype.forEach.call(main.children, function (child) {
      if (child === container) {
        child.hidden = !isActive;
        return;
      }

      if (isActive) {
        child.setAttribute(HIGH_SCORES_HIDDEN_ATTR, "true");
      } else {
        child.removeAttribute(HIGH_SCORES_HIDDEN_ATTR);
      }
    });
  }

  function getHighScoresRows() {
    var query = highScoresState.query.trim().toLowerCase();
    var rows = getCurrentHighScoresRows();

    if (!query) {
      return rows;
    }

    return rows.filter(function (row) {
      return row.player.toLowerCase().indexOf(query) !== -1;
    });
  }

  function getSearchIconMarkup() {
    return (
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l4.25 4.25a1.05 1.05 0 0 0 1.49-1.49L15.5 14Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z" fill="currentColor"></path>' +
      "</svg>"
    );
  }

  function getTrophyIconMarkup() {
    return (
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="M7 4h10v3.2c0 3.2-1.9 5.8-4.5 6.4V16h3.25a1.25 1.25 0 0 1 0 2.5h-7.5a1.25 1.25 0 0 1 0-2.5h3.25v-2.4C7.9 13 6 10.4 6 7.2V7H4.5A2.5 2.5 0 0 0 7 9.5v2A4.5 4.5 0 0 1 2.5 7V5H6V4h1Zm11 1h3.5v2A4.5 4.5 0 0 1 17 11.5v-2A2.5 2.5 0 0 0 19.5 7H18V5Z" fill="currentColor"></path>' +
      "</svg>"
    );
  }

  function getHighScoresTabsMarkup() {
    return HIGH_SCORES_TABS.map(function (tab) {
      var isActive = tab.key === highScoresState.tab;

      return (
        '<button type="button" class="myluck-highscores-tab' +
        (isActive ? " is-active" : "") +
        '" data-myluck-hs-tab="' +
        escapeHtml(tab.key) +
        '">' +
        escapeHtml(tab.label) +
        "</button>"
      );
    }).join("");
  }

  function getHighScoresPeriodsMarkup() {
    return HIGH_SCORES_PERIODS.map(function (period) {
      var isActive = period.key === highScoresState.period;

      return (
        '<button type="button" class="myluck-highscores-period' +
        (isActive ? " is-active" : "") +
        '" data-myluck-hs-period="' +
        escapeHtml(period.key) +
        '">' +
        escapeHtml(period.label) +
        "</button>"
      );
    }).join("");
  }

  function getHighScoresTableMarkup() {
    var activeTab = getActiveHighScoresTab();
    var rows = getHighScoresRows();
    var valueClass =
      activeTab.key === "losers" || activeTab.key === "losses"
        ? " is-loss"
        : activeTab.key === "luckiest"
          ? " is-lucky"
          : " is-profit";

    if (!rows.length) {
      return (
        '<div class="myluck-highscores-empty">No players found for this search.</div>'
      );
    }

    return (
      '<div class="myluck-highscores-table">' +
      '<div class="myluck-highscores-row myluck-highscores-row--head">' +
      '<span>#</span><span>Player</span><span>' +
      escapeHtml(activeTab.column) +
      "</span></div>" +
      rows
        .slice(0, highScoresState.pageSize)
        .map(function (row, index) {
          return (
            '<div class="myluck-highscores-row">' +
            '<span>' +
            String(index + 1).padStart(2, "0") +
            "</span>" +
            "<span>" +
            escapeHtml(row.player) +
            "</span>" +
            '<span class="myluck-highscores-value' +
            valueClass +
            '">' +
            escapeHtml(row[activeTab.key]) +
            "</span>" +
            "</div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function getHighScoresPaginationMarkup() {
    return (
      '<div class="myluck-highscores-pagination" aria-label="Leaderboard pagination">' +
      '<button type="button">First</button>' +
      '<button type="button" class="is-active">1</button>' +
      '<button type="button">2</button>' +
      '<button type="button">3</button>' +
      '<button type="button">4</button>' +
      '<button type="button">5</button>' +
      '<button type="button">Last</button>' +
      '<button type="button" class="myluck-highscores-page-size">10 <span>⌄</span></button>' +
      "</div>"
    );
  }

  function getHighScoresCardMarkup() {
    var ranks = getCurrentHighScoresRanks();

    return (
      '<aside class="myluck-highscores-card" aria-label="Selected player rankings">' +
      '<div class="myluck-highscores-player">' +
      '<span class="myluck-highscores-trophy">' +
      getTrophyIconMarkup() +
      "</span>" +
      '<strong>Sharik</strong>' +
      "</div>" +
      '<dl class="myluck-highscores-stats">' +
      '<div><dt>Top Wagers</dt><dd>' +
      escapeHtml(ranks.wagers) +
      "</dd></div>" +
      '<div><dt>Biggest Winners</dt><dd>' +
      escapeHtml(ranks.winners) +
      "</dd></div>" +
      '<div><dt>Biggest Losers</dt><dd>' +
      escapeHtml(ranks.losers) +
      "</dd></div>" +
      '<div><dt>Biggest Wins</dt><dd>' +
      escapeHtml(ranks.wins) +
      "</dd></div>" +
      '<div><dt>Biggest Losses</dt><dd>' +
      escapeHtml(ranks.losses) +
      "</dd></div>" +
      '<div><dt>Luckiest Wins</dt><dd>' +
      escapeHtml(ranks.luckiest) +
      "</dd></div>" +
      "</dl>" +
      "</aside>"
    );
  }

  function getHighScoresMarkup() {
    return (
      '<section class="myluck-highscores" aria-label="High Scores">' +
      '<div class="myluck-highscores-inner">' +
      '<div class="myluck-highscores-titlebar">' +
      "<h1>High Scores</h1>" +
      '<div class="myluck-highscores-periods">' +
      getHighScoresPeriodsMarkup() +
      "</div>" +
      "</div>" +
      '<div class="myluck-highscores-controls">' +
      '<div class="myluck-highscores-tabs">' +
      getHighScoresTabsMarkup() +
      "</div>" +
      '<label class="myluck-highscores-search">' +
      '<span>' +
      getSearchIconMarkup() +
      "</span>" +
      '<input type="search" placeholder="Search users..." value="' +
      escapeHtml(highScoresState.query) +
      '" data-myluck-hs-search autocomplete="off">' +
      "</label>" +
      "</div>" +
      '<div class="myluck-highscores-main">' +
      '<div class="myluck-highscores-left">' +
      getHighScoresTableMarkup() +
      getHighScoresPaginationMarkup() +
      "</div>" +
      getHighScoresCardMarkup() +
      "</div>" +
      "</div>" +
      "</section>"
    );
  }

  function attachHighScoresEvents(container) {
    if (container.getAttribute(HIGH_SCORES_EVENTS_ATTR) === "true") {
      return;
    }

    container.setAttribute(HIGH_SCORES_EVENTS_ATTR, "true");

    container.addEventListener("click", function (event) {
      var target =
        event.target && typeof event.target.closest === "function"
          ? event.target
          : null;
      var tab = target && target.closest("[data-myluck-hs-tab]");
      var period = target && target.closest("[data-myluck-hs-period]");

      if (tab) {
        highScoresState.tab = tab.getAttribute("data-myluck-hs-tab");
        highScoresState.page = 1;
        renderHighScoresPage(false);
        return;
      }

      if (period) {
        highScoresState.period = period.getAttribute("data-myluck-hs-period");
        highScoresState.page = 1;
        renderHighScoresPage(false);
      }
    });

    container.addEventListener("input", function (event) {
      if (
        !event.target ||
        typeof event.target.matches !== "function" ||
        !event.target.matches("[data-myluck-hs-search]")
      ) {
        return;
      }

      highScoresState.query = event.target.value;
      highScoresState.page = 1;
      renderHighScoresPage(true);
    });
  }

  function restoreHighScoresPage(main) {
    var container = main && getHighScoresContainer(main);

    document.body.classList.remove("myluck-highscores-active");

    if (!main) {
      return;
    }

    Array.prototype.forEach.call(main.children, function (child) {
      child.removeAttribute(HIGH_SCORES_HIDDEN_ATTR);
    });

    if (container) {
      container.hidden = true;
    }
  }

  function renderHighScoresPage(keepSearchFocus) {
    var main = getPageContent();
    var container;
    var signature;
    var search;

    if (!isHighScoresContext()) {
      restoreHighScoresPage(main);
      return;
    }

    if (!main) {
      return;
    }

    document.body.classList.add("myluck-highscores-active");
    container = ensureHighScoresContainer(main);
    setHighScoresShellVisibility(main, true, container);
    attachHighScoresEvents(container);

    signature = [
      highScoresState.tab,
      highScoresState.period,
      highScoresState.query,
      highScoresState.page,
      highScoresState.pageSize
    ].join("|");

    if (container.getAttribute(HIGH_SCORES_SIGNATURE_ATTR) !== signature) {
      container.innerHTML = getHighScoresMarkup();
      container.setAttribute(HIGH_SCORES_SIGNATURE_ATTR, signature);
    }

    if (keepSearchFocus) {
      search = container.querySelector("[data-myluck-hs-search]");

      if (search) {
        search.focus();
        try {
          search.setSelectionRange(search.value.length, search.value.length);
        } catch (error) {
          /* noop */
        }
      }
    }
  }

  function hookRouteNavigation() {
    if (routeHistoryHooked) {
      return;
    }

    routeHistoryHooked = true;
    highScoresHistoryHooked = true;

    ["pushState", "replaceState"].forEach(function (method) {
      var original = window.history && window.history[method];

      if (typeof original !== "function") {
        return;
      }

      window.history[method] = function () {
        var result = original.apply(this, arguments);
        window.setTimeout(function () {
          runEnhancements();
        }, 0);
        return result;
      };
    });

    window.addEventListener("popstate", function () {
      window.setTimeout(function () {
        runEnhancements();
      }, 0);
    });
  }

  function runEnhancements() {
    replaceHomeBannerImages();
    renderHighScoresPage(false);
    renderWheelModal();
  }

  function start() {
    hookRouteNavigation();
    hookWheelLinkEvents();
    runEnhancements();

    var scheduled = false;
    var observer = new MutationObserver(function () {
      if (scheduled) {
        return;
      }

      scheduled = true;
      window.requestAnimationFrame(function () {
        scheduled = false;
        runEnhancements();
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
