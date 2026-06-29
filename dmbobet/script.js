
class SlotCollections extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.activeIndex = 0;
    this.isAnimating = false;

    this.collections = [
      {
        name: "Dragons",
        title: "Dragons Collection",
        subtitle: "Mystic reels, icy beasts and legendary wins.",
        url: "/en/casino/all?search=dragon",
        hero: "https://raw.githubusercontent.com/SyuzannaMartirosyan/codePublic/refs/heads/main/images/dragon_11zon.webp",
        glow: "#00aaff",
        games: [
          "https://nordabet.ee/api/cmsgateway/api/v1/AssetsSite/gameimage/178328.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://nordabet.ee/api/cmsgateway/api/v1/AssetsSite/gameimage/194473.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://nordabet.ee/api/cmsgateway/api/v1/AssetsSite/gameimage/183017.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://nordabet.ee/api/cmsgateway/api/v1/AssetsSite/gameimage/194505.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://nordabet.ee/api/cmsgateway/api/v1/AssetsSite/gameimage/175878.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://nordabet.ee/api/cmsgateway/api/v1/AssetsSite/gameimage/176598.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp"
        ]
      },
      {
        name: "Olympus",
        title: "Olympus Collection",
        subtitle: "Gods, lightning and powerful bonus features.",
        url: "/en/casino/all?search=olympus ",
        hero: "https://raw.githubusercontent.com/SyuzannaMartirosyan/codePublic/refs/heads/main/images/olymp_11zon.webp",
        glow: "#ffb52e",
        games: [
          "https://nordabet.ee/api/cmsgateway/api/v1/AssetsSite/gameimage/36071.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://nordabet.ee/api/cmsgateway/api/v1/AssetsSite/gameimage/171080.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://nordabet.ee/api/cmsgateway/api/v1/AssetsSite/gameimage/193801.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://nordabet.ee/api/cmsgateway/api/v1/AssetsSite/gameimage/194648.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://nordabet.ee/api/cmsgateway/api/v1/AssetsSite/gameimage/180626.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp"
        ]
      },
      { 
        name: "Egypt",
        title: "Egypt Collection",
        subtitle: "Ancient treasures, pharaohs and golden spins.",
        url: "/en/casino/all?search=egypt",
        hero: "https://raw.githubusercontent.com/SyuzannaMartirosyan/codePublic/refs/heads/main/images/egypt_11zon.webp",
        glow: "#d99027",
        games: [
          "https://nordabet.ee/api/cmsgateway/api/v1/AssetsSite/gameimage/60420.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://nordabet.ee/api/cmsgateway/api/v1/AssetsSite/gameimage/193502.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://nordabet.ee/api/cmsgateway/api/v1/AssetsSite/gameimage/193602.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://nordabet.ee/api/cmsgateway/api/v1/AssetsSite/gameimage/195433.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://nordabet.ee/api/cmsgateway/api/v1/AssetsSite/gameimage/194563.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://nordabet.ee/api/cmsgateway/api/v1/AssetsSite/gameimage/194562.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp"
        ]
      }
    ];

    this.handleResize = (() => {
      let timeout;

      return () => {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
          this.updateSlide(true);
        }, 150);
      };
    })();
  }

  connectedCallback() {
    this.render();
    this.updateSlide(true);
    this.bindEvents();

    window.addEventListener("resize", this.handleResize);
  }

  disconnectedCallback() {
    window.removeEventListener("resize", this.handleResize);
  }

  get current() {
    return this.collections[this.activeIndex];
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        * { box-sizing: border-box; }

        :host {
          display: block;
          width: 100%;
          font-family: 'Rubik';
        }

        .collection-widget {
          position: relative;
          max-width: 96%;
          min-height: 390px;
          margin: 0 auto;
          border-radius: 20px;
          overflow: visible;
          color: #fff;
        }

        .card-bg {
          position: absolute;
          inset: 0;
          top: 60px;
          overflow: hidden;
          border-radius: 20px;
          background:
            linear-gradient(357deg,rgba(0, 53, 87, 1) 0%, rgba(22, 19, 66, 0.2) 100%);
          box-shadow: 0 26px 80px rgba(0,0,0,.4);
        }

        .card-bg::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(255,255,255,.08), transparent 40%),
            radial-gradient(circle at 70% 45%, rgba(255,255,255,.12), transparent 35%);
          pointer-events: none;
        }

        .glow {
          position: absolute;
          width: 520px;
          height: 320px;
          right: 5%;
          top: 50%;
          transform: translateY(-50%);
          border-radius: 50%;
          background: var(--glow);
          filter: blur(70px);
          opacity: .55;
          transition: background .9s ease, opacity .9s ease, transform .9s ease;
          z-index: 1;
        }

        .content-layer {
          position: relative;
          z-index: 3;
          width: 58%;
          padding: 80px 20px;
          min-height: 390px;
          transition: opacity .45s ease, transform .45s ease;
        }

        .content-layer.is-changing {
          opacity: 0;
          transform: translateY(18px);
        }

        .eyebrow {
          margin: 0 0 10px;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: .16em;
          text-transform: uppercase;
          color: rgba(255,255,255,.58);
        }

        .title {
          min-height: 40px;
          margin: 0;
          font-size: clamp(24px, 3.8vw, 40px);
          line-height: .94;
          font-weight: 950;
          letter-spacing: -.04em;
        }

        .title::after {
          content: "|";
          margin-left: 4px;
          opacity: .8;
          animation: blink .8s infinite;
        }

        @keyframes blink {
          50% { opacity: 0; }
        }

        .subtitle {
          margin: 0px 0 8px;
          font-size: 15px;
          line-height: 1.5;
          color: rgba(255,255,255,.72);
        }

        .games {
          display: flex;
          gap: 10px;
          margin-bottom: 18px;
        }

        .game {
          width: 74px;
          height: 100px;
          border-radius: 8px;
          overflow: hidden;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.14);
          box-shadow: 0 10px 24px rgba(0,0,0,.28);
        }

        .game img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 24px;
        }

        .tag {
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.12);
          backdrop-filter: blur(8px);
          font-size: 12px;
          font-weight: 800;
        }

        .btn {
          border: 0;
          border-radius: 16px;
          padding: 13px 24px;
          cursor: pointer;
          color: #fff;
          background: rgb(0, 189, 255);
          font-weight: 950;
          box-shadow: 0 12px 34px color-mix(in srgb, var(--glow), transparent 40%);
        }

        .hero-layer {
          position: absolute;
          z-index: 4;
          right: -36px;
          bottom: 0px;
          width: 44%;
          pointer-events: none;
          filter: drop-shadow(0 28px 42px rgba(0,0,0,.45));
          transition: opacity .55s ease, transform .65s cubic-bezier(.2,.8,.2,1);
        }

        .hero-layer.is-changing {
          opacity: 0;
          transform: translateX(50px) scale(.96);
        }

        .hero-layer img {
          max-height: 460px;
          max-width: 460px;
          width: 100%;
          display: block;
        }

        .nav {
          position: absolute;
          z-index: 7;
          right: 24px;
          top: 80px;
          display: flex;
          gap: 8px;
        }

        .arrow {
          background: none rgb(2 189 255);
          backface-visibility: hidden;
          font-weight: normal;
          font-style: normal;
          line-height: 1;
          text-align: center;
          vertical-align: center;
          font-size: 24px;
          transition: color 0.3s;
          display: inline-flex;
          cursor: pointer;
          border-radius: 12px;
          border: 0px;
          color: rgb(255, 255, 255);
          width: 40px;
          min-width: 40px;
          height: 40px;
          padding: 0px;
          justify-content: center;
          align-items: center;
        }

        .tabs {
          position: absolute;
          z-index: 7;
          left: 24px;
          bottom: 26px;
          display: flex;
          gap: 8px;
        }

        .tab {
          border: 0;
          border-radius: 12px;
          padding: 8px 13px;
          cursor: pointer;
          background: rgb(55 71 92);
          color: rgba(255,255,255,.62);
          font-weight: 900;
        }

        .tab.active {
          background: rgb(21 77 145);
          color: #fff;
        }

        @media (max-width: 720px) {


        .card-bg {
        
          top: 0px !important;}

          .subtitle {
            text-align: center;
          }

          .games {
            justify-content: center;
          }

          .eyebrow {
            text-align: center;
          }

          .title {
            text-align: center;
          }

          .collection-widget {
            max-width: 96%;
            min-height: 400px;
            max-width: 100vw;
            overflow: hidden;
          }

          .card-bg {
            border-radius: 24px;
          }

          .content-layer {
            width: 100%;
       padding: 20px 40px 200px;
          }

          .hero-layer {
            width: 80%;
            right: -78px;
            bottom: 18px;
            opacity: .95;
          }

          .glow {
            width: 420px;
            height: 420px;
            right: -80px;
            top: 58%;
          }

          .tabs {
            left: 40px;
            right: 24px;
            bottom: 20px;
            overflow-x: auto;
          }

          .nav {
            top: auto;
            bottom: 70px;
            right: 24px;
          }
        }
      </style>

      <section class="collection-widget">
        <div class="card-bg"></div>
        <div class="glow"></div>

        <div class="nav">
          <button class="arrow" data-prev>‹</button>
          <button class="arrow" data-next>›</button>
        </div>

        <div class="content-layer">
          <p class="eyebrow">Slot Collection</p>
          <h2 class="title" data-title></h2>
          <p class="subtitle" data-subtitle></p>
          <div class="games" data-games></div>
        
          <button class="btn">All Games</button>
        </div>

        <div class="hero-layer">
          <img data-hero src="" alt="">
        </div>

        <div class="tabs">
          ${this.collections.map((item, i) => `
            <button class="tab" data-tab="${i}">${item.name}</button>
          `).join("")}
        </div>
      </section>
    `;
  }

  bindEvents() {
    this.shadowRoot.querySelector("[data-next]").onclick = () => this.goTo(this.activeIndex + 1);
    this.shadowRoot.querySelector("[data-prev]").onclick = () => this.goTo(this.activeIndex - 1);

    this.shadowRoot.querySelectorAll("[data-tab]").forEach(btn => {
      btn.onclick = () => this.goTo(Number(btn.dataset.tab));
    });

    this.shadowRoot.querySelector(".btn").onclick = () => {
      window.location.href = this.current.url;
    };
  }

  goTo(index) {
    if (this.isAnimating) return;

    const nextIndex = (index + this.collections.length) % this.collections.length;
    if (nextIndex === this.activeIndex) return;

    this.isAnimating = true;

    const content = this.shadowRoot.querySelector(".content-layer");
    const hero = this.shadowRoot.querySelector(".hero-layer");

    content.classList.add("is-changing");
    hero.classList.add("is-changing");

    setTimeout(() => {
      this.activeIndex = nextIndex;
      this.updateSlide();

      setTimeout(() => {
        content.classList.remove("is-changing");
        hero.classList.remove("is-changing");
        this.isAnimating = false;
      }, 80);
    }, 420);
  }

  updateSlide(first = false) {
    const item = this.current;
    const root = this.shadowRoot.querySelector(".collection-widget");

    root.style.setProperty("--glow", item.glow);

    this.shadowRoot.querySelector("[data-subtitle]").textContent = item.subtitle;

    this.shadowRoot.querySelector("[data-hero]").src = item.hero;
    this.shadowRoot.querySelector("[data-hero]").alt = item.title;

    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    const maxGames = isMobile ? 4 : 7;

  
this.shadowRoot.querySelector("[data-games]").innerHTML =
  item.games
    .slice(0, maxGames)
    .map(src => `
      <div class="game">
        <img src="${src}" alt="">
      </div>
    `)
    .join("");

    this.shadowRoot.querySelectorAll("[data-tab]").forEach((btn, i) => {
      btn.classList.toggle("active", i === this.activeIndex);
    });

    this.typeTitle(item.title, first);
  }

  typeTitle(text, instant = false) {
    const title = this.shadowRoot.querySelector("[data-title]");
    title.textContent = "";

    if (instant) {
      title.textContent = text;
      return;
    }

    let i = 0;
    const speed = 28;

    const timer = setInterval(() => {
      title.textContent += text[i];
      i++;

      if (i >= text.length) {
        clearInterval(timer);
      }
    }, speed);
  }
}

if (!customElements.get("slot-collections")) customElements.define("slot-collections", SlotCollections);

class SeaBonusWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.ticking = false;
  }

  connectedCallback() {

    this.render();
    this.cacheElements();
    this.bindEvents();
    this.update();
  }

  disconnectedCallback() {
    window.removeEventListener("scroll", this.requestUpdate);
    window.removeEventListener("resize", this.requestUpdate);
  }

  get shipSrc() {
    return this.getAttribute("ship-src") || "./img/ship.png";
  }

  get backWaveSrc() {
    return this.getAttribute("back-wave-src") || "./img/wave-back.png";
  }

  get frontWaveSrc() {
    return this.getAttribute("front-wave-src") || "./img/wave-front.png";
  }

  get promoLink() {
    return this.getAttribute("promo-link") || "/promotions";
  }

  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }

        * {
          box-sizing: border-box;
        }

        .sea-widget {
          position: relative;
          width: min(1400px, calc(100% - 32px));
          height: 234px;
          margin: 60px auto;
          overflow: hidden;
          border-radius: 16px;
          background: linear-gradient(180deg, #1b2745 0%, #2d3561 20%, #4e4171 45%, #8b4f6c 70%, #ff8a5b 100%);
          box-shadow: 0 18px 50px rgba(40, 120, 180, 0.22);
        }

    
        .wave-layer {
          position: absolute;
          left: -40%;
          width: 200%;
          background-repeat: repeat-x;
          background-size: contain;
        
          background-position: bottom left;
          will-change: transform;
          pointer-events: none;
        }


        .wave-layer--back {
          bottom: 16px;
          height: 160px;
    
          z-index: 2;
          scale: 1.2;
          opacity: 0.75;
      filter: drop-shadow(2px 4px 6px black) brightness(0.5) contrast(1.1);
          background-image: url("${this.backWaveSrc}");
        }

        .ship-layer {
          position: absolute;
          left: 6%;
          bottom: 38px;
          width: 240px;
          max-width: 34vw;
          z-index: 4;
          pointer-events: none;
          will-change: transform;
        }

        .wave-layer--front {
         bottom: -26px;
    height: 156px;
    z-index: 6;
    scale: 0.8;
    filter:  brightness(1.1);
          background-image: url("${this.frontWaveSrc}");
        }

        .sea-cta {
          position: absolute;
          right: 34px;
          top: 50%;
          width: min(360px, 42%);
          padding: 26px;
          border-radius: 8px;
          z-index: 9;
          color: #fff;
          opacity: 0;
          transform: translate(30px, -50%) scale(0.96);
          transition: 0.7s ease;
          background:rgb(3 22 45 / 50%);
            backdrop-filter: blur(8px);
        }

        .sea-widget.is-finished .sea-cta {
          opacity: 1;
          transform: translate(0, -50%) scale(1);
        }

        .sea-cta__title {
          margin: 0 0 10px;
          font-size: 28px;
          line-height: 1.05;
        }

        .sea-cta__text {
          margin: 0 0 18px;
          font-size: 15px;
          line-height: 1.45;
          opacity: 0.9;
        }

        .sea-cta__btn {
          display: inline-flex;
          align-items: center;
          font-family: Rubik;
          justify-content: center;
          min-height: 44px;
          padding: 0 22px;
          border-radius: 16px;
          color: #fff;
          background: #02bdff;
          text-decoration: none;
          font-weight: 700;
          transition: 0.25s ease;
        }

        .sea-cta__btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(255,255,255,0.28);
        }

        @media (max-width: 700px) {

        .wave-layer--front {
    bottom: -30px;
    height: 156px;
    z-index: 6;
    scale: 1;}
          .sea-widget {
            height: 200px;
            border-radius: 16px;
          }

          .ship-layer {
            width: 170px;
            max-width: 48vw;
            bottom: 18px;
            filter: brightness(1.2);
          }

          .sea-cta {
            right: 16px;
            left: 16px;
            top: 16px;
            width: auto;
            padding: 18px;
            transform: translateY(-20px) scale(0.96);
          }

          .sea-widget.is-finished .sea-cta {
            transform: translateY(0) scale(1);
          }

          .sea-cta__title {
            font-size: 22px;
          }

          .sea-cta__text {
            font-size: 14px;
          }
        }
      </style>

      <section class="sea-widget">
        <div class="wave-layer wave-layer--back"></div>

        <img class="ship-layer" src="${this.shipSrc}" alt="ship" />

        <div class="wave-layer wave-layer--front"></div>

        <div class="sea-cta">
          <h2 class="sea-cta__title">Welcome aboard!</h2>
          <p class="sea-cta__text">
            Climb aboard and claim your welcome bonus before the tide goes out.
          </p>
          <a href="${this.promoLink}" class="sea-cta__btn">
            Get welcome bonus
          </a>
        </div>
      </section>
    `;
  }

  cacheElements() {
    this.widget = this.shadowRoot.querySelector(".sea-widget");
    this.backWave = this.shadowRoot.querySelector(".wave-layer--back");
    this.frontWave = this.shadowRoot.querySelector(".wave-layer--front");
    this.ship = this.shadowRoot.querySelector(".ship-layer");
  }

  bindEvents() {
    this.requestUpdate = () => {
      if (!this.ticking) {
        requestAnimationFrame(() => this.update());
        this.ticking = true;
      }
    };

    window.addEventListener("scroll", this.requestUpdate, { passive: true });
    window.addEventListener("resize", this.requestUpdate);
  }

  update() {
    if (!this.widget || !this.ship) return;

    const rect = this.widget.getBoundingClientRect();
    const windowH = window.innerHeight;

    const start = windowH * 0.85;
    const end = -rect.height * 0.25;

    const progress = this.clamp(
      (start - rect.top) / (start - end),
      0,
      1
    );

    const widgetW = this.widget.offsetWidth;
    const shipW = this.ship.offsetWidth;

    const shipStart = widgetW * 0.06;
    const shipEnd = widgetW - shipW - widgetW * 0.08;
    const shipX = shipStart + (shipEnd - shipStart) * progress;

    this.backWave.style.transform = `
      translateX(${-progress * 110}px)
      translateY(${progress * 8}px)
    `;

    this.frontWave.style.transform = `
      translateX(${-progress * 260}px)
      translateY(${progress * 14}px)
    `;

    this.ship.style.transform = `
      translateX(${shipX - shipStart}px)
      translateY(${Math.sin(progress * Math.PI * 6) * 7}px)
      rotate(${Math.sin(progress * Math.PI * 5) * 3}deg)
    `;

    if (progress > 0.40) {
      this.widget.classList.add("is-finished");
    } else {
      this.widget.classList.remove("is-finished");
    }

    this.ticking = false;
  }
}

if (!customElements.get("sea-bonus-widget")) customElements.define("sea-bonus-widget", SeaBonusWidget); 
(function () {
  const WIDGETS = [
    {
      tagName: "slot-collections",
      targetSelector: '[data-mj="widget-collection-slider"]',
      instanceId: "custom-slot-collections-widget",
      position: "before",
      attributes: {}
    },
    {
      tagName: "sea-bonus-widget",
      targetSelector: '[data-mj="widget-top-providers"]',
      instanceId: "custom-sea-bonus-widget",
      position: "before",
      attributes: {
        "ship-src": "https://raw.githubusercontent.com/SyuzannaMartirosyan/codePublic/refs/heads/main/images/xxx_11zon.webp",
        "back-wave-src": "https://raw.githubusercontent.com/SyuzannaMartirosyan/codePublic/refs/heads/main/images/waveee_11zon.webp",
        "front-wave-src": "https://raw.githubusercontent.com/SyuzannaMartirosyan/codePublic/refs/heads/main/images/waveee_11zon.webp",
        "promo-link": "/en/promotions/welcome-bonus"
      }
    }
  ];

  let scheduled = false;

  function isHomePage() {
    const path = location.pathname.toLowerCase();

    return (
      path === "/" ||
      path === "/test.html" ||
      path === "/en" ||
      path === "/en/"
    );
  }

  function applyAttributes(element, attributes = {}) {
    Object.entries(attributes).forEach(([name, value]) => {
      element.setAttribute(name, value);
    });
  }

  function removeWidget(config) {
    const widget = document.getElementById(config.instanceId);
    if (widget) widget.remove();
  }

  function insertWidget(config) {
    if (!isHomePage()) {
      removeWidget(config);
      return false;
    }

    const {
      tagName,
      targetSelector,
      instanceId,
      position = "before",
      attributes = {}
    } = config;

    const target = document.querySelector(targetSelector);
    if (!target || !target.parentNode) return false;

    let widget = document.getElementById(instanceId);

    if (!widget) {
      widget = document.createElement(tagName);
      widget.id = instanceId;
    }

    applyAttributes(widget, attributes);

    const isCorrectPosition =
      position === "before"
        ? widget.nextElementSibling === target
        : widget.previousElementSibling === target;

    if (isCorrectPosition) return true;

    if (position === "after") {
      target.parentNode.insertBefore(widget, target.nextSibling);
    } else {
      target.parentNode.insertBefore(widget, target);
    }

    console.log(`[WIDGET-INJECTOR] ${tagName} inserted / restored`);
    return true;
  }

  function syncWidgets() {
    if (!isHomePage()) {
      WIDGETS.forEach(removeWidget);
      return;
    }

    WIDGETS.forEach(insertWidget);
  }

  function scheduleSync() {
    if (scheduled) return;

    scheduled = true;

    requestAnimationFrame(() => {
      scheduled = false;
      syncWidgets();
    });
  }

  syncWidgets();

  const observer = new MutationObserver(scheduleSync);

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  window.addEventListener("popstate", scheduleSync);
  window.addEventListener("hashchange", scheduleSync);

  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function () {
    originalPushState.apply(this, arguments);
    scheduleSync();
  };

  history.replaceState = function () {
    originalReplaceState.apply(this, arguments);
    scheduleSync();
  };
})();
