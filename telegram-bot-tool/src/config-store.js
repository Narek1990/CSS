"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const DEFAULT_BUTTONS = [
  {
    id: "play",
    label: "Play",
    type: "web_app",
    placement: "inline",
    url: "https://esportesnew.com/",
    callbackData: "play",
    row: 0,
    enabled: true
  },
  {
    id: "deposit",
    label: "Deposit",
    type: "web_app",
    placement: "inline",
    url: "https://esportesnew.com/en/home?m=deposit",
    callbackData: "deposit",
    row: 1,
    enabled: true
  },
  {
    id: "history",
    label: "History",
    type: "web_app",
    placement: "inline",
    url: "https://esportesnew.com/en/profile/transactions",
    callbackData: "history",
    row: 2,
    enabled: true
  }
];

const DEFAULT_COMMANDS = [
  { command: "start", description: "Open EsportesNew" },
  { command: "app", description: "Launch the website" },
  { command: "keyboard", description: "Show Telegram app button" }
];

const DEFAULT_LEGACY_CONFIG = {
  appTitle: "EsportesNew",
  websiteUrl: "https://esportesnew.com/",
  publicBaseUrl: "",
  launchMode: "direct",
  miniAppPath: "/miniapp",
  webhookPath: "/telegram/webhook",
  webhookSecretToken: "",
  telegramBotToken: "",
  menuButtonText: "Play",
  menuButtonId: "play",
  welcomeText: "Hello {{first_name}},\n\nWelcome to EsportesNew. Choose an action below.",
  welcomeMessages: {
    default: "Hello {{first_name}},\n\nWelcome to EsportesNew. Choose an action below."
  },
  welcomeParseMode: "HTML",
  buttons: DEFAULT_BUTTONS,
  commands: DEFAULT_COMMANDS
};

const DEFAULT_CONFIG = {
  activeWebsiteId: "esportesnew",
  activeBotId: "esportesnew-bot",
  websites: [
    {
      id: "esportesnew",
      name: "EsportesNew",
      appTitle: "EsportesNew",
      websiteUrl: "https://esportesnew.com/",
      publicBaseUrl: "",
      launchMode: "direct",
      miniAppPath: "/miniapp",
      webhookPath: "/telegram/webhook",
      activeBotId: "esportesnew-bot",
      bots: [
        {
          id: "esportesnew-bot",
          label: "EsportesNew bot",
          username: "",
          telegramBotToken: "",
          webhookSecretToken: "",
          menuButtonText: "Play",
          menuButtonId: "play",
          welcomeText: "Hello {{first_name}},\n\nWelcome to EsportesNew. Choose an action below.",
          welcomeMessages: {
            default: "Hello {{first_name}},\n\nWelcome to EsportesNew. Choose an action below."
          },
          welcomeParseMode: "HTML",
          buttons: DEFAULT_BUTTONS,
          commands: DEFAULT_COMMANDS
        }
      ]
    }
  ]
};

function slugify(value, fallback) {
  const slug = String(value || "")
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return slug || fallback;
}

function uniqueId(value, used, fallback) {
  const base = slugify(value, fallback);
  let candidate = base;
  let counter = 2;

  while (used.has(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }

  used.add(candidate);
  return candidate;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function cleanPath(value, fallback) {
  const raw = String(value || fallback || "/").trim() || fallback || "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;

  return withSlash.replace(/\/+$/, "") || "/";
}

function cleanBaseUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function randomSecret() {
  return crypto.randomBytes(24).toString("base64url");
}

function normalizeButton(button, index, usedIds) {
  const label = String((button && button.label) || "Open").trim().slice(0, 64) || "Open";
  const id = uniqueId((button && button.id) || label, usedIds, `button-${index + 1}`);
  const type = ["web_app", "url", "callback"].includes(button && button.type) ? button.type : "web_app";
  const placement = ["inline", "reply", "both"].includes(button && button.placement) ? button.placement : "inline";
  const row = Number.isFinite(Number(button && button.row)) ? Number(button.row) : index;

  return {
    id,
    label,
    type,
    placement,
    url: String((button && button.url) || "").trim(),
    callbackData: String((button && (button.callbackData || button.callback_data)) || id).trim().slice(0, 64),
    row,
    enabled: !button || button.enabled !== false
  };
}

function normalizeButtons(buttons) {
  const source = Array.isArray(buttons) && buttons.length ? buttons : DEFAULT_BUTTONS;
  const usedIds = new Set();

  return source.map((button, index) => normalizeButton(button, index, usedIds));
}

function normalizeCommand(command) {
  const value = String((command && command.command) || "")
    .trim()
    .replace(/^\//, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 32);
  const description = String((command && command.description) || "").trim().slice(0, 256);

  if (!value || !description) {
    return null;
  }

  return {
    command: value,
    description
  };
}

function normalizeCommands(commands) {
  const source = Array.isArray(commands) && commands.length ? commands : DEFAULT_COMMANDS;
  const normalized = source.map(normalizeCommand).filter(Boolean);

  return normalized.length ? normalized : clone(DEFAULT_COMMANDS);
}

function normalizeParseMode(value) {
  const mode = String(value || "HTML").trim().toUpperCase();

  if (mode === "HTML") {
    return "HTML";
  }

  return "";
}

function normalizeLanguageCode(value) {
  const code = String(value || "default")
    .trim()
    .replace(/_/g, "-")
    .toLowerCase();

  if (!code || code === "default") {
    return "default";
  }

  return /^[a-z]{2,3}(-[a-z0-9]{2,8})?$/.test(code) ? code : "";
}

function normalizeWelcomeMessages(messages, fallbackText) {
  const fallback = String(fallbackText || DEFAULT_LEGACY_CONFIG.welcomeText);
  const result = {
    default: fallback
  };

  if (messages && typeof messages === "object" && !Array.isArray(messages)) {
    Object.entries(messages).forEach(([key, value]) => {
      const language = normalizeLanguageCode(key);

      if (language && typeof value === "string") {
        result[language] = value || fallback;
      }
    });
  }

  if (!result.default) {
    result.default = fallback;
  }

  return result;
}

function normalizeBot(bot, index, options) {
  const source = bot || {};
  const generateSecrets = Boolean(options && options.generateSecrets);
  const fallbackId = index === 0 ? "main-bot" : `bot-${index + 1}`;
  const id = slugify(source.id || source.username || source.label, fallbackId);
  const label = String(source.label || source.username || `Bot ${index + 1}`).replace(/^@/, "").trim() || `Bot ${index + 1}`;
  const webhookSecretToken = String(source.webhookSecretToken || "").trim() || (generateSecrets ? randomSecret() : "");
  const welcomeText = String(source.welcomeText || DEFAULT_LEGACY_CONFIG.welcomeText);
  const welcomeMessages = normalizeWelcomeMessages(source.welcomeMessages, welcomeText);

  return {
    id,
    label,
    username: String(source.username || source.botUsername || "").replace(/^@/, "").trim(),
    telegramBotToken: String(source.telegramBotToken || "").trim(),
    webhookSecretToken,
    menuButtonText: String(source.menuButtonText || "Play").trim().slice(0, 32) || "Play",
    menuButtonId: String(source.menuButtonId || "play").trim(),
    welcomeText: welcomeMessages.default,
    welcomeMessages,
    welcomeParseMode: normalizeParseMode(source.welcomeParseMode || source.parseMode),
    buttons: normalizeButtons(source.buttons),
    commands: normalizeCommands(source.commands)
  };
}

function normalizeWebsite(website, index, options) {
  const source = website || {};
  const id = slugify(source.id || source.name || source.appTitle, index === 0 ? "esportesnew" : `website-${index + 1}`);
  const name = String(source.name || source.appTitle || `Website ${index + 1}`).trim() || `Website ${index + 1}`;
  const rawBots = Array.isArray(source.bots) && source.bots.length ? source.bots : [source.bot || {}];
  const usedBotIds = new Set();
  const bots = rawBots.map((bot, botIndex) => {
    const normalized = normalizeBot(bot, botIndex, options);

    return {
      ...normalized,
      id: uniqueId(normalized.id, usedBotIds, botIndex === 0 ? "main-bot" : `bot-${botIndex + 1}`)
    };
  });
  const activeBotId = bots.some((bot) => bot.id === source.activeBotId) ? source.activeBotId : bots[0].id;
  const launchMode = ["direct", "wrapper"].includes(source.launchMode) ? source.launchMode : "direct";

  return {
    id,
    name,
    appTitle: String(source.appTitle || name).trim() || name,
    websiteUrl: String(source.websiteUrl || DEFAULT_LEGACY_CONFIG.websiteUrl).trim(),
    publicBaseUrl: cleanBaseUrl(source.publicBaseUrl),
    launchMode,
    miniAppPath: cleanPath(source.miniAppPath, "/miniapp"),
    webhookPath: cleanPath(source.webhookPath, "/telegram/webhook"),
    activeBotId,
    bots
  };
}

function legacyToModern(rawConfig) {
  const legacy = {
    ...DEFAULT_LEGACY_CONFIG,
    ...(rawConfig || {})
  };
  const websiteId = slugify(legacy.websiteId || legacy.appTitle || "esportesnew", "esportesnew");
  const botId = slugify(legacy.botId || legacy.botUsername || `${legacy.appTitle || "website"} bot`, "main-bot");

  return {
    activeWebsiteId: websiteId,
    activeBotId: botId,
    websites: [
      {
        id: websiteId,
        name: legacy.appTitle || "EsportesNew",
        appTitle: legacy.appTitle || "EsportesNew",
        websiteUrl: legacy.websiteUrl,
        publicBaseUrl: legacy.publicBaseUrl,
        launchMode: legacy.launchMode,
        miniAppPath: legacy.miniAppPath,
        webhookPath: legacy.webhookPath,
        activeBotId: botId,
        bots: [
          {
            id: botId,
            label: legacy.botLabel || `${legacy.appTitle || "Website"} bot`,
            username: legacy.botUsername || legacy.username || "",
            telegramBotToken: legacy.telegramBotToken,
            webhookSecretToken: legacy.webhookSecretToken,
            menuButtonText: legacy.menuButtonText,
            menuButtonId: legacy.menuButtonId,
            welcomeText: legacy.welcomeText,
            welcomeMessages: legacy.welcomeMessages,
            welcomeParseMode: legacy.welcomeParseMode || legacy.parseMode || "HTML",
            buttons: legacy.buttons,
            commands: legacy.commands
          }
        ]
      }
    ]
  };
}

function normalizeConfig(rawConfig, options = {}) {
  const source = rawConfig && Array.isArray(rawConfig.websites)
    ? rawConfig
    : legacyToModern(rawConfig || DEFAULT_LEGACY_CONFIG);
  const usedWebsiteIds = new Set();
  const websites = (Array.isArray(source.websites) && source.websites.length ? source.websites : DEFAULT_CONFIG.websites)
    .map((website, index) => {
      const normalized = normalizeWebsite(website, index, options);

      return {
        ...normalized,
        id: uniqueId(normalized.id, usedWebsiteIds, index === 0 ? "esportesnew" : `website-${index + 1}`)
      };
    });
  const activeWebsiteId = websites.some((website) => website.id === source.activeWebsiteId)
    ? source.activeWebsiteId
    : websites[0].id;
  const activeWebsite = websites.find((website) => website.id === activeWebsiteId) || websites[0];
  const activeBotId = activeWebsite.bots.some((bot) => bot.id === source.activeBotId)
    ? source.activeBotId
    : activeWebsite.activeBotId;

  activeWebsite.activeBotId = activeBotId;

  return {
    activeWebsiteId,
    activeBotId,
    websites
  };
}

function looksMaskedToken(value) {
  return String(value || "").includes("...");
}

function findWebsite(config, websiteId) {
  return (config.websites || []).find((website) => website.id === websiteId) || null;
}

function findBot(website, botId) {
  return website && (website.bots || []).find((bot) => bot.id === botId) || null;
}

function findConnectedBot(website) {
  return findBot(website, website && website.activeBotId) || (website && website.bots && website.bots[0]) || null;
}

function preserveSensitiveData(nextConfig, previousConfig) {
  nextConfig.websites.forEach((website) => {
    const previousWebsite = findWebsite(previousConfig, website.id);

    website.bots.forEach((bot) => {
      const previousBot = findBot(previousWebsite, bot.id);

      if (!previousBot) {
        if (!bot.webhookSecretToken) {
          bot.webhookSecretToken = randomSecret();
        }
        return;
      }

      if ((!bot.telegramBotToken || looksMaskedToken(bot.telegramBotToken)) && previousBot.telegramBotToken) {
        bot.telegramBotToken = previousBot.telegramBotToken;
      }

      if (!bot.webhookSecretToken && previousBot.webhookSecretToken) {
        bot.webhookSecretToken = previousBot.webhookSecretToken;
      }
    });
  });

  return nextConfig;
}

function applyLegacyPatch(config, patch) {
  const next = clone(config);
  const website = findWebsite(next, patch.activeWebsiteId || next.activeWebsiteId) || next.websites[0];
  const bot = findBot(website, patch.activeBotId || patch.botId || website.activeBotId || next.activeBotId) || website.bots[0];

  if (patch.activeWebsiteId) {
    next.activeWebsiteId = patch.activeWebsiteId;
  }

  if (patch.activeBotId || patch.botId) {
    next.activeBotId = patch.activeBotId || patch.botId;
    website.activeBotId = next.activeBotId;
  }

  [
    "name",
    "appTitle",
    "websiteUrl",
    "publicBaseUrl",
    "launchMode",
    "miniAppPath",
    "webhookPath"
  ].forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(patch, key)) {
      website[key] = patch[key];
    }
  });

  [
    "label",
    "username",
    "telegramBotToken",
    "webhookSecretToken",
    "menuButtonText",
    "menuButtonId",
    "welcomeText",
    "welcomeMessages",
    "welcomeParseMode",
    "parseMode",
    "buttons",
    "commands"
  ].forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(patch, key)) {
      bot[key === "parseMode" ? "welcomeParseMode" : key] = patch[key];
    }
  });

  return next;
}

function applyEnvOverrides(config) {
  const website = findWebsite(config, config.activeWebsiteId) || config.websites[0];
  const bot = findBot(website, config.activeBotId || website.activeBotId) || website.bots[0];

  if (process.env.WEBSITE_URL) {
    website.websiteUrl = process.env.WEBSITE_URL;
  }

  if (process.env.PUBLIC_BASE_URL) {
    website.publicBaseUrl = cleanBaseUrl(process.env.PUBLIC_BASE_URL);
  }

  if (process.env.LAUNCH_MODE) {
    website.launchMode = process.env.LAUNCH_MODE;
  }

  if (process.env.TELEGRAM_BOT_TOKEN) {
    bot.telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  }

  return normalizeConfig(config);
}

function selectConfig(config, websiteId, botId) {
  const requestedWebsite = websiteId ? findWebsite(config, websiteId) : null;
  const activeWebsite = findWebsite(config, config.activeWebsiteId);
  const website = requestedWebsite || activeWebsite || config.websites[0];
  const bot = findConnectedBot(website);

  if (!website || !bot) {
    throw new Error("No website or bot profile is configured.");
  }

  return {
    website,
    bot,
    runtimeConfig: toRuntimeConfig(website, bot)
  };
}

function toRuntimeConfig(website, bot) {
  return {
    websiteId: website.id,
    botId: bot.id,
    websiteName: website.name,
    botLabel: bot.label,
    botUsername: bot.username,
    appTitle: website.appTitle || website.name,
    websiteUrl: website.websiteUrl,
    publicBaseUrl: website.publicBaseUrl,
    launchMode: website.launchMode,
    miniAppPath: website.miniAppPath,
    webhookPath: website.webhookPath,
    telegramBotToken: bot.telegramBotToken,
    webhookSecretToken: bot.webhookSecretToken,
    menuButtonText: bot.menuButtonText,
    menuButtonId: bot.menuButtonId,
    welcomeText: bot.welcomeText,
    welcomeMessages: bot.welcomeMessages,
    welcomeParseMode: bot.welcomeParseMode,
    buttons: bot.buttons,
    commands: bot.commands
  };
}

function maskToken(token) {
  const value = String(token || "");

  if (!value) {
    return "";
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function sanitizeConfig(config, options = {}) {
  const revealTokens = Boolean(options.revealTokens);

  return {
    ...config,
    websites: config.websites.map((website) => ({
      ...website,
      bots: website.bots.map((bot) => ({
        ...bot,
        telegramBotToken: revealTokens ? bot.telegramBotToken : maskToken(bot.telegramBotToken),
        hasTelegramBotToken: Boolean(bot.telegramBotToken)
      }))
    }))
  };
}

function createStore(baseDir) {
  const dataDir = path.join(baseDir, ".data");
  const configPath = path.join(dataDir, "config.json");
  const usersPath = path.join(dataDir, "users.json");

  function ensureDataDir() {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  function readJson(filePath, fallback) {
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (_error) {
      return fallback;
    }
  }

  function writeJson(filePath, value) {
    ensureDataDir();
    fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
  }

  function getConfig() {
    const rawConfig = readJson(configPath, {});

    return applyEnvOverrides(normalizeConfig(rawConfig));
  }

  function saveConfig(nextConfig) {
    const previous = normalizeConfig(readJson(configPath, {}), { generateSecrets: true });
    const candidateInput = Array.isArray(nextConfig && nextConfig.websites)
      ? nextConfig
      : applyLegacyPatch(previous, nextConfig || {});
    const normalized = normalizeConfig(candidateInput, { generateSecrets: true });
    const merged = preserveSensitiveData(normalized, previous);

    writeJson(configPath, merged);
    return getConfig();
  }

  function getUsers(filter = {}) {
    const users = readJson(usersPath, []);

    return users.filter((user) => {
      if (filter.websiteId && user.websiteId && user.websiteId !== filter.websiteId) {
        return false;
      }

      if (filter.botId && user.botId && user.botId !== filter.botId) {
        return false;
      }

      return true;
    });
  }

  function upsertTelegramUser(user, source, context = {}) {
    const users = readJson(usersPath, []);
    const now = new Date().toISOString();
    const userId = String(user.id);
    const botId = context.botId || "";
    const existingIndex = users.findIndex((entry) => String(entry.id) === userId && String(entry.botId || "") === botId);
    const record = {
      id: user.id,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      username: user.username || "",
      language_code: user.language_code || "",
      photo_url: user.photo_url || "",
      source: source || "telegram",
      websiteId: context.websiteId || "",
      websiteName: context.websiteName || "",
      botId,
      botLabel: context.botLabel || "",
      botUsername: context.botUsername || "",
      firstSeenAt: existingIndex >= 0 ? users[existingIndex].firstSeenAt : now,
      lastSeenAt: now
    };

    if (existingIndex >= 0) {
      users[existingIndex] = {
        ...users[existingIndex],
        ...record
      };
    } else {
      users.unshift(record);
    }

    writeJson(usersPath, users);
    return record;
  }

  return {
    getConfig,
    getUsers,
    saveConfig,
    selectConfig(websiteId, botId) {
      return selectConfig(getConfig(), websiteId, botId);
    },
    upsertTelegramUser
  };
}

module.exports = {
  DEFAULT_CONFIG,
  createStore,
  normalizeConfig,
  sanitizeConfig,
  selectConfig,
  toRuntimeConfig
};
