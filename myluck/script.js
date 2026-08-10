(function () {
  "use strict";

  var BUTTON_SELECTOR = '[data-mj="register-button"]';
  var READY_ATTR = "data-myluck-3d-register-ready";
  var OVERLAY_ATTR = "data-myluck-3d-enhancement";
  var HIGH_SCORES_PAGE_ATTR = "data-myluck-highscores-page";
  var HIGH_SCORES_HIDDEN_ATTR = "data-myluck-highscores-hidden";
  var HIGH_SCORES_EVENTS_ATTR = "data-myluck-highscores-events";
  var HIGH_SCORES_SIGNATURE_ATTR = "data-myluck-highscores-signature";

  var highScoresHistoryHooked = false;
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

  var HIGH_SCORES_ROWS = [
    {
      player: "jarik",
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
  ];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function createLetters(text) {
    return String(text)
      .split("")
      .map(function (letter, index) {
        return (
          '<span data-label="' +
          escapeHtml(letter) +
          '" style="--i:' +
          (index + 1) +
          '">' +
          escapeHtml(letter) +
          "</span>"
        );
      })
      .join("");
  }

  function getRegisterButtonMarkup() {
    return (
      '<span class="myluck-3d-overlay" ' +
      OVERLAY_ATTR +
      '="true" aria-hidden="true">' +
      '<span class="myluck-3d-bg"></span>' +
      '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 342 208" height="208" width="342" class="myluck-3d-splash" aria-hidden="true" focusable="false">' +
      '<path stroke-linecap="round" stroke-width="3" d="M54.1054 99.7837C54.1054 99.7837 40.0984 90.7874 26.6893 97.6362C13.2802 104.485 1.5 97.6362 1.5 97.6362"></path>' +
      '<path stroke-linecap="round" stroke-width="3" d="M285.273 99.7841C285.273 99.7841 299.28 90.7879 312.689 97.6367C326.098 104.486 340.105 95.4893 340.105 95.4893"></path>' +
      '<path stroke-linecap="round" stroke-width="3" stroke-opacity="0.3" d="M281.133 64.9917C281.133 64.9917 287.96 49.8089 302.934 48.2295C317.908 46.6501 319.712 36.5272 319.712 36.5272"></path>' +
      '<path stroke-linecap="round" stroke-width="3" stroke-opacity="0.3" d="M281.133 138.984C281.133 138.984 287.96 154.167 302.934 155.746C317.908 157.326 319.712 167.449 319.712 167.449"></path>' +
      '<path stroke-linecap="round" stroke-width="3" d="M230.578 57.4476C230.578 57.4476 225.785 41.5051 236.061 30.4998C246.337 19.4945 244.686 12.9998 244.686 12.9998"></path>' +
      '<path stroke-linecap="round" stroke-width="3" d="M230.578 150.528C230.578 150.528 225.785 166.471 236.061 177.476C246.337 188.481 244.686 194.976 244.686 194.976"></path>' +
      '<path stroke-linecap="round" stroke-width="3" stroke-opacity="0.3" d="M170.392 57.0278C170.392 57.0278 173.89 42.1322 169.571 29.54C165.252 16.9478 168.751 2.05227 168.751 2.05227"></path>' +
      '<path stroke-linecap="round" stroke-width="3" stroke-opacity="0.3" d="M170.392 150.948C170.392 150.948 173.89 165.844 169.571 178.436C165.252 191.028 168.751 205.924 168.751 205.924"></path>' +
      '<path stroke-linecap="round" stroke-width="3" d="M112.609 57.4476C112.609 57.4476 117.401 41.5051 107.125 30.4998C96.8492 19.4945 98.5 12.9998 98.5 12.9998"></path>' +
      '<path stroke-linecap="round" stroke-width="3" d="M112.609 150.528C112.609 150.528 117.401 166.471 107.125 177.476C96.8492 188.481 98.5 194.976 98.5 194.976"></path>' +
      '<path stroke-linecap="round" stroke-width="3" stroke-opacity="0.3" d="M62.2941 64.9917C62.2941 64.9917 55.4671 49.8089 40.4932 48.2295C25.5194 46.6501 23.7159 36.5272 23.7159 36.5272"></path>' +
      '<path stroke-linecap="round" stroke-width="3" stroke-opacity="0.3" d="M62.2941 145.984C62.2941 145.984 55.4671 161.167 40.4932 162.746C25.5194 164.326 23.7159 174.449 23.7159 174.449"></path>' +
      "</svg>" +
      '<span class="myluck-3d-wrap" data-myluck-3d-inner="true">' +
      '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 221 42" height="42" width="221" class="myluck-3d-path" aria-hidden="true" focusable="false">' +
      '<path stroke-linecap="round" stroke-width="3" d="M182.674 2H203C211.837 2 219 9.16344 219 18V24C219 32.8366 211.837 40 203 40H18C9.16345 40 2 32.8366 2 24V18C2 9.16344 9.16344 2 18 2H47.8855"></path>' +
      "</svg>" +
      '<span class="myluck-3d-outline" aria-hidden="true"></span>' +
      '<span class="myluck-3d-content">' +
      '<span class="myluck-3d-char myluck-3d-state-1">' +
      createLetters("JoinToday") +
      "</span>" +
      '<span class="myluck-3d-icon" aria-hidden="true"><span></span></span>' +
      '<span class="myluck-3d-char myluck-3d-state-2">' +
      createLetters("JoinNow") +
      "</span>" +
      "</span>" +
      "</span>" +
      "</span>"
    );
  }

  function createEnhancement() {
    var template = document.createElement("template");
    template.innerHTML = getRegisterButtonMarkup();
    return template.content.firstElementChild;
  }

  function enhanceButton(button) {
    if (!button || button.nodeType !== 1) {
      return;
    }

    if (
      button.getAttribute(READY_ATTR) === "true" &&
      button.querySelector("[" + OVERLAY_ATTR + "='true']")
    ) {
      return;
    }

    if (!button.hasAttribute("data-myluck-original-label")) {
      button.setAttribute(
        "data-myluck-original-label",
        (button.textContent || "").trim() || "Register"
      );
    }

    button.classList.add("myluck-3d-button");
    button.setAttribute(READY_ATTR, "true");
    button.setAttribute("aria-label", "Join now");

    if (!button.querySelector("[" + OVERLAY_ATTR + "='true']")) {
      button.appendChild(createEnhancement());
    }
  }

  function enhanceAll() {
    document.querySelectorAll(BUTTON_SELECTOR).forEach(enhanceButton);
  }

  function getActiveHighScoresTab() {
    return (
      HIGH_SCORES_TABS.filter(function (tab) {
        return tab.key === highScoresState.tab;
      })[0] || HIGH_SCORES_TABS[0]
    );
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

    if (!query) {
      return HIGH_SCORES_ROWS;
    }

    return HIGH_SCORES_ROWS.filter(function (row) {
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
    return (
      '<aside class="myluck-highscores-card" aria-label="Selected player rankings">' +
      '<div class="myluck-highscores-player">' +
      '<span class="myluck-highscores-trophy">' +
      getTrophyIconMarkup() +
      "</span>" +
      '<strong>jarik</strong>' +
      "</div>" +
      '<dl class="myluck-highscores-stats">' +
      '<div><dt>Top Wagers</dt><dd>#2</dd></div>' +
      '<div><dt>Biggest Winners</dt><dd>#1</dd></div>' +
      '<div><dt>Biggest Losers</dt><dd>Not Ranked</dd></div>' +
      '<div><dt>Biggest Wins</dt><dd>#2</dd></div>' +
      '<div><dt>Biggest Losses</dt><dd>#89</dd></div>' +
      '<div><dt>Luckiest Wins</dt><dd>#6194</dd></div>' +
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

  function hookHighScoresNavigation() {
    if (highScoresHistoryHooked) {
      return;
    }

    highScoresHistoryHooked = true;

    ["pushState", "replaceState"].forEach(function (method) {
      var original = window.history && window.history[method];

      if (typeof original !== "function") {
        return;
      }

      window.history[method] = function () {
        var result = original.apply(this, arguments);
        window.setTimeout(function () {
          renderHighScoresPage(false);
        }, 0);
        return result;
      };
    });

    window.addEventListener("popstate", function () {
      window.setTimeout(function () {
        renderHighScoresPage(false);
      }, 0);
    });
  }

  function runEnhancements() {
    enhanceAll();
    renderHighScoresPage(false);
  }

  function start() {
    hookHighScoresNavigation();
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
