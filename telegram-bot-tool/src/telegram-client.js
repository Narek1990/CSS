"use strict";

const { attemptWebsiteSso } = require("./website-sso");

class TelegramBotApi {
  constructor(token) {
    this.token = String(token || "").trim();

    if (!this.token) {
      throw new Error("Telegram bot token is required.");
    }

    this.baseUrl = `https://api.telegram.org/bot${this.token}`;
  }

  async request(method, payload) {
    const response = await fetch(`${this.baseUrl}/${method}`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload || {})
    });
    const result = await response.json().catch(() => null);

    if (!response.ok || !result || !result.ok) {
      const description = result && result.description ? result.description : response.statusText;
      throw new Error(`${method} failed: ${description}`);
    }

    return result.result;
  }

  getMe() {
    return this.request("getMe");
  }

  getWebhookInfo() {
    return this.request("getWebhookInfo");
  }

  setMyCommands(commands, languageCode) {
    const payload = {
      commands: botApiCommands(commands, languageCode || "default")
    };
    const telegramLanguage = telegramLanguageCode(languageCode);

    if (telegramLanguage) {
      payload.language_code = telegramLanguage;
    }

    return this.request("setMyCommands", payload);
  }

  async publishCommandMenus(commands) {
    const results = [];

    for (const set of botCommandPublishSets(commands)) {
      const ok = await this.request("setMyCommands", {
        commands: set.commands,
        ...(set.languageCode ? { language_code: set.languageCode } : {})
      });

      results.push({
        languageCode: set.languageCode || "default",
        count: set.commands.length,
        ok
      });
    }

    return results;
  }

  setChatMenuButton(text, url) {
    return this.request("setChatMenuButton", {
      menu_button: {
        type: "web_app",
        text,
        web_app: { url }
      }
    });
  }

  setWebhook(url, secretToken) {
    return this.request("setWebhook", {
      url,
      secret_token: secretToken,
      allowed_updates: ["message", "callback_query", "inline_query", "chat_join_request"]
    });
  }

  deleteWebhook() {
    return this.request("deleteWebhook", { drop_pending_updates: false });
  }

  answerCallbackQuery(callbackQueryId, text) {
    return this.request("answerCallbackQuery", {
      callback_query_id: callbackQueryId,
      text: text || ""
    });
  }

  sendMessage(chatId, text, replyMarkup, parseMode) {
    const payload = {
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
      reply_markup: replyMarkup
    };

    if (parseMode) {
      payload.parse_mode = parseMode;
    }

    return this.request("sendMessage", payload);
  }
}

function trimTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

function ensureAbsoluteHttpsUrl(value, label) {
  let url;

  try {
    url = new URL(value);
  } catch (_error) {
    throw new Error(`${label} must be a valid absolute URL.`);
  }

  if (url.protocol !== "https:") {
    throw new Error(`${label} must use HTTPS for Telegram Mini Apps.`);
  }

  return url.toString();
}

function resolveWebsiteUrl(value, config, label = "Button URL") {
  const websiteUrl = ensureAbsoluteHttpsUrl(config.websiteUrl, "Website URL");
  const raw = String(value || "").trim();
  let url;

  try {
    url = raw ? new URL(raw, websiteUrl) : new URL(websiteUrl);
  } catch (_error) {
    throw new Error(`${label} must be a valid URL or website-relative path.`);
  }

  if (url.protocol !== "https:") {
    throw new Error(`${label} must use HTTPS for Telegram Mini Apps.`);
  }

  return url.toString();
}

function buildLaunchUrl(config, targetUrl) {
  const websiteUrl = resolveWebsiteUrl(targetUrl, config, "Launch URL");

  if (config.launchMode !== "wrapper") {
    return websiteUrl;
  }

  const publicBaseUrl = ensureAbsoluteHttpsUrl(config.publicBaseUrl, "Public Base URL");
  const miniAppUrl = new URL(config.miniAppPath || "/miniapp", trimTrailingSlash(publicBaseUrl));
  miniAppUrl.searchParams.set("target", websiteUrl);

  if (config.websiteId) {
    miniAppUrl.searchParams.set("websiteId", config.websiteId);
  }

  if (config.botId) {
    miniAppUrl.searchParams.set("botId", config.botId);
  }

  return miniAppUrl.toString();
}

function buildWebhookUrl(config) {
  const publicBaseUrl = ensureAbsoluteHttpsUrl(config.publicBaseUrl, "Public Base URL");
  const webhookPath = config.webhookPath || "/telegram/webhook";
  const webhookSecretToken = config.webhookSecretToken || "";
  const pathParts = [
    webhookPath.replace(/\/+$/, ""),
    config.websiteId ? encodeURIComponent(config.websiteId) : "",
    config.botId ? encodeURIComponent(config.botId) : "",
    encodeURIComponent(webhookSecretToken)
  ].filter(Boolean);
  const url = new URL(pathParts.join("/"), trimTrailingSlash(publicBaseUrl));

  return url.toString();
}

function sortButtons(buttons) {
  return [...(buttons || [])].sort((left, right) => {
    if (left.row !== right.row) {
      return left.row - right.row;
    }

    return String(left.id).localeCompare(String(right.id));
  });
}

function buttonMatchesPlacement(button, placement) {
  return button.enabled !== false && (button.placement === placement || button.placement === "both");
}

function normalizeLanguageCode(value) {
  return String(value || "")
    .trim()
    .replace(/_/g, "-")
    .toLowerCase();
}

function selectLocalizedText(values, fallback, userOrLanguage) {
  const messages = values && typeof values === "object" && !Array.isArray(values) ? values : {};
  const languageCode = normalizeLanguageCode(typeof userOrLanguage === "string"
    ? userOrLanguage
    : userOrLanguage && userOrLanguage.language_code);
  const shortLanguage = languageCode.split("-")[0];

  return messages[languageCode]
    || messages[shortLanguage]
    || messages.default
    || fallback
    || "";
}

function getButtonLabel(button, userOrLanguage) {
  return selectLocalizedText(button.labels, button.label, userOrLanguage);
}

function buttonToInlineMarkup(button, config, userOrLanguage) {
  const text = getButtonLabel(button, userOrLanguage);

  if (button.type === "callback") {
    return {
      text,
      callback_data: button.callbackData || button.id
    };
  }

  if (button.type === "url") {
    return {
      text,
      url: resolveWebsiteUrl(button.url, config)
    };
  }

  return {
    text,
    web_app: { url: buildLaunchUrl(config, button.url) }
  };
}

function groupButtonsByRow(buttons, mapper) {
  const rows = [];

  sortButtons(buttons).forEach((button) => {
    const rowIndex = Math.max(0, Number(button.row) || 0);

    rows[rowIndex] = rows[rowIndex] || [];
    rows[rowIndex].push(mapper(button));
  });

  return rows.filter(Boolean);
}

function getInlineButtons(config) {
  return (config.buttons || []).filter((button) => buttonMatchesPlacement(button, "inline"));
}

function getReplyButtons(config) {
  return (config.buttons || []).filter((button) => buttonMatchesPlacement(button, "reply") && button.type === "web_app");
}

function getMenuButton(config) {
  const buttons = config.buttons || [];
  const selected = buttons.find((button) => button.enabled !== false && button.id === config.menuButtonId && button.type === "web_app");

  if (selected) {
    return selected;
  }

  return buttons.find((button) => button.enabled !== false && button.type === "web_app") || null;
}

function inlineKeyboard(config, userOrLanguage) {
  const buttons = getInlineButtons(config);

  if (!buttons.length) {
    return undefined;
  }

  return {
    inline_keyboard: groupButtonsByRow(buttons, (button) => buttonToInlineMarkup(button, config, userOrLanguage))
  };
}

function replyKeyboard(config, userOrLanguage) {
  const buttons = getReplyButtons(config);

  if (!buttons.length) {
    return undefined;
  }

  return {
    keyboard: groupButtonsByRow(buttons, (button) => ({
      text: getButtonLabel(button, userOrLanguage),
      web_app: { url: buildLaunchUrl(config, button.url) }
    })),
    resize_keyboard: true,
    one_time_keyboard: false,
    input_field_placeholder: `Open ${config.appTitle || "website"}`
  };
}

function selectWelcomeText(config, user) {
  return selectLocalizedText(config.welcomeMessages, config.welcomeText, user);
}

function renderWelcomeText(config, user) {
  const useHtml = (config.welcomeParseMode || config.parseMode) === "HTML";
  const serialize = useHtml ? escapeHtml : String;
  const firstName = serialize(user && user.first_name ? user.first_name : "there");
  const lastName = serialize(user && user.last_name ? user.last_name : "");
  const username = serialize(user && user.username ? user.username : "");

  return String(selectWelcomeText(config, user))
    .replaceAll("{{first_name}}", firstName)
    .replaceAll("{{last_name}}", lastName)
    .replaceAll("{{username}}", username);
}

async function sendLaunchMessages(client, chatId, config, user) {
  return client.sendMessage(chatId, renderWelcomeText(config, user), inlineKeyboard(config, user), config.welcomeParseMode || config.parseMode);
}

function renderSsoFallbackText(config, user, result) {
  const useHtml = (config.welcomeParseMode || config.parseMode) === "HTML";
  const serialize = useHtml ? escapeHtml : String;
  const firstName = serialize(user && user.first_name ? user.first_name : "there");
  const appName = serialize(config.appTitle || config.websiteName || "the website");
  const username = serialize((result && result.username) || (user && user.username) || "");
  const accountText = username
    ? (useHtml ? ` for <b>${username}</b>` : ` for ${username}`)
    : "";

  return `Hello ${firstName},\n\nTelegram sign-in${accountText} is not completed yet. Tap a button below to open ${appName} inside Telegram and finish login.`;
}

function telegramLanguageCode(value) {
  const code = normalizeLanguageCode(value);

  if (!code || code === "default") {
    return "";
  }

  const shortCode = code.split("-")[0];

  return /^[a-z]{2}$/.test(shortCode) ? shortCode : "";
}

function getCommandDescription(command, userOrLanguage) {
  return selectLocalizedText(command.descriptions, command.description, userOrLanguage);
}

function botApiCommands(commands, userOrLanguage) {
  return (commands || [])
    .filter((command) => command && command.enabled !== false && command.command && getCommandDescription(command, userOrLanguage))
    .map((command) => ({
      command: String(command.command).replace(/^\//, "").toLowerCase().slice(0, 32),
      description: String(getCommandDescription(command, userOrLanguage)).slice(0, 256)
    }));
}

function botCommandPublishSets(commands) {
  const sets = [
    {
      languageCode: "",
      commands: botApiCommands(commands, "default")
    }
  ];
  const languageSources = new Map();

  (commands || []).forEach((command) => {
    if (!command || !command.descriptions || typeof command.descriptions !== "object") {
      return;
    }

    Object.keys(command.descriptions).forEach((language) => {
      const languageCode = telegramLanguageCode(language);

      if (languageCode && !languageSources.has(languageCode)) {
        languageSources.set(languageCode, language);
      }
    });
  });

  languageSources.forEach((sourceLanguage, languageCode) => {
    sets.push({
      languageCode,
      commands: botApiCommands(commands, sourceLanguage)
    });
  });

  return sets.filter((set) => set.commands.length);
}

function parseCommand(text) {
  const match = String(text || "").trim().match(/^\/([a-zA-Z0-9_]{1,32})(?:@[a-zA-Z0-9_]+)?(?:\s|$)/);

  return match ? match[1].toLowerCase() : "";
}

function getCommandConfig(config, text) {
  const commandName = parseCommand(text);

  if (!commandName) {
    return null;
  }

  return (config.commands || []).find((command) => {
    return command && command.enabled !== false && command.command === commandName;
  }) || null;
}

function renderTextTemplate(text, config, user) {
  const useHtml = (config.welcomeParseMode || config.parseMode) === "HTML";
  const serialize = useHtml ? escapeHtml : String;
  const firstName = serialize(user && user.first_name ? user.first_name : "there");
  const lastName = serialize(user && user.last_name ? user.last_name : "");
  const username = serialize(user && user.username ? user.username : "");

  return String(text || "")
    .replaceAll("{{first_name}}", firstName)
    .replaceAll("{{last_name}}", lastName)
    .replaceAll("{{username}}", username);
}

function singleUrlKeyboard(label, url) {
  return {
    inline_keyboard: [
      [
        {
          text: label,
          url
        }
      ]
    ]
  };
}

async function recordSsoAttempt(config, store, user) {
  if (!config.sso || !config.sso.serverLoginEnabled || !user || !user.id) {
    return {
      ok: false,
      skipped: true,
      reason: "Server-side SSO is disabled."
    };
  }

  let result;

  try {
    result = await attemptWebsiteSso(config, user);
  } catch (error) {
    result = {
      ok: false,
      error: error.message || "SSO request failed."
    };
  }

  if (store && store.upsertTelegramUser) {
    store.upsertTelegramUser(user, "sso", {
      ...config,
      ssoResult: result
    });
  }

  return result;
}

async function handleConfiguredCommand(client, chatId, config, user, command, store) {
  const action = command.action || "welcome";

  if (action === "none") {
    return { handled: true, type: "command", command: command.command, action };
  }

  if (action === "keyboard") {
    await client.sendMessage(
      chatId,
      renderTextTemplate(command.responseText || "The launch button is now on your Telegram keyboard.", config, user),
      replyKeyboard(config, user),
      config.welcomeParseMode || config.parseMode
    );
    return { handled: true, type: "command", command: command.command, action };
  }

  if (action === "password") {
    const url = resolveWebsiteUrl(command.buttonUrl || (config.sso && config.sso.passwordResetPath) || "/en/forgot-password", config, "Password reset URL");
    await client.sendMessage(
      chatId,
      renderTextTemplate(command.responseText || "Open password reset.", config, user),
      singleUrlKeyboard(command.buttonLabel || "Reset Password", url),
      config.welcomeParseMode || config.parseMode
    );
    return { handled: true, type: "command", command: command.command, action };
  }

  if (action === "custom") {
    await client.sendMessage(
      chatId,
      renderTextTemplate(command.responseText || renderWelcomeText(config, user), config, user),
      inlineKeyboard(config, user),
      config.welcomeParseMode || config.parseMode
    );
    return { handled: true, type: "command", command: command.command, action };
  }

  if (action === "sso") {
    const ssoResult = await recordSsoAttempt(config, store, user);

    if (ssoResult && !ssoResult.ok && !ssoResult.skipped) {
      await client.sendMessage(
        chatId,
        renderSsoFallbackText(config, user, ssoResult),
        inlineKeyboard(config, user),
        config.welcomeParseMode || config.parseMode
      );
      return { handled: true, type: "command", command: command.command, action, sso: "failed" };
    }

    await sendLaunchMessages(client, chatId, config, user);
    return { handled: true, type: "command", command: command.command, action };
  }

  await sendLaunchMessages(client, chatId, config, user);
  return { handled: true, type: "command", command: command.command, action: "welcome" };
}

async function handleTelegramUpdate(update, config, store) {
  const client = new TelegramBotApi(config.telegramBotToken);
  const callbackQuery = update.callback_query;
  const message = update.message || update.edited_message;

  if (callbackQuery) {
    if (callbackQuery.from && callbackQuery.from.id) {
      store.upsertTelegramUser(callbackQuery.from, "callback_query", config);
    }

    await client.answerCallbackQuery(callbackQuery.id, "Done");

    if (callbackQuery.message && callbackQuery.message.chat) {
      await sendLaunchMessages(client, callbackQuery.message.chat.id, config, callbackQuery.from);
    }

    return { handled: true, type: "callback_query" };
  }

  if (!message || !message.chat) {
    return { handled: false };
  }

  if (message.web_app_data) {
    await client.sendMessage(
      message.chat.id,
      `Received website data: <code>${escapeHtml(message.web_app_data.data || "")}</code>`,
      undefined,
      "HTML"
    );
    return { handled: true, type: "web_app_data" };
  }

  const text = (message.text || "").trim();

  if (message.from && message.from.id) {
    store.upsertTelegramUser(message.from, "bot_message", config);
  }

  if (text === "/start" || text.startsWith("/start ")) {
    const command = getCommandConfig(config, text) || {
      command: "start",
      action: "sso",
      responseText: "",
      enabled: true
    };

    return handleConfiguredCommand(client, message.chat.id, config, message.from, command, store);
  }

  const command = getCommandConfig(config, text);

  if (command) {
    return handleConfiguredCommand(client, message.chat.id, config, message.from, command, store);
  }

  return { handled: false };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = {
  TelegramBotApi,
  botCommandPublishSets,
  botApiCommands,
  buildLaunchUrl,
  buildWebhookUrl,
  getButtonLabel,
  getCommandDescription,
  getCommandConfig,
  getMenuButton,
  handleTelegramUpdate,
  inlineKeyboard,
  replyKeyboard,
  renderSsoFallbackText,
  renderWelcomeText,
  resolveWebsiteUrl,
  sendLaunchMessages
};
