
const DMBOWIDGET_ASSET_BASE = (() => {
  const scriptSrc = document.currentScript && document.currentScript.src;
  if (scriptSrc) return scriptSrc.replace(/\/script\.js(?:\?.*)?$/, "/assets/");
  return "https://cdn.jsdelivr.net/gh/Narek1990/CSS@refs/heads/main/dmbobet/assets/";
})();

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
        glow: "#FD224E",
        games: [
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/178328.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/194473.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/183017.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/194505.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/175878.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/176598.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp"
        ]
      },
      {
        name: "Olympus",
        title: "Olympus Collection",
        subtitle: "Gods, lightning and powerful bonus features.",
        url: "/en/casino/all?search=olympus ",
        hero: "https://raw.githubusercontent.com/SyuzannaMartirosyan/codePublic/refs/heads/main/images/olymp_11zon.webp",
        glow: "#ff5a78",
        games: [
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/36071.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/171080.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/193801.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/194648.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/180626.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp"
        ]
      },
      { 
        name: "Egypt",
        title: "Egypt Collection",
        subtitle: "Ancient treasures, pharaohs and golden spins.",
        url: "/en/casino/all?search=egypt",
        hero: "https://raw.githubusercontent.com/SyuzannaMartirosyan/codePublic/refs/heads/main/images/egypt_11zon.webp",
        glow: "#c9163f",
        games: [
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/60420.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/193502.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/193602.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/195433.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/194563.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/194562.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp"
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
          background: linear-gradient(180deg, #ff5a78, #FD224E);
          font-weight: 950;
          box-shadow:
            0 12px 34px rgba(253, 34, 78, .34),
            inset 0 1px 0 rgba(255, 255, 255, .22);
          transition: transform .22s ease, box-shadow .22s ease, filter .22s ease;
        }

        .btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.06) saturate(1.08);
          box-shadow:
            0 16px 40px rgba(253, 34, 78, .44),
            0 0 26px rgba(253, 34, 78, .22),
            inset 0 1px 0 rgba(255, 255, 255, .28);
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
          background: none #FD224E;
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
          box-shadow:
            0 10px 22px rgba(253, 34, 78, .28),
            inset 0 1px 0 rgba(255,255,255,.2);
          transition: transform .2s ease, box-shadow .2s ease, filter .2s ease;
        }

        .arrow:hover {
          transform: translateY(-1px);
          filter: brightness(1.06);
          box-shadow:
            0 14px 28px rgba(253, 34, 78, .38),
            0 0 20px rgba(253, 34, 78, .24),
            inset 0 1px 0 rgba(255,255,255,.26);
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
          border: 1px solid rgba(253, 34, 78, .22);
          border-radius: 12px;
          padding: 8px 13px;
          cursor: pointer;
          background: rgba(44, 14, 28, .82);
          color: rgba(255,255,255,.62);
          font-weight: 900;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
          transition: background .2s ease, color .2s ease, box-shadow .2s ease, transform .2s ease;
        }

        .tab:hover {
          color: #fff;
          transform: translateY(-1px);
          background: rgba(253, 34, 78, .24);
          box-shadow: 0 8px 18px rgba(253, 34, 78, .14);
        }

        .tab.active {
          background: linear-gradient(180deg, #ff5a78, #FD224E);
          color: #fff;
          border-color: rgba(255,255,255,.18);
          box-shadow:
            0 10px 22px rgba(253, 34, 78, .32),
            inset 0 1px 0 rgba(255,255,255,.2);
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
    return this.getAttribute("ship-src") || `${DMBOWIDGET_ASSET_BASE}dmbo-rabbit-chase.png`;
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
          width: 100%;
          max-width: none;
          height: clamp(300px, 24vw, 380px);
          margin: 60px 0;
          overflow: hidden;
          border-radius: 18px;
          background:
            radial-gradient(circle at 76% 44%, rgba(253, 34, 78, .34), transparent 34%),
            linear-gradient(135deg, #070711 0%, #150712 48%, #2c0613 100%);
          box-shadow:
            0 18px 50px rgba(253, 34, 78, 0.20),
            inset 0 1px 0 rgba(255,255,255,.12);
        }

    
        .wave-layer {
          position: absolute;
          inset: 0;
          will-change: transform;
          pointer-events: none;
        }


        .wave-layer--back {
          background:
            radial-gradient(circle at 34% 62%, rgba(253,34,78,.42), transparent 24%),
            linear-gradient(100deg, transparent 0%, rgba(253,34,78,.16) 42%, transparent 76%);
          z-index: 2;
          opacity: 0.85;
          mix-blend-mode: screen;
        }

        .ship-layer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          z-index: 1;
          pointer-events: none;
          will-change: transform;
          filter: saturate(1.08) contrast(1.03);
          opacity: .82;
          transform-origin: center center;
        }

        .chase-character {
          position: absolute;
          inset: 0;
          z-index: 4;
          pointer-events: none;
          background-image: url("${this.shipSrc}");
          background-repeat: no-repeat;
          background-size: contain;
          background-position: center;
          will-change: transform;
          filter:
            saturate(1.15)
            contrast(1.06)
            drop-shadow(0 18px 24px rgba(0,0,0,.38))
            drop-shadow(0 0 18px rgba(253,34,78,.18));
        }

        .chase-character--mascot {
          clip-path: polygon(5% 3%, 52% 2%, 54% 95%, 4% 98%);
        }

        .chase-character--rabbit {
          clip-path: polygon(55% 18%, 86% 16%, 88% 88%, 54% 90%);
        }

        .wave-layer--front {
          z-index: 6;
          opacity: 0.75;
          background:
            repeating-linear-gradient(
              108deg,
              transparent 0 72px,
              rgba(253,34,78,.18) 74px 78px,
              transparent 82px 160px
            ),
            linear-gradient(90deg, rgba(5,2,8,.26), transparent 36%, rgba(5,2,8,.38));
          mix-blend-mode: screen;
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
          border: 1px solid rgba(253, 34, 78, .34);
          box-shadow: 0 18px 44px rgba(0,0,0,.34), 0 0 28px rgba(253,34,78,.18);
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
          background: linear-gradient(180deg, #ff5a78, #FD224E);
          text-decoration: none;
          font-weight: 700;
          transition: 0.25s ease;
          box-shadow: 0 10px 24px rgba(253,34,78,.30);
        }

        .sea-cta__btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(255,255,255,0.28);
        }

        @media (max-width: 700px) {

        .wave-layer--front {
    z-index: 6;}
          .sea-widget {
            height: 260px;
            width: 100%;
            margin: 42px 0;
            border-radius: 16px;
          }

          .ship-layer {
            width: 100%;
            object-fit: contain;
            object-position: center;
          }

          .chase-character--mascot {
            clip-path: polygon(1% 5%, 57% 5%, 58% 96%, 0 98%);
          }

          .chase-character--rabbit {
            clip-path: polygon(50% 18%, 93% 16%, 94% 91%, 49% 93%);
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

        <img class="ship-layer" src="${this.shipSrc}" alt="DMBObet rabbit chase" />
        <div class="chase-character chase-character--mascot"></div>
        <div class="chase-character chase-character--rabbit"></div>

        <div class="wave-layer wave-layer--front"></div>

        <div class="sea-cta">
          <h2 class="sea-cta__title">Catch the bonus!</h2>
          <p class="sea-cta__text">
            Follow the lucky rabbit and grab the DMBObet welcome reward.
          </p>
          <a href="${this.promoLink}" class="sea-cta__btn">
            Claim bonus
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
    this.mascot = this.shadowRoot.querySelector(".chase-character--mascot");
    this.rabbit = this.shadowRoot.querySelector(".chase-character--rabbit");
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
    const shipX = Math.max(14, widgetW * 0.025) * progress;
    const mascotX = widgetW * 0.145 * progress;
    const rabbitX = widgetW * 0.205 * progress;
    const bobMascot = Math.sin(progress * Math.PI * 7) * 5;
    const bobRabbit = Math.sin(progress * Math.PI * 9) * 6;

    this.backWave.style.transform = `
      translateX(${progress * 34}px)
      translateY(${Math.sin(progress * Math.PI * 2) * 4}px)
    `;

    this.frontWave.style.transform = `
      translateX(${-progress * 120}px)
      translateY(${progress * 6}px)
    `;

    this.ship.style.transform = `
      translateX(${-shipX}px)
      scale(${1.01 + progress * 0.02})
    `;

    if (this.mascot) {
      this.mascot.style.transform = `
        translate3d(${mascotX}px, ${bobMascot}px, 0)
        rotate(${Math.sin(progress * Math.PI * 4) * 1.2}deg)
        scale(${1 + progress * 0.018})
      `;
    }

    if (this.rabbit) {
      this.rabbit.style.transform = `
        translate3d(${rabbitX}px, ${bobRabbit}px, 0)
        rotate(${Math.sin(progress * Math.PI * 5) * -1.4}deg)
        scale(${1 + progress * 0.028})
      `;
    }

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
        "ship-src": `${DMBOWIDGET_ASSET_BASE}dmbo-rabbit-chase.png`,
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

  function markDmboSportsWidgets(root = document) {
    root.querySelectorAll?.('[data-mj="widget-game-slider"]').forEach(section => {
      const headerText = section.querySelector('[data-mj="widget-game-slider-header"]')?.textContent || "";

      if (/dmbo\s*sports/i.test(headerText)) {
        section.setAttribute("data-dmbo-sports-widget", "true");
      }
    });
  }

  function syncWidgets() {
    markDmboSportsWidgets();

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
