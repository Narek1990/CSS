"use strict";

const form = document.querySelector("#configForm");
const output = document.querySelector("#output");
const connectionStatus = document.querySelector("#connectionStatus");
const savedState = document.querySelector("#savedState");
const launchUrl = document.querySelector("#launchUrl");
const tokenState = document.querySelector("#tokenState");
const webhookState = document.querySelector("#webhookState");
const usersBody = document.querySelector("#usersBody");
const ssoEventsBody = document.querySelector("#ssoEventsBody");
const buttonsList = document.querySelector("#buttonsList");
const menuButtonId = document.querySelector("#menuButtonId");
const messagePreview = document.querySelector("#messagePreview");
const inlinePreview = document.querySelector("#inlinePreview");
const replyPreview = document.querySelector("#replyPreview");
const commandMenuPreview = document.querySelector("#commandMenuPreview");
const websiteSelect = document.querySelector("#websiteSelect");
const languageSelect = document.querySelector("#languageSelect");
const welcomeEditor = document.querySelector("#welcomeEditor");
const profileState = document.querySelector("#profileState");
const previewBotName = document.querySelector("#previewBotName");
const previewAvatar = document.querySelector("#previewAvatar");
const notice = document.querySelector("#notice");
const commandsList = document.querySelector("#commandsList");
const commandPreset = document.querySelector("#commandPreset");
const ssoState = document.querySelector("#ssoState");
const ssoGuide = document.querySelector("#ssoGuide");
const ssoPreviewUsername = document.querySelector("#ssoPreviewUsername");
const ssoPreviewLanguage = document.querySelector("#ssoPreviewLanguage");

const LANGUAGE_LABELS = {
  default: "Default",
  en: "English",
  pt: "Portuguese",
  es: "Spanish",
  ru: "Russian",
  hy: "Armenian",
  fr: "French",
  tr: "Turkish",
  ar: "Arabic"
};

let appConfig = {
  activeWebsiteId: "esportesnew",
  activeBotId: "esportesnew-bot",
  websites: []
};
let buttons = [];
let commands = [];
let hydrating = false;
let noticeTimer = null;
const pendingTokens = new Map();
const activeLanguageByProfile = new Map();

function adminHeaders() {
  const token = window.localStorage.getItem("telegramToolAdminToken") || "";
  const headers = {
    "content-type": "application/json"
  };

  if (token) {
    headers["x-admin-token"] = token;
  }

  return headers;
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...adminHeaders(),
      ...(options.headers || {})
    }
  });
  const result = await response.json().catch(() => ({
    ok: false,
    error: response.statusText
  }));

  if (!response.ok || !result.ok) {
    throw new Error(result.error || response.statusText);
  }

  return result;
}

function print(value) {
  output.textContent = JSON.stringify(value, null, 2);
}

function notify(message, state = "info", sticky = false) {
  notice.textContent = message;
  notice.dataset.state = state;
  notice.hidden = false;

  window.clearTimeout(noticeTimer);

  if (!sticky) {
    noticeTimer = window.setTimeout(() => {
      notice.hidden = true;
    }, 6500);
  }
}

function setStatus(text, state) {
  connectionStatus.textContent = text;
  connectionStatus.dataset.state = state || "";
}

function markDirty() {
  if (!hydrating) {
    savedState.textContent = "Unsaved";
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function slugify(value, fallback) {
  const slug = String(value || "")
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return slug || fallback;
}

function uniqueId(value, existing, fallback) {
  const base = slugify(value, fallback);
  let candidate = base;
  let counter = 2;

  while (existing.has(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }

  existing.add(candidate);
  return candidate;
}

function option(value, label, selectedValue) {
  return `<option value="${escapeHtml(value)}"${value === selectedValue ? " selected" : ""}>${escapeHtml(label)}</option>`;
}

function defaultButtons(websiteUrl) {
  const base = websiteUrl || "https://esportesnew.com/";

  return [
    {
      id: "play",
      label: "Play",
      type: "web_app",
      placement: "inline",
      url: base,
      callbackData: "play",
      row: 0,
      enabled: true
    },
    {
      id: "deposit",
      label: "Deposit",
      type: "web_app",
      placement: "inline",
      url: "/en/home?m=deposit",
      callbackData: "deposit",
      row: 1,
      enabled: true
    },
    {
      id: "history",
      label: "History",
      type: "web_app",
      placement: "inline",
      url: "/en/profile/transactions",
      callbackData: "history",
      row: 2,
      enabled: true
    }
  ];
}

function defaultCommands() {
  return [
    { command: "start", description: "Start Telegram SSO", descriptions: { default: "Start Telegram SSO" }, enabled: true, action: "sso", responseText: "", buttonLabel: "Open App", buttonUrl: "/" },
    { command: "login", description: "Sign in with Telegram", descriptions: { default: "Sign in with Telegram" }, enabled: true, action: "sso", responseText: "", buttonLabel: "Open App", buttonUrl: "/" },
    { command: "password", description: "Reset password", descriptions: { default: "Reset password" }, enabled: true, action: "password", responseText: "Open password reset.", buttonLabel: "Reset Password", buttonUrl: "/en/forgot-password" },
    { command: "menu", description: "Show menu", descriptions: { default: "Show menu" }, enabled: true, action: "welcome", responseText: "", buttonLabel: "", buttonUrl: "" },
    { command: "chat", description: "Contact support", descriptions: { default: "Contact support" }, enabled: false, action: "custom", responseText: "Open the website to contact support.", buttonLabel: "Open Support", buttonUrl: "/" },
    { command: "language", description: "Change language", descriptions: { default: "Change language" }, enabled: false, action: "custom", responseText: "Open the website to change language.", buttonLabel: "Open App", buttonUrl: "/" },
    { command: "logout", description: "Log out", descriptions: { default: "Log out" }, enabled: false, action: "custom", responseText: "Open the website to manage your session.", buttonLabel: "Open App", buttonUrl: "/" },
    { command: "app", description: "Launch the website", descriptions: { default: "Launch the website" }, enabled: true, action: "welcome", responseText: "", buttonLabel: "", buttonUrl: "" },
    { command: "keyboard", description: "Show Telegram app button", descriptions: { default: "Show Telegram app button" }, enabled: true, action: "keyboard", responseText: "The launch button is now on your Telegram keyboard.", buttonLabel: "", buttonUrl: "" }
  ];
}

function defaultSsoConfig() {
  return {
    enabled: true,
    serverLoginEnabled: false,
    signupFallbackEnabled: false,
    autoGeneratePassword: true,
    usernameTemplate: "{{telegram_username}}",
    passwordTemplate: "",
    defaultLanguage: "en",
    loginEndpoint: "/api/identity/api/v1/playeraccount/login",
    signupEndpoint: "/api/user/api/v1.0/fastSignUp/signup",
    nativeTelegramLoginEnabled: true,
    telegramLoginEndpoint: "/api/identity/api/v1/playeraccount/login-telegram",
    meSigninEndpoint: "/api/v1/me/signin",
    nativeReturnUrl: "/",
    passwordResetPath: "/en/forgot-password",
    loginPayload: {
      username: "{{username}}",
      password: "{{password}}",
      returnUrl: "/",
      rememberlogin: false
    },
    signupPayload: {
      userName: "{{username}}",
      language: "{{language}}",
      password: "{{password}}",
      confirmPassword: "{{password}}"
    }
  };
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

function languageLabel(code) {
  return LANGUAGE_LABELS[code] || code;
}

function localizedText(values, fallback, language) {
  const messages = values && typeof values === "object" && !Array.isArray(values) ? values : {};
  const code = normalizeLanguageCode(language);
  const shortCode = code.split("-")[0];

  return messages[code]
    || messages[shortCode]
    || messages.default
    || fallback
    || "";
}

function normalizeLocalizedText(messages, fallback) {
  const result = {
    default: String(fallback || "Open").trim().slice(0, 64) || "Open"
  };

  if (messages && typeof messages === "object" && !Array.isArray(messages)) {
    Object.entries(messages).forEach(([key, value]) => {
      const code = normalizeLanguageCode(key);

      if (code && typeof value === "string") {
        result[code] = String(value || result.default).trim().slice(0, 64) || result.default;
      }
    });
  }

  return result;
}

function normalizeWelcomeMessages(messages, fallback) {
  const result = {
    default: String(fallback || "Hello {{first_name}},\n\nWelcome. Choose an action below.")
  };

  if (messages && typeof messages === "object" && !Array.isArray(messages)) {
    Object.entries(messages).forEach(([key, value]) => {
      const code = normalizeLanguageCode(key);

      if (code && typeof value === "string") {
        result[code] = value;
      }
    });
  }

  if (!result.default) {
    result.default = "Hello {{first_name}},\n\nWelcome. Choose an action below.";
  }

  return result;
}

function normalizeCommandDescriptions(messages, fallback) {
  const result = {
    default: String(fallback || "Command").trim().slice(0, 256) || "Command"
  };

  if (messages && typeof messages === "object" && !Array.isArray(messages)) {
    Object.entries(messages).forEach(([key, value]) => {
      const code = normalizeLanguageCode(key);

      if (code && typeof value === "string") {
        result[code] = String(value || result.default).trim().slice(0, 256) || result.default;
      }
    });
  }

  return result;
}

function normalizeButton(button, index, usedIds) {
  const label = String(button.label || "Open").trim().slice(0, 64) || "Open";
  const labels = normalizeLocalizedText(button.labels || button.labelTranslations, label);
  const id = uniqueId(button.id || label, usedIds, `button-${index + 1}`);
  const type = ["web_app", "url", "callback"].includes(button.type) ? button.type : "web_app";
  const placement = ["inline", "reply", "both"].includes(button.placement) ? button.placement : "inline";
  const row = Number.isFinite(Number(button.row)) ? Number(button.row) : index;

  return {
    id,
    label: labels.default,
    labels,
    type,
    placement,
    url: String(button.url || "").trim(),
    callbackData: String(button.callbackData || button.callback_data || id).trim().slice(0, 64),
    row,
    enabled: button.enabled !== false
  };
}

function normalizeButtons(sourceButtons, websiteUrl) {
  const usedIds = new Set();

  return (Array.isArray(sourceButtons) && sourceButtons.length ? sourceButtons : defaultButtons(websiteUrl))
    .map((button, index) => normalizeButton(button, index, usedIds));
}

function inferCommandAction(command) {
  if (command === "start" || command === "login") {
    return "sso";
  }

  if (command === "keyboard") {
    return "keyboard";
  }

  if (command === "password") {
    return "password";
  }

  if (command === "chat" || command === "language" || command === "logout") {
    return "custom";
  }

  return "welcome";
}

function normalizeCommand(command, index) {
  const source = command || {};
  const name = String(source.command || commandPreset.value || `command${index + 1}`)
    .replace(/^\//, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 32) || `command${index + 1}`;
  const description = String(source.description || `${name} command`).trim().slice(0, 256);
  const descriptions = normalizeCommandDescriptions(source.descriptions || source.descriptionTranslations, description);
  const action = ["sso", "welcome", "keyboard", "password", "custom", "none"].includes(source.action)
    ? source.action
    : inferCommandAction(name);

  return {
    command: name,
    description: descriptions.default,
    descriptions,
    enabled: source.enabled !== false,
    action,
    responseText: String(source.responseText || ""),
    buttonLabel: String(source.buttonLabel || "").slice(0, 64),
    buttonUrl: String(source.buttonUrl || "")
  };
}

function normalizeCommands(sourceCommands) {
  const source = Array.isArray(sourceCommands) ? sourceCommands : [];
  const normalized = (source.length ? source : defaultCommands())
    .map(normalizeCommand)
    .filter((command) => command.command && command.description);
  const needsDefaultUpgrade = source.length > 0 && source.some((command) => {
    return !Object.prototype.hasOwnProperty.call(command || {}, "action");
  });

  if (needsDefaultUpgrade) {
    const existing = new Set(normalized.map((command) => command.command));

    defaultCommands().forEach((command) => {
      if (!existing.has(command.command)) {
        normalized.push(normalizeCommand(command, normalized.length));
      }
    });
  }

  const existing = new Set(normalized.map((command) => command.command));

  defaultCommands()
    .filter((command) => command.enabled === false)
    .forEach((command) => {
      if (!existing.has(command.command)) {
        normalized.push(normalizeCommand(command, normalized.length));
      }
    });

  return normalized;
}

function normalizeSsoConfig(source) {
  const fallback = defaultSsoConfig();
  const value = source && typeof source === "object" && !Array.isArray(source) ? source : {};

  return {
    ...fallback,
    ...value,
    nativeTelegramLoginEnabled: value.nativeTelegramLoginEnabled !== false,
    meSigninEndpoint: value.meSigninEndpoint || fallback.meSigninEndpoint,
    nativeReturnUrl: value.nativeReturnUrl || fallback.nativeReturnUrl,
    loginPayload: normalizeLoginPayload(normalizeJsonObject(value.loginPayload, fallback.loginPayload)),
    signupPayload: normalizeJsonObject(value.signupPayload, fallback.signupPayload)
  };
}

function normalizeJsonObject(value, fallback) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : clone(fallback);
}

function normalizeLoginPayload(payload) {
  const normalized = normalizeJsonObject(payload, defaultSsoConfig().loginPayload);

  if (!Object.prototype.hasOwnProperty.call(normalized, "password")) {
    normalized.password = "{{password}}";
  }

  return normalized;
}

function normalizeBot(bot, index, website) {
  const source = bot || {};
  const welcomeMessages = normalizeWelcomeMessages(source.welcomeMessages, source.welcomeText);

  return {
    id: source.id || `bot-${index + 1}`,
    label: source.label || source.name || source.username || website.name || `Bot ${index + 1}`,
    username: String(source.username || source.botUsername || "").replace(/^@/, ""),
    telegramBotToken: source.telegramBotToken || "",
    hasTelegramBotToken: Boolean(source.hasTelegramBotToken || source.telegramBotToken),
    webhookSecretToken: source.webhookSecretToken || "",
    menuButtonText: source.menuButtonText || "Play",
    menuButtonId: source.menuButtonId || "play",
    welcomeText: welcomeMessages.default,
    welcomeMessages,
    welcomeParseMode: "HTML",
    sso: normalizeSsoConfig(source.sso),
    buttons: normalizeButtons(source.buttons, website.websiteUrl),
    commands: normalizeCommands(source.commands)
  };
}

function normalizeWebsite(website, index) {
  const source = website || {};
  const normalized = {
    id: source.id || (index === 0 ? "esportesnew" : `website-${index + 1}`),
    name: source.name || source.appTitle || `Website ${index + 1}`,
    appTitle: source.appTitle || source.name || `Website ${index + 1}`,
    websiteUrl: source.websiteUrl || "https://esportesnew.com/",
    publicBaseUrl: source.publicBaseUrl || "",
    launchMode: ["direct", "wrapper"].includes(source.launchMode) ? source.launchMode : "direct",
    miniAppPath: source.miniAppPath || "/miniapp",
    webhookPath: source.webhookPath || "/telegram/webhook",
    activeBotId: source.activeBotId || "",
    bots: []
  };
  const existingBots = Array.isArray(source.bots) && source.bots.length ? source.bots : [];

  normalized.bots = (existingBots.length ? existingBots : [createBot(normalized, 0)])
    .map((bot, botIndex) => normalizeBot(bot, botIndex, normalized));

  if (!normalized.bots.some((bot) => bot.id === normalized.activeBotId)) {
    normalized.activeBotId = normalized.bots[0].id;
  }

  return normalized;
}

function normalizeAppConfig(config) {
  const source = config || {};
  const websites = Array.isArray(source.websites) && source.websites.length ? source.websites : [];

  appConfig = {
    activeWebsiteId: source.activeWebsiteId || "esportesnew",
    activeBotId: source.activeBotId || "",
    websites: (websites.length ? websites : [createWebsite(0)]).map(normalizeWebsite)
  };

  if (!appConfig.websites.some((website) => website.id === appConfig.activeWebsiteId)) {
    appConfig.activeWebsiteId = appConfig.websites[0].id;
  }

  const website = currentWebsite();
  const bot = currentBot();

  appConfig.activeBotId = bot.id;
  website.activeBotId = bot.id;
  return appConfig;
}

function currentWebsite() {
  return appConfig.websites.find((website) => website.id === appConfig.activeWebsiteId) || appConfig.websites[0] || createWebsite(0);
}

function currentBot() {
  const website = currentWebsite();

  return website.bots.find((bot) => bot.id === appConfig.activeBotId)
    || website.bots.find((bot) => bot.id === website.activeBotId)
    || website.bots[0];
}

function selectedProfile() {
  return {
    website: currentWebsite(),
    bot: currentBot()
  };
}

function profileKey(website, bot) {
  return `${website.id}:${bot.id}`;
}

function selectedPayload(extra = {}) {
  const { website, bot } = selectedProfile();

  return {
    websiteId: website.id,
    botId: bot.id,
    ...extra
  };
}

function selectedPath(path) {
  const { website, bot } = selectedProfile();
  const params = new URLSearchParams({
    websiteId: website.id,
    botId: bot.id
  });

  return `${path}?${params.toString()}`;
}

function createWebsite(index) {
  const current = appConfig.websites && appConfig.websites.length ? currentWebsite() : null;
  const existingIds = new Set((appConfig.websites || []).map((website) => website.id));
  const id = uniqueId(`website-${index + 1}`, existingIds, `website-${index + 1}`);
  const website = {
    id,
    name: "New Website",
    appTitle: "New Website",
    websiteUrl: "https://esportesnew.com/",
    publicBaseUrl: current ? current.publicBaseUrl : "",
    launchMode: "direct",
    miniAppPath: "/miniapp",
    webhookPath: "/telegram/webhook",
    activeBotId: "",
    bots: []
  };
  const bot = createBot(website, 0);

  website.bots = [bot];
  website.activeBotId = bot.id;
  return website;
}

function createBot(website, index) {
  return {
    id: `${website.id || "website"}-bot`,
    label: website.name || "Website",
    username: "",
    telegramBotToken: "",
    hasTelegramBotToken: false,
    webhookSecretToken: "",
    menuButtonText: "Play",
    menuButtonId: "play",
    welcomeText: "Hello {{first_name}},\n\nWelcome. Choose an action below.",
    welcomeMessages: {
      default: "Hello {{first_name}},\n\nWelcome. Choose an action below."
    },
    welcomeParseMode: "HTML",
    sso: defaultSsoConfig(),
    buttons: defaultButtons(website.websiteUrl),
    commands: defaultCommands()
  };
}

function fillSelectors() {
  const website = currentWebsite();

  websiteSelect.innerHTML = appConfig.websites
    .map((item) => option(item.id, item.name, website.id))
    .join("");
}

function activeLanguage() {
  const { website, bot } = selectedProfile();
  const key = profileKey(website, bot);
  const requested = activeLanguageByProfile.get(key) || "default";
  const languages = profileLanguages(bot);

  return languages.includes(requested) ? requested : "default";
}

function setActiveLanguage(language) {
  const { website, bot } = selectedProfile();

  activeLanguageByProfile.set(profileKey(website, bot), language);
}

function fillLanguageOptions() {
  const bot = currentBot();
  const languages = profileLanguages(bot)
    .sort((left, right) => {
      if (left === "default") return -1;
      if (right === "default") return 1;
      return languageLabel(left).localeCompare(languageLabel(right));
    });
  const selected = activeLanguage();

  languageSelect.innerHTML = languages
    .map((language) => option(language, languageLabel(language), selected))
    .join("");
  languageSelect.value = selected;
}

function profileLanguages(bot) {
  const languages = new Set(["default", ...Object.keys(bot.welcomeMessages || {})]);

  (bot.buttons || []).forEach((button) => {
    Object.keys(button.labels || {}).forEach((language) => languages.add(language));
  });

  (bot.commands || []).forEach((command) => {
    Object.keys(command.descriptions || {}).forEach((language) => languages.add(language));
  });

  return [...languages];
}

function fillForm() {
  const { website, bot } = selectedProfile();
  const mode = website.launchMode || "direct";
  const modeInput = form.querySelector(`input[name="launchMode"][value="${mode}"]`);
  const pendingToken = pendingTokens.get(profileKey(website, bot));

  hydrating = true;
  form.websiteName.value = website.name || "";
  form.appTitle.value = website.appTitle || website.name || "";
  form.websiteUrl.value = website.websiteUrl || "https://esportesnew.com/";
  form.publicBaseUrl.value = website.publicBaseUrl || "";
  form.miniAppPath.value = website.miniAppPath || "/miniapp";
  form.webhookPath.value = website.webhookPath || "/telegram/webhook";
  form.botLabel.value = bot.label || website.name || "";
  form.botUsername.value = bot.username || "";
  form.telegramBotToken.value = pendingToken || bot.telegramBotToken || "";
  form.menuButtonText.value = bot.menuButtonText || "Play";
  form.ssoEnabled.checked = bot.sso.enabled !== false;
  form.ssoNativeTelegramLoginEnabled.checked = bot.sso.nativeTelegramLoginEnabled !== false;
  form.ssoServerLoginEnabled.checked = Boolean(bot.sso.serverLoginEnabled);
  form.ssoSignupFallbackEnabled.checked = Boolean(bot.sso.signupFallbackEnabled);
  form.ssoUsernameTemplate.value = bot.sso.usernameTemplate || "{{telegram_username}}";
  form.ssoPasswordTemplate.value = bot.sso.passwordTemplate || "";
  form.ssoDefaultLanguage.value = bot.sso.defaultLanguage || "en";
  form.ssoPasswordResetPath.value = bot.sso.passwordResetPath || "/en/forgot-password";
  form.ssoLoginEndpoint.value = bot.sso.loginEndpoint || "/api/identity/api/v1/playeraccount/login";
  form.ssoSignupEndpoint.value = bot.sso.signupEndpoint || "/api/user/api/v1.0/fastSignUp/signup";
  form.ssoTelegramLoginEndpoint.value = bot.sso.telegramLoginEndpoint || "/api/identity/api/v1/playeraccount/login-telegram";
  form.ssoMeSigninEndpoint.value = bot.sso.meSigninEndpoint || "/api/v1/me/signin";
  form.ssoNativeReturnUrl.value = bot.sso.nativeReturnUrl || "/";
  form.ssoLoginPayload.value = JSON.stringify(bot.sso.loginPayload || defaultSsoConfig().loginPayload, null, 2);
  form.ssoSignupPayload.value = JSON.stringify(bot.sso.signupPayload || defaultSsoConfig().signupPayload, null, 2);

  if (modeInput) {
    modeInput.checked = true;
  }

  buttons = normalizeButtons(bot.buttons, website.websiteUrl);
  commands = normalizeCommands(bot.commands);
  fillLanguageOptions();
  setEditorHtml(bot.welcomeMessages[activeLanguage()] || bot.welcomeText || "");
  form.welcomeText.value = bot.welcomeMessages[activeLanguage()] || bot.welcomeText || "";
  renderButtons(bot.menuButtonId || "play");
  renderCommands();
  renderPreview();
  updateFacts();
  hydrating = false;
}

function syncCurrentFormToState() {
  if (hydrating || !appConfig.websites.length) {
    return;
  }

  const { website, bot } = selectedProfile();
  const token = form.telegramBotToken.value.trim();
  const language = activeLanguage();

  website.name = form.websiteName.value.trim() || website.name || "Website";
  website.appTitle = form.appTitle.value.trim() || website.name;
  website.websiteUrl = form.websiteUrl.value.trim() || website.websiteUrl || "https://esportesnew.com/";
  website.publicBaseUrl = form.publicBaseUrl.value.trim();
  website.miniAppPath = cleanPath(form.miniAppPath.value, "/miniapp");
  website.webhookPath = cleanPath(form.webhookPath.value, "/telegram/webhook");
  website.launchMode = new FormData(form).get("launchMode") || "direct";
  website.activeBotId = bot.id;
  appConfig.activeWebsiteId = website.id;
  appConfig.activeBotId = bot.id;

  bot.label = form.botLabel.value.trim() || website.name || "Website";
  bot.username = form.botUsername.value.trim().replace(/^@/, "");
  bot.menuButtonText = form.menuButtonText.value.trim() || "Play";
  bot.menuButtonId = menuButtonId.value;
  bot.welcomeMessages = normalizeWelcomeMessages(bot.welcomeMessages, bot.welcomeText);
  bot.welcomeMessages[language] = editorToTelegramHtml();
  bot.welcomeText = bot.welcomeMessages.default || "";
  bot.welcomeParseMode = "HTML";
  bot.buttons = normalizeButtons(buttons, website.websiteUrl);
  bot.commands = normalizeCommands(commands);
  bot.sso = {
    enabled: form.ssoEnabled.checked,
    nativeTelegramLoginEnabled: form.ssoNativeTelegramLoginEnabled.checked,
    serverLoginEnabled: form.ssoServerLoginEnabled.checked,
    signupFallbackEnabled: form.ssoSignupFallbackEnabled.checked,
    autoGeneratePassword: bot.sso.autoGeneratePassword !== false,
    usernameTemplate: form.ssoUsernameTemplate.value.trim() || "{{telegram_username}}",
    passwordTemplate: form.ssoPasswordTemplate.value,
    defaultLanguage: form.ssoDefaultLanguage.value.trim() || "en",
    loginEndpoint: form.ssoLoginEndpoint.value.trim() || "/api/identity/api/v1/playeraccount/login",
    signupEndpoint: form.ssoSignupEndpoint.value.trim() || "/api/user/api/v1.0/fastSignUp/signup",
    telegramLoginEndpoint: form.ssoTelegramLoginEndpoint.value.trim() || "/api/identity/api/v1/playeraccount/login-telegram",
    meSigninEndpoint: form.ssoMeSigninEndpoint.value.trim() || "/api/v1/me/signin",
    nativeReturnUrl: cleanPath(form.ssoNativeReturnUrl.value, "/"),
    passwordResetPath: form.ssoPasswordResetPath.value.trim() || "/en/forgot-password",
    loginPayload: parseJsonField(form.ssoLoginPayload, bot.sso.loginPayload || defaultSsoConfig().loginPayload),
    signupPayload: parseJsonField(form.ssoSignupPayload, bot.sso.signupPayload || defaultSsoConfig().signupPayload)
  };
  form.welcomeText.value = bot.welcomeMessages[language] || "";

  if (token) {
    pendingTokens.set(profileKey(website, bot), token);
    bot.telegramBotToken = token;
    bot.hasTelegramBotToken = true;
  }
}

function parseJsonField(field, fallback, strict = false) {
  try {
    return JSON.parse(field.value || "{}");
  } catch (error) {
    if (strict) {
      throw new Error(`${field.previousElementSibling ? field.previousElementSibling.textContent : "JSON"} is invalid: ${error.message}`);
    }

    return clone(fallback);
  }
}

function cleanPath(value, fallback) {
  const raw = String(value || fallback || "/").trim() || fallback || "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;

  return withSlash.replace(/\/+$/, "") || "/";
}

function prepareConfigForSave() {
  syncCurrentFormToState();
  const payload = clone(appConfig);

  parseJsonField(form.ssoLoginPayload, {}, true);
  parseJsonField(form.ssoSignupPayload, {}, true);

  payload.websites.forEach((website) => {
    website.bots.forEach((bot) => {
      const pendingToken = pendingTokens.get(profileKey(website, bot));

      if (pendingToken) {
        bot.telegramBotToken = pendingToken;
      }
    });
  });

  return payload;
}

async function saveConfig(options = {}) {
  const result = await api("/api/config", {
    method: "POST",
    body: JSON.stringify(prepareConfigForSave())
  });

  pendingTokens.clear();
  normalizeAppConfig(result.config);
  fillSelectors();

  if (options.refill !== false) {
    fillForm();
  } else {
    updateFacts();
  }

  savedState.textContent = "Saved";

  if (options.printResult) {
    print(result);
  }

  if (!options.silent) {
    notify("Configuration saved successfully.", "success");
  }

  return result;
}

function createButton() {
  const index = buttons.length + 1;

  return normalizeButton({
    id: `button-${index}`,
    label: "New Button",
    type: "web_app",
    placement: "inline",
    url: form.websiteUrl.value.trim() || "https://esportesnew.com/",
    callbackData: `button-${index}`,
    row: buttons.length,
    enabled: true
  }, buttons.length, new Set(buttons.map((button) => button.id)));
}

function renderButtons(selectedMenuId) {
  const language = activeLanguage();

  buttonsList.innerHTML = buttons.map((button, index) => {
    const labelText = language === "default" ? "Label" : `Label (${languageLabel(language)})`;

    return `
      <article class="button-row" data-index="${index}">
        <div class="button-row-top">
          <label class="toggle">
            <input type="checkbox" data-field="enabled" ${button.enabled ? "checked" : ""}>
            <span>Enabled</span>
          </label>
          <div class="move-actions">
            <button type="button" class="icon-btn" data-action="up" ${index === 0 ? "disabled" : ""} title="Move up">Up</button>
            <button type="button" class="icon-btn" data-action="down" ${index === buttons.length - 1 ? "disabled" : ""} title="Move down">Down</button>
            <button type="button" class="icon-btn danger-text" data-action="delete" title="Delete">Delete</button>
          </div>
        </div>
        <div class="button-fields">
          <label>
            <span>${escapeHtml(labelText)}</span>
            <input data-field="label" maxlength="64" value="${escapeHtml(localizedText(button.labels, button.label, language))}">
          </label>
          <label>
            <span>Type</span>
            <select data-field="type">
              ${option("web_app", "Mini App", button.type)}
              ${option("url", "Browser URL", button.type)}
              ${option("callback", "Callback", button.type)}
            </select>
          </label>
          <label>
            <span>Placement</span>
            <select data-field="placement">
              ${option("inline", "Inline", button.placement)}
              ${option("reply", "Reply Keyboard", button.placement)}
              ${option("both", "Both", button.placement)}
            </select>
          </label>
          <label>
            <span>Row</span>
            <input data-field="row" type="number" min="0" value="${escapeHtml(button.row)}">
          </label>
          <label class="wide-field">
            <span>URL or Path</span>
            <input data-field="url" placeholder="/en/home?m=deposit" value="${escapeHtml(button.url)}">
          </label>
          <label>
            <span>Callback Data</span>
            <input data-field="callbackData" maxlength="64" value="${escapeHtml(button.callbackData)}">
          </label>
        </div>
      </article>
    `;
  }).join("");

  renderMenuOptions(selectedMenuId);
}

function createCommand(name) {
  const preset = defaultCommands().find((command) => command.command === name);

  return normalizeCommand(preset ? {
    ...preset,
    enabled: true
  } : {
    command: name || "menu",
    description: `${name || "menu"} command`,
    enabled: true,
    action: inferCommandAction(name || "menu"),
    responseText: "",
    buttonLabel: "",
    buttonUrl: ""
  }, commands.length);
}

function renderCommands() {
  const language = activeLanguage();

  commandsList.innerHTML = commands.map((command, index) => {
    const descriptionText = language === "default" ? "Menu Description" : `Menu Description (${languageLabel(language)})`;

    return `
      <article class="command-row" data-index="${index}">
        <div class="button-row-top">
          <label class="toggle">
            <input type="checkbox" data-field="enabled" ${command.enabled ? "checked" : ""}>
            <span>Enabled</span>
          </label>
          <button type="button" class="icon-btn danger-text" data-action="delete" title="Delete">Delete</button>
        </div>
        <div class="command-fields">
          <label>
            <span>Command</span>
            <input data-field="command" value="/${escapeHtml(command.command)}">
          </label>
          <label>
            <span>${escapeHtml(descriptionText)}</span>
            <input data-field="description" maxlength="256" value="${escapeHtml(localizedText(command.descriptions, command.description, language))}">
          </label>
          <label>
            <span>Action</span>
            <select data-field="action">
              ${option("sso", "Telegram SSO", command.action)}
              ${option("welcome", "Welcome + Buttons", command.action)}
              ${option("keyboard", "Reply Keyboard", command.action)}
              ${option("password", "Password Reset", command.action)}
              ${option("custom", "Custom Reply", command.action)}
              ${option("none", "No Reply", command.action)}
            </select>
          </label>
          <label>
            <span>Button Text</span>
            <input data-field="buttonLabel" maxlength="64" value="${escapeHtml(command.buttonLabel)}">
          </label>
          <label>
            <span>Button URL or Path</span>
            <input data-field="buttonUrl" value="${escapeHtml(command.buttonUrl)}">
          </label>
          <label class="wide-field">
            <span>Response Text</span>
            <textarea data-field="responseText" rows="2">${escapeHtml(command.responseText)}</textarea>
          </label>
        </div>
      </article>
    `;
  }).join("");
}

function updateCommandFromField(target) {
  const row = target.closest(".command-row");

  if (!row) {
    return;
  }

  const index = Number(row.dataset.index);
  const field = target.dataset.field;

  if (!field || !commands[index]) {
    return;
  }

  if (field === "enabled") {
    commands[index].enabled = target.checked;
  } else if (field === "command") {
    commands[index].command = target.value.replace(/^\//, "");
  } else if (field === "description") {
    const language = activeLanguage();
    commands[index].descriptions = normalizeCommandDescriptions(commands[index].descriptions, commands[index].description);

    if (language === "default") {
      commands[index].descriptions.default = target.value.trim();
      commands[index].description = commands[index].descriptions.default;
    } else {
      commands[index].descriptions[language] = target.value.trim();
    }
  } else {
    commands[index][field] = target.value;
  }

  commands[index] = normalizeCommand(commands[index], index);
  syncCurrentFormToState();
  renderPreview();
  markDirty();
}

function renderMenuOptions(selectedMenuId) {
  const webAppButtons = buttons.filter((button) => button.enabled && button.type === "web_app");
  const fallback = webAppButtons[0] ? webAppButtons[0].id : "";
  const selected = webAppButtons.some((button) => button.id === selectedMenuId) ? selectedMenuId : fallback;
  const language = activeLanguage();

  menuButtonId.innerHTML = webAppButtons.length
    ? webAppButtons.map((button) => option(button.id, localizedText(button.labels, button.label, language), selected)).join("")
    : option("", "No Mini App buttons", "");
  menuButtonId.value = selected;
}

function renderPreview() {
  const { website, bot } = selectedProfile();
  const message = (form.welcomeText.value || editorToTelegramHtml() || "Welcome. Choose an action below.")
    .replaceAll("{{first_name}}", "Narek")
    .replaceAll("{{last_name}}", "")
    .replaceAll("{{username}}", "narek_0909");
  const inlineButtons = buttons.filter((button) => button.enabled && ["inline", "both"].includes(button.placement));
  const replyButtons = buttons.filter((button) => button.enabled && ["reply", "both"].includes(button.placement) && button.type === "web_app");

  previewBotName.textContent = bot.username ? `@${bot.username}` : (form.botLabel.value || bot.label || "Telegram bot");
  previewAvatar.textContent = (form.appTitle.value || website.appTitle || website.name || "T").slice(0, 1).toUpperCase();
  messagePreview.innerHTML = sanitizeHtml(message).replace(/\n/g, "<br>");
  inlinePreview.innerHTML = renderPreviewRows(inlineButtons);
  replyPreview.innerHTML = replyButtons.length
    ? `<div class="reply-title">Reply keyboard</div>${renderPreviewRows(replyButtons)}`
    : "";
  commandMenuPreview.innerHTML = renderCommandMenuPreview();
  launchUrl.textContent = buildPreviewUrl(menuButtonId.value);
  profileState.textContent = `${form.websiteName.value || website.name} / ${form.botLabel.value || bot.label}`;
}

function renderCommandMenuPreview() {
  const language = activeLanguage();
  const rows = normalizeCommands(commands)
    .filter((command) => command.enabled !== false)
    .map((command) => {
      const description = localizedText(command.descriptions, command.description, language);

      return `
        <div class="command-preview-row">
          <span class="command-preview-icon">${escapeHtml((form.appTitle.value || "T").slice(0, 1).toUpperCase())}</span>
          <span>
            <strong>/${escapeHtml(command.command)}</strong>
            <small>${escapeHtml(description)}</small>
          </span>
        </div>
      `;
    });

  if (!rows.length) {
    return "";
  }

  return `
    <div class="command-preview-title">Telegram menu</div>
    <div class="command-preview-list">${rows.join("")}</div>
  `;
}

function renderPreviewRows(sourceButtons) {
  const rows = [];
  const language = activeLanguage();

  sourceButtons
    .slice()
    .sort((left, right) => {
      if (left.row !== right.row) {
        return left.row - right.row;
      }

      return String(left.id).localeCompare(String(right.id));
    })
    .forEach((button) => {
      const rowIndex = Math.max(0, Number(button.row) || 0);
      rows[rowIndex] = rows[rowIndex] || [];
      rows[rowIndex].push(`<span class="preview-button">${escapeHtml(localizedText(button.labels, button.label, language))}<small>${button.type === "web_app" ? "Mini App" : button.type}</small></span>`);
    });

  return rows.filter(Boolean).map((row) => `<div class="preview-row">${row.join("")}</div>`).join("");
}

function buildPreviewUrl(buttonId) {
  const { website, bot } = selectedProfile();
  const button = buttons.find((item) => item.id === buttonId) || buttons.find((item) => item.type === "web_app");
  const target = button && button.url ? button.url : form.websiteUrl.value.trim();

  if (!target) {
    return "-";
  }

  try {
    const websiteUrl = new URL(form.websiteUrl.value.trim() || website.websiteUrl || "https://esportesnew.com/");
    const resolvedTarget = new URL(target, websiteUrl).toString();

    if (shouldUseNativeTelegramLogin() || new FormData(form).get("launchMode") !== "wrapper") {
      return resolvedTarget;
    }

    const publicBaseUrl = form.publicBaseUrl.value.trim();
    const miniAppPath = cleanPath(form.miniAppPath.value || website.miniAppPath, "/miniapp");

    if (!publicBaseUrl) {
      return `${miniAppPath}?websiteId=${encodeURIComponent(website.id)}&botId=${encodeURIComponent(bot.id)}&target=${encodeURIComponent(resolvedTarget)}`;
    }

    const wrapperUrl = new URL(miniAppPath, publicBaseUrl);
    wrapperUrl.searchParams.set("websiteId", website.id);
    wrapperUrl.searchParams.set("botId", bot.id);
    wrapperUrl.searchParams.set("target", resolvedTarget);

    return wrapperUrl.toString();
  } catch (_error) {
    return target;
  }
}

function shouldUseNativeTelegramLogin() {
  return Boolean(form.ssoEnabled && form.ssoEnabled.checked && form.ssoNativeTelegramLoginEnabled && form.ssoNativeTelegramLoginEnabled.checked);
}

function updateFacts() {
  const { website, bot } = selectedProfile();
  const pendingToken = pendingTokens.get(profileKey(website, bot));
  const nativeTelegramLogin = bot.sso && bot.sso.enabled !== false && bot.sso.nativeTelegramLoginEnabled !== false;
  const serverFallback = bot.sso && bot.sso.serverLoginEnabled;

  profileState.textContent = `${website.name || "Website"} / ${bot.label || "Bot"}`;
  tokenState.textContent = pendingToken || bot.telegramBotToken || "Not saved";
  webhookState.textContent = website.publicBaseUrl ? "Ready to publish" : "Needs public HTTPS URL";
  ssoState.textContent = nativeTelegramLogin
    ? (serverFallback ? "Native + Server fallback" : "Website native SSO")
    : (serverFallback ? "Server fallback only" : "SSO disabled");
  updateSsoGuide();
}

function updateSsoGuide(status) {
  if (!ssoGuide) {
    return;
  }

  const launchMode = new FormData(form).get("launchMode") || "direct";
  const nativeTelegramLogin = shouldUseNativeTelegramLogin();
  const telegramEndpoint = form.ssoTelegramLoginEndpoint.value.trim() || "/api/identity/api/v1/playeraccount/login-telegram";
  const meSigninEndpoint = form.ssoMeSigninEndpoint.value.trim() || "/api/v1/me/signin";
  const returnUrl = form.ssoNativeReturnUrl.value.trim() || "/";
  const nativeStatus = status && status.sso ? status.sso : null;

  if (!form.ssoEnabled.checked) {
    ssoGuide.dataset.state = "muted";
    ssoGuide.innerHTML = "SSO is disabled. /start and /login will only send the welcome message and buttons.";
    return;
  }

  if (!nativeTelegramLogin) {
    ssoGuide.dataset.state = "warning";
    ssoGuide.innerHTML = "Only the server fallback is enabled. It can create/check an account, but it cannot set the user&apos;s EsportesNew browser session.";
    return;
  }

  const wrapperWarning = launchMode === "wrapper"
    ? "<strong>Iframe wrapper selected:</strong> publish will still use direct website Mini App URLs for SSO."
    : "<strong>Direct website Mini App:</strong> Telegram initData reaches EsportesNew.";
  const serverNote = form.ssoServerLoginEnabled.checked
    ? "Server fallback is also enabled for webhook-side diagnostics."
    : "Server fallback is off; EsportesNew handles login in the Telegram webview.";
  const endpointNote = nativeStatus && nativeStatus.error
    ? ` Endpoint preview error: ${escapeHtml(nativeStatus.error)}`
    : "";

  ssoGuide.dataset.state = launchMode === "wrapper" ? "warning" : "success";
  ssoGuide.innerHTML = `${wrapperWarning}<br>${escapeHtml(serverNote)}<br>Website flow: <code>${escapeHtml(telegramEndpoint)}</code> receives <code>Telegram.WebApp.initData</code>, then <code>${escapeHtml(meSigninEndpoint)}?returnUrl=${escapeHtml(returnUrl)}</code> creates the site session.${endpointNote}`;
}

function setEditorHtml(value) {
  const raw = String(value || "");

  if (!/<[a-z][\s\S]*>/i.test(raw)) {
    welcomeEditor.innerHTML = escapeHtml(raw).replace(/\n/g, "<br>");
    return;
  }

  welcomeEditor.innerHTML = sanitizeHtml(raw).replace(/\n/g, "<br>");
}

function editorToTelegramHtml() {
  const html = Array.from(welcomeEditor.childNodes)
    .map(nodeToTelegramHtml)
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return html || "";
}

function nodeToTelegramHtml(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeHtml(node.nodeValue);
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const tag = node.tagName.toLowerCase();
  const content = Array.from(node.childNodes).map(nodeToTelegramHtml).join("");

  if (tag === "br") {
    return "\n";
  }

  if (tag === "div") {
    return `${content}\n`;
  }

  if (tag === "p") {
    return `${content}\n\n`;
  }

  if (tag === "b" || tag === "strong") {
    return `<b>${content}</b>`;
  }

  if (tag === "i" || tag === "em") {
    return `<i>${content}</i>`;
  }

  if (tag === "u") {
    return `<u>${content}</u>`;
  }

  if (tag === "s" || tag === "strike" || tag === "del") {
    return `<s>${content}</s>`;
  }

  if (tag === "code") {
    return `<code>${content}</code>`;
  }

  if (tag === "pre") {
    return `<pre>${content}</pre>`;
  }

  if (tag === "a") {
    const href = safeHref(node.getAttribute("href"));

    return href ? `<a href="${escapeHtml(href)}">${content}</a>` : content;
  }

  return content;
}

function sanitizeHtml(value) {
  const template = document.createElement("template");

  template.innerHTML = String(value || "");
  return Array.from(template.content.childNodes).map(sanitizeNode).join("");
}

function sanitizeNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeHtml(node.nodeValue);
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const tag = node.tagName.toLowerCase();
  const content = Array.from(node.childNodes).map(sanitizeNode).join("");

  if (tag === "br") {
    return "\n";
  }

  if (tag === "div" || tag === "p") {
    return `${content}\n`;
  }

  if (["b", "strong", "i", "em", "u", "s", "strike", "del", "code", "pre"].includes(tag)) {
    return `<${tag}>${content}</${tag}>`;
  }

  if (tag === "a") {
    const href = safeHref(node.getAttribute("href"));

    return href ? `<a href="${escapeHtml(href)}">${content}</a>` : content;
  }

  return content;
}

function safeHref(value) {
  try {
    const url = new URL(value || "", form.websiteUrl.value || "https://esportesnew.com/");

    if (!["https:", "http:"].includes(url.protocol)) {
      return "";
    }

    return url.toString();
  } catch (_error) {
    return "";
  }
}

function wrapSelection(tagName) {
  const selection = window.getSelection();

  if (!selection || !selection.rangeCount) {
    return;
  }

  const range = selection.getRangeAt(0);
  const wrapper = document.createElement(tagName);

  try {
    range.surroundContents(wrapper);
  } catch (_error) {
    wrapper.appendChild(range.extractContents());
    range.insertNode(wrapper);
  }

  selection.removeAllRanges();
  range.selectNodeContents(wrapper);
  selection.addRange(range);
}

function updateButtonFromField(target) {
  const row = target.closest(".button-row");

  if (!row) {
    return;
  }

  const index = Number(row.dataset.index);
  const field = target.dataset.field;

  if (!field || !buttons[index]) {
    return;
  }

  if (field === "enabled") {
    buttons[index][field] = target.checked;
  } else if (field === "label") {
    const language = activeLanguage();
    const value = target.value.trim().slice(0, 64) || "Open";

    buttons[index].labels = normalizeLocalizedText(buttons[index].labels, buttons[index].label);

    if (language === "default") {
      buttons[index].label = value;
      buttons[index].labels.default = value;
    } else {
      buttons[index].labels[language] = value;
    }
  } else if (field === "row") {
    buttons[index][field] = Number(target.value) || 0;
  } else {
    buttons[index][field] = target.value;
  }

  buttons[index] = normalizeButton(buttons[index], index, new Set(buttons.filter((_, itemIndex) => itemIndex !== index).map((button) => button.id)));
  renderMenuOptions(menuButtonId.value);
  syncCurrentFormToState();
  renderPreview();
  markDirty();
}

async function checkConnection(printResult = true) {
  const result = await api(selectedPath("/api/bot/status"));
  const status = result.status;

  if (!status.tokenSaved) {
    setStatus("Token missing", "error");
    webhookState.textContent = "Paste token, save config";
    notify("Token is missing for this website bot.", "error", true);
  } else if (status.connected && status.bot) {
    setStatus(`@${status.bot.username} connected`, "ready");
    webhookState.textContent = status.webhook && status.webhook.url ? status.webhook.url : "Connected";
    notify("Telegram bot is connected.", "success");
  } else if (status.bot) {
    setStatus(`@${status.bot.username} token OK`, "ready");
    webhookState.textContent = status.nextStep || (status.publicBaseUrlSet ? "Webhook not active" : "Needs public HTTPS URL");
    notify(status.nextStep || "Bot token is valid, but webhook is not connected yet.", "warning", true);
  }

  if (status.launchUrl) {
    launchUrl.textContent = status.launchUrl;
  }

  updateSsoGuide(status);

  if (printResult) {
    print(result);
  }

  return result;
}

async function loadUsers() {
  const result = await api(selectedPath("/api/users"));
  const rows = result.users.map((user) => {
    const name = [user.first_name, user.last_name].filter(Boolean).join(" ");
    const status = user.ssoStatus || "-";
    return `
      <tr>
        <td>${escapeHtml(user.id)}</td>
        <td>${escapeHtml(name || "-")}</td>
        <td>${escapeHtml(user.username || "-")}</td>
        <td>${escapeHtml(user.botUsername ? `@${user.botUsername}` : (user.botLabel || user.botId || "-"))}</td>
        <td><span class="sso-badge" data-status="${escapeHtml(status)}">${escapeHtml(status)}</span></td>
        <td>${ssoDetailHtml(user)}</td>
        <td>${escapeHtml(user.source || "-")}</td>
        <td>${escapeHtml(user.lastSeenAt || "-")}</td>
        <td><button type="button" class="secondary small" data-retry-sso="${escapeHtml(user.id)}">Retry SSO</button></td>
      </tr>
    `;
  });

  usersBody.innerHTML = rows.length
    ? rows.join("")
    : '<tr><td colspan="9">No users yet.</td></tr>';
}

async function loadSsoEvents() {
  const result = await api(`${selectedPath("/api/sso/events")}&limit=100`);
  const rows = result.events.map((event) => {
    const userLabel = event.username
      ? `${event.telegramId} / @${event.username}`
      : event.telegramId;
    const botLabel = event.botUsername ? `@${event.botUsername}` : (event.botLabel || event.botId || "-");
    const attempts = Array.isArray(event.attempts) ? event.attempts : [];
    const attemptText = attempts.length
      ? attempts.map(formatSsoAttempt).join(" | ")
      : "No attempt details.";

    return `
      <tr>
        <td>${escapeHtml(event.at || "-")}</td>
        <td>${escapeHtml(userLabel || "-")}</td>
        <td>${escapeHtml(`${event.websiteName || event.websiteId || "-"} / ${botLabel}`)}</td>
        <td><span class="sso-badge" data-status="${escapeHtml(event.status || "-")}">${escapeHtml(event.status || "-")}</span></td>
        <td>${escapeHtml(event.action || "-")}</td>
        <td>${ssoEventDetailHtml(event)}</td>
        <td><small title="${escapeHtml(attemptText)}">${escapeHtml(attemptText)}</small></td>
      </tr>
    `;
  });

  ssoEventsBody.innerHTML = rows.length
    ? rows.join("")
    : '<tr><td colspan="7">No SSO events yet.</td></tr>';
}

function ssoDetailHtml(user) {
  const attempts = Array.isArray(user.ssoLastAttempts) ? user.ssoLastAttempts : [];
  const attemptText = attempts.length
    ? attempts.map(formatSsoAttempt).join(" | ")
    : "No SSO attempt details yet.";
  const error = user.ssoLastError || (user.ssoStatus === "ok" ? "Connected" : "");
  const code = user.ssoCode ? `Code: ${user.ssoCode}` : "";
  const nextStep = user.ssoNextStep || "";

  return `
    <div class="sso-detail">
      <strong>${escapeHtml(user.ssoUsername || user.username || "-")}</strong>
      <span>${escapeHtml(user.ssoAction || "-")}${user.ssoLastAttemptAt ? ` at ${escapeHtml(user.ssoLastAttemptAt)}` : ""}</span>
      ${code ? `<small>${escapeHtml(code)}</small>` : ""}
      ${error ? `<small class="${user.ssoStatus === "failed" ? "sso-error" : ""}">${escapeHtml(error)}</small>` : ""}
      ${nextStep ? `<small class="sso-next-step">${escapeHtml(nextStep)}</small>` : ""}
      <small title="${escapeHtml(attemptText)}">${escapeHtml(attemptText)}</small>
    </div>
  `;
}

function ssoEventDetailHtml(event) {
  const error = event.error || (event.status === "ok" ? "Connected" : "");
  const code = event.code ? `Code: ${event.code}` : "";
  const nextStep = event.nextStep || "";

  return `
    <div class="sso-detail">
      <strong>${escapeHtml(event.ssoUsername || event.username || "-")}</strong>
      ${code ? `<small>${escapeHtml(code)}</small>` : ""}
      ${error ? `<small class="${event.status === "failed" ? "sso-error" : ""}">${escapeHtml(error)}</small>` : ""}
      ${nextStep ? `<small class="sso-next-step">${escapeHtml(nextStep)}</small>` : ""}
    </div>
  `;
}

function formatSsoAttempt(attempt) {
  const status = attempt.status ? ` HTTP ${attempt.status}` : "";
  const state = attempt.skipped ? "skipped" : (attempt.ok ? "ok" : "failed");
  const message = attempt.message ? `: ${attempt.message}` : "";

  return `${attempt.action || "sso"} ${state}${status}${message}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

usersBody.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-retry-sso]");

  if (!button) {
    return;
  }

  const telegramId = button.dataset.retrySso;
  button.disabled = true;
  button.textContent = "Retrying";
  notify(`Retrying SSO for Telegram user ${telegramId}...`, "warning", true);

  try {
    const result = await api(selectedPath("/api/sso/retry"), {
      method: "POST",
      body: JSON.stringify(selectedPayload({ telegramId }))
    });
    const error = result.ssoResult && (result.ssoResult.reason || result.ssoResult.error);

    print(result);
    notify(
      result.ssoResult && result.ssoResult.ok
        ? `SSO succeeded for Telegram user ${telegramId}.`
        : `SSO failed for Telegram user ${telegramId}: ${error || "check details below."}`,
      result.ssoResult && result.ssoResult.ok ? "success" : "error",
      !(result.ssoResult && result.ssoResult.ok)
    );
    await loadUsers();
    await loadSsoEvents();
  } catch (error) {
    notify(`SSO retry failed: ${error.message}`, "error", true);
    print({ error: error.message });
  } finally {
    button.disabled = false;
    button.textContent = "Retry SSO";
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  savedState.textContent = "Saving";

  try {
    const result = await saveConfig({ printResult: true });
    setStatus("Saved", "ready");
    print(result);
  } catch (error) {
    savedState.textContent = "Failed";
    setStatus("Save failed", "error");
    notify(`Save failed: ${error.message}`, "error", true);
    print({ error: error.message });
  }
});

form.addEventListener("input", () => {
  syncCurrentFormToState();
  renderPreview();
  updateFacts();
  markDirty();
});

form.addEventListener("change", () => {
  syncCurrentFormToState();
  renderPreview();
  updateFacts();
  markDirty();
});

welcomeEditor.addEventListener("input", () => {
  syncCurrentFormToState();
  renderPreview();
  markDirty();
});

document.querySelector(".editor-toolbar").addEventListener("click", (event) => {
  const action = event.target.dataset.format;

  if (!action) {
    return;
  }

  welcomeEditor.focus();

  if (action === "code") {
    wrapSelection("code");
  } else if (action === "createLink") {
    const requestedHref = window.prompt("Link URL", form.websiteUrl.value.trim());

    if (requestedHref === null) {
      return;
    }

    const href = safeHref(requestedHref);

    if (href) {
      document.execCommand("createLink", false, href);
    }
  } else {
    document.execCommand(action, false, null);
  }

  syncCurrentFormToState();
  renderPreview();
  markDirty();
});

websiteSelect.addEventListener("change", () => {
  syncCurrentFormToState();
  appConfig.activeWebsiteId = websiteSelect.value;
  appConfig.activeBotId = currentWebsite().activeBotId || currentWebsite().bots[0].id;
  setActiveLanguage(activeLanguage());
  fillSelectors();
  fillForm();
  markDirty();
  checkConnection(false).catch(() => {});
  loadUsers().catch((error) => print({ error: error.message }));
  loadSsoEvents().catch((error) => print({ error: error.message }));
});

languageSelect.addEventListener("change", () => {
  syncCurrentFormToState();
  setActiveLanguage(languageSelect.value || "default");
  fillLanguageOptions();
  setEditorHtml(currentBot().welcomeMessages[activeLanguage()] || "");
  form.welcomeText.value = currentBot().welcomeMessages[activeLanguage()] || "";
  renderButtons(menuButtonId.value);
  renderCommands();
  renderPreview();
  markDirty();
});

document.querySelector("#addLanguage").addEventListener("click", () => {
  syncCurrentFormToState();
  const code = normalizeLanguageCode(window.prompt("Language code, for example en, pt, es, ru, hy") || "");

  if (!code || code === "default") {
    notify("Enter a valid language code such as en, pt, es, ru, or hy.", "error", true);
    return;
  }

  const bot = currentBot();

  bot.welcomeMessages = normalizeWelcomeMessages(bot.welcomeMessages, bot.welcomeText);

  if (bot.welcomeMessages[code] === undefined) {
    bot.welcomeMessages[code] = bot.welcomeMessages.default || bot.welcomeText || "";
  }

  buttons = buttons.map((button) => {
    const labels = normalizeLocalizedText(button.labels, button.label);

    if (labels[code] === undefined) {
      labels[code] = labels.default;
    }

    return {
      ...button,
      labels
    };
  });
  commands = commands.map((command) => {
    const descriptions = normalizeCommandDescriptions(command.descriptions, command.description);

    if (descriptions[code] === undefined) {
      descriptions[code] = descriptions.default;
    }

    return {
      ...command,
      descriptions
    };
  });
  bot.buttons = normalizeButtons(buttons, currentWebsite().websiteUrl);
  bot.commands = normalizeCommands(commands);
  setActiveLanguage(code);
  fillLanguageOptions();
  setEditorHtml(bot.welcomeMessages[code]);
  form.welcomeText.value = bot.welcomeMessages[code];
  renderButtons(menuButtonId.value);
  renderCommands();
  renderPreview();
  markDirty();
  notify(`Added ${languageLabel(code)} content.`, "success");
});

document.querySelector("#addWebsite").addEventListener("click", () => {
  syncCurrentFormToState();
  const website = createWebsite(appConfig.websites.length);

  appConfig.websites.push(website);
  appConfig.activeWebsiteId = website.id;
  appConfig.activeBotId = website.activeBotId;
  setActiveLanguage("default");
  fillSelectors();
  fillForm();
  markDirty();
  notify("New website profile added. Save when ready.", "success");
});

buttonsList.addEventListener("input", (event) => {
  updateButtonFromField(event.target);
});

buttonsList.addEventListener("change", (event) => {
  if (event.target.matches("select, input[type='checkbox']")) {
    updateButtonFromField(event.target);
  }
});

buttonsList.addEventListener("click", (event) => {
  const action = event.target.dataset.action;
  const row = event.target.closest(".button-row");

  if (!action || !row) {
    return;
  }

  const index = Number(row.dataset.index);

  if (action === "delete") {
    buttons.splice(index, 1);
  }

  if (action === "up" && index > 0) {
    [buttons[index - 1], buttons[index]] = [buttons[index], buttons[index - 1]];
  }

  if (action === "down" && index < buttons.length - 1) {
    [buttons[index + 1], buttons[index]] = [buttons[index], buttons[index + 1]];
  }

  renderButtons(menuButtonId.value);
  syncCurrentFormToState();
  renderPreview();
  markDirty();
});

document.querySelector("#addButton").addEventListener("click", () => {
  syncCurrentFormToState();
  buttons.push(createButton());
  renderButtons(menuButtonId.value);
  syncCurrentFormToState();
  renderPreview();
  markDirty();
  notify("Button added. Save and publish when ready.", "success");
});

commandsList.addEventListener("input", (event) => {
  updateCommandFromField(event.target);
});

commandsList.addEventListener("change", (event) => {
  if (event.target.matches("select, input[type='checkbox']")) {
    updateCommandFromField(event.target);
  }
});

commandsList.addEventListener("click", (event) => {
  const action = event.target.dataset.action;
  const row = event.target.closest(".command-row");

  if (action !== "delete" || !row) {
    return;
  }

  commands.splice(Number(row.dataset.index), 1);
  renderCommands();
  syncCurrentFormToState();
  renderPreview();
  markDirty();
});

document.querySelector("#addCommand").addEventListener("click", () => {
  syncCurrentFormToState();
  const command = createCommand(commandPreset.value);

  if (commands.some((item) => item.command === command.command)) {
    notify(`/${command.command} already exists.`, "warning");
    return;
  }

  commands.push(command);
  renderCommands();
  syncCurrentFormToState();
  renderPreview();
  markDirty();
  notify(`/${command.command} command added. Save and publish when ready.`, "success");
});

document.querySelector("#applyNativeSso").addEventListener("click", () => {
  const directInput = form.querySelector('input[name="launchMode"][value="direct"]');

  form.ssoEnabled.checked = true;
  form.ssoNativeTelegramLoginEnabled.checked = true;
  form.ssoServerLoginEnabled.checked = false;
  form.ssoSignupFallbackEnabled.checked = false;
  form.ssoTelegramLoginEndpoint.value = "/api/identity/api/v1/playeraccount/login-telegram";
  form.ssoMeSigninEndpoint.value = "/api/v1/me/signin";
  form.ssoNativeReturnUrl.value = "/";
  form.ssoLoginEndpoint.value = "/api/identity/api/v1/playeraccount/login";
  form.ssoSignupEndpoint.value = "/api/user/api/v1.0/fastSignUp/signup";

  if (directInput) {
    directInput.checked = true;
  }

  buttons = buttons.map((button) => ({
    ...button,
    type: button.type === "callback" ? button.type : "web_app",
    placement: button.placement || "inline"
  }));
  commands = normalizeCommands(commands).map((command) => {
    if (command.command === "start" || command.command === "login") {
      return {
        ...command,
        action: "sso"
      };
    }

    return command;
  });

  syncCurrentFormToState();
  renderButtons(menuButtonId.value);
  renderCommands();
  renderPreview();
  updateFacts();
  markDirty();
  notify("AzenPlay-style Telegram WebApp SSO applied. Save and publish to Telegram.", "success");
});

document.querySelector("#verifyBot").addEventListener("click", async () => {
  try {
    savedState.textContent = "Saving";
    syncCurrentFormToState();
    const { website, bot } = selectedProfile();
    const pendingToken = pendingTokens.get(profileKey(website, bot));
    const config = prepareConfigForSave();
    const result = await api("/api/bot/verify", {
      method: "POST",
      body: JSON.stringify(selectedPayload({
        config,
        ...(pendingToken ? { telegramBotToken: pendingToken } : {})
      }))
    });

    pendingTokens.clear();
    normalizeAppConfig(result.config);
    fillSelectors();
    fillForm();
    setStatus(result.bot.username ? `@${result.bot.username} verified` : "Verified", "ready");
    savedState.textContent = "Saved";
    notify("Bot verified and saved successfully.", "success");
    print(result);
  } catch (error) {
    savedState.textContent = "Failed";
    setStatus("Bot error", "error");
    notify(`Verify failed: ${error.message}`, "error", true);
    print({ error: error.message });
  }
});

document.querySelector("#checkConnection").addEventListener("click", async () => {
  try {
    savedState.textContent = "Saving";
    await saveConfig({ silent: true });
    await checkConnection();
  } catch (error) {
    savedState.textContent = "Failed";
    setStatus("Connection error", "error");
    notify(`Connection check failed: ${error.message}`, "error", true);
    print({ error: error.message });
  }
});

document.querySelector("#setupBot").addEventListener("click", async () => {
  try {
    savedState.textContent = "Saving";
    await saveConfig({ silent: true });
    const result = await api("/api/bot/setup", {
      method: "POST",
      body: JSON.stringify(selectedPayload())
    });

    normalizeAppConfig(result.config);
    fillSelectors();
    fillForm();
    launchUrl.textContent = result.launchUrl || "-";
    webhookState.textContent = result.webhookUrl || result.webhookSkippedReason || "Menu/button configured";
    setStatus("Telegram setup done", "ready");
    savedState.textContent = "Saved";
    notify("Published to Telegram successfully.", "success");
    print(result);
    await checkConnection(false);
  } catch (error) {
    savedState.textContent = "Failed";
    setStatus("Setup failed", "error");
    notify(`Publish failed: ${error.message}`, "error", true);
    print({ error: error.message });
  }
});

document.querySelector("#sendTest").addEventListener("click", async () => {
  const chatId = document.querySelector("#chatId").value.trim();

  try {
    await saveConfig({ silent: true });
    const result = await api("/api/bot/send-test", {
      method: "POST",
      body: JSON.stringify(selectedPayload({
        chatId,
        message: form.welcomeText.value.trim()
      }))
    });
    notify("Test message sent.", "success");
    print(result);
  } catch (error) {
    notify(`Test message failed: ${error.message}`, "error", true);
    print({ error: error.message });
  }
});

document.querySelector("#previewSso").addEventListener("click", async () => {
  try {
    await saveConfig({ silent: true });
    const result = await api("/api/sso/preview", {
      method: "POST",
      body: JSON.stringify(selectedPayload({
        username: ssoPreviewUsername.value.trim() || "telegram_user",
        language: ssoPreviewLanguage.value.trim() || activeLanguage() || "en"
      }))
    });

    notify("SSO payload preview generated.", "success");
    print(result);
  } catch (error) {
    notify(`SSO preview failed: ${error.message}`, "error", true);
    print({ error: error.message });
  }
});

document.querySelector("#deleteWebhook").addEventListener("click", async () => {
  try {
    const result = await api("/api/bot/delete-webhook", {
      method: "POST",
      body: JSON.stringify(selectedPayload())
    });
    webhookState.textContent = "Deleted";
    notify("Webhook deleted.", "success");
    print(result);
  } catch (error) {
    notify(`Delete webhook failed: ${error.message}`, "error", true);
    print({ error: error.message });
  }
});

document.querySelector("#refreshUsers").addEventListener("click", () => {
  loadUsers()
    .then(() => notify("Users refreshed.", "success"))
    .catch((error) => {
      notify(`Refresh failed: ${error.message}`, "error", true);
      print({ error: error.message });
    });
});

document.querySelector("#refreshSsoEvents").addEventListener("click", () => {
  loadSsoEvents()
    .then(() => notify("SSO event log refreshed.", "success"))
    .catch((error) => {
      notify(`SSO event refresh failed: ${error.message}`, "error", true);
      print({ error: error.message });
    });
});

async function loadConfig() {
  try {
    const result = await api("/api/config");

    normalizeAppConfig(result.config);
    fillSelectors();
    fillForm();
    launchUrl.textContent = result.launchUrl || buildPreviewUrl(currentBot().menuButtonId);
    savedState.textContent = "Loaded";
    setStatus("Ready", "ready");
    checkConnection(false).catch(() => {});
  } catch (error) {
    if (String(error.message).includes("Admin token")) {
      const token = window.prompt("Admin token");
      if (token) {
        window.localStorage.setItem("telegramToolAdminToken", token);
        await loadConfig();
      }
      return;
    }

    setStatus("Config error", "error");
    notify(`Config load failed: ${error.message}`, "error", true);
    print({ error: error.message });
  }
}

loadConfig()
  .then(() => Promise.all([loadUsers(), loadSsoEvents()]))
  .catch((error) => {
    notify(`Startup failed: ${error.message}`, "error", true);
    print({ error: error.message });
  });
