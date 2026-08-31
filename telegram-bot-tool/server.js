"use strict";

const fs = require("fs");
const crypto = require("crypto");
const http = require("http");
const path = require("path");
const { URL } = require("url");
const { createStore, sanitizeConfig, selectConfig } = require("./src/config-store");
const { TelegramBotApi, buildLaunchUrl, buildWebhookUrl, getMenuButton, handleTelegramUpdate, inlineKeyboard } = require("./src/telegram-client");
const { attemptWebsiteSso, buildSsoPreview } = require("./src/website-sso");
const {
  createSessionToken,
  validateLoginWidgetPayload,
  validateWebAppInitData,
  verifySessionToken
} = require("./src/telegram-auth");

const ROOT_DIR = __dirname;
const PUBLIC_DIR = path.join(ROOT_DIR, "public");

loadDotEnv(path.join(ROOT_DIR, ".env"));

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "127.0.0.1";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || crypto.randomBytes(24).toString("base64url");
const store = createStore(ROOT_DIR);

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

function loadDotEnv(filePath) {
  let text = "";

  try {
    text = fs.readFileSync(filePath, "utf8");
  } catch (_error) {
    return;
  }

  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separator = trimmed.indexOf("=");

    if (separator <= 0) {
      return;
    }

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}

function send(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, {
    "cache-control": "no-store",
    ...headers
  });
  res.end(body);
}

function sendJson(res, statusCode, value) {
  send(res, statusCode, `${JSON.stringify(value, null, 2)}\n`, {
    "content-type": "application/json; charset=utf-8"
  });
}

function sendError(res, statusCode, message) {
  sendJson(res, statusCode, {
    ok: false,
    error: message
  });
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on("data", (chunk) => {
      size += chunk.length;

      if (size > 1024 * 1024) {
        reject(new Error("Request body is too large."));
        req.destroy();
        return;
      }

      chunks.push(chunk);
    });

    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      const contentType = req.headers["content-type"] || "";

      if (!raw) {
        resolve({});
        return;
      }

      if (contentType.includes("application/x-www-form-urlencoded")) {
        resolve(Object.fromEntries(new URLSearchParams(raw).entries()));
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (_error) {
        reject(new Error("Request body must be valid JSON."));
      }
    });

    req.on("error", reject);
  });
}

function isAdminAuthorized(req) {
  const headerToken = req.headers["x-admin-token"] || "";
  const authorization = req.headers.authorization || "";
  const bearerToken = authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : "";

  return headerToken === ADMIN_TOKEN || bearerToken === ADMIN_TOKEN;
}

function requireAdmin(req, res) {
  if (isAdminAuthorized(req)) {
    return true;
  }

  sendError(res, 401, "Admin token is required. Send it as X-Admin-Token or Authorization: Bearer <token>.");
  return false;
}

function serveStatic(res, filePath) {
  const safePath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, "");
  const absolutePath = path.join(PUBLIC_DIR, safePath);

  if (!absolutePath.startsWith(PUBLIC_DIR)) {
    sendError(res, 403, "Forbidden.");
    return;
  }

  fs.readFile(absolutePath, (error, data) => {
    if (error) {
      sendError(res, 404, "File not found.");
      return;
    }

    send(res, 200, data, {
      "content-type": MIME_TYPES[path.extname(absolutePath)] || "application/octet-stream"
    });
  });
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function publicConfig(config) {
  return {
    appTitle: config.appTitle,
    websiteId: config.websiteId,
    botId: config.botId,
    botLabel: config.botLabel,
    websiteUrl: config.websiteUrl,
    launchMode: config.launchMode,
    miniAppPath: config.miniAppPath,
    buttons: config.buttons
  };
}

function idsFromRequest(requestUrl, body = {}) {
  return {
    websiteId: body.websiteId || requestUrl.searchParams.get("websiteId") || "",
    botId: body.botId || requestUrl.searchParams.get("botId") || ""
  };
}

function getSelection(config, requestUrl, body = {}) {
  const ids = idsFromRequest(requestUrl, body);

  return selectConfig(config, ids.websiteId, ids.botId);
}

function selectionSummary(selection) {
  return {
    websiteId: selection.website.id,
    websiteName: selection.website.name,
    botId: selection.bot.id,
    botLabel: selection.bot.label,
    botUsername: selection.bot.username || ""
  };
}

function isMaskedToken(value) {
  return String(value || "").includes("...");
}

function getSafeLaunchUrl(config) {
  try {
    return buildLaunchUrl(config);
  } catch (_error) {
    return "";
  }
}

function getLegacyWebhookUrl(config) {
  try {
    const publicBaseUrl = new URL(config.publicBaseUrl);
    const webhookPath = config.webhookPath || "/telegram/webhook";

    if (publicBaseUrl.protocol !== "https:") {
      return "";
    }

    publicBaseUrl.pathname = `${webhookPath.replace(/\/+$/, "")}/${encodeURIComponent(config.webhookSecretToken || "")}`;
    publicBaseUrl.search = "";
    publicBaseUrl.hash = "";
    return publicBaseUrl.toString();
  } catch (_error) {
    return "";
  }
}

function updateBotMetadata(config, selection, patch) {
  const nextConfig = clone(config);
  const selected = selectConfig(nextConfig, selection.website.id, selection.bot.id);

  Object.assign(selected.bot, patch);
  selected.website.activeBotId = selected.bot.id;
  nextConfig.activeWebsiteId = selected.website.id;
  nextConfig.activeBotId = selected.bot.id;

  return store.saveConfig(nextConfig);
}

async function setupBot(config) {
  if (!config.telegramBotToken) {
    throw new Error("Telegram bot token is required.");
  }

  const client = new TelegramBotApi(config.telegramBotToken);
  const menuButton = getMenuButton(config);
  const launchUrl = menuButton ? buildLaunchUrl(config, menuButton.url) : buildLaunchUrl(config);
  const bot = await client.getMe();
  const commandMenus = await client.publishCommandMenus(config.commands);


  if (menuButton) {
    await client.setChatMenuButton(config.menuButtonText || menuButton.label, launchUrl);
  }

  let webhook = null;
  let webhookSkippedReason = "";

  if (config.publicBaseUrl && config.webhookSecretToken) {
    webhook = await client.setWebhook(buildWebhookUrl(config), config.webhookSecretToken);
  } else {
    webhookSkippedReason = "Webhook was not set because Public Bot Tool URL is empty. Telegram cannot send /start updates to a localhost URL.";
  }

  return {
    bot,
    commandMenus,
    launchUrl,
    menuButton: menuButton ? {
      id: menuButton.id,
      label: menuButton.label,
      url: launchUrl
    } : null,
    webhook,
    webhookSkippedReason
  };
}

async function getBotStatus(config) {
  const status = {
    websiteId: config.websiteId,
    botId: config.botId,
    botLabel: config.botLabel,
    tokenSaved: Boolean(config.telegramBotToken),
    publicBaseUrlSet: Boolean(config.publicBaseUrl),
    launchUrl: "",
    webhookUrl: "",
    bot: null,
    webhook: null,
    connected: false,
    nextStep: ""
  };

  if (!config.telegramBotToken) {
    status.nextStep = "Paste a Telegram bot token for this selected bot, save config, then verify the bot.";
    return status;
  }

  const client = new TelegramBotApi(config.telegramBotToken);
  status.bot = await client.getMe();

  try {
    status.webhook = await client.getWebhookInfo();
  } catch (error) {
    status.webhook = {
      error: error.message
    };
  }

  try {
    const menuButton = getMenuButton(config);
    status.launchUrl = menuButton ? buildLaunchUrl(config, menuButton.url) : buildLaunchUrl(config);
  } catch (error) {
    status.launchUrlError = error.message;
  }

  try {
    status.webhookUrl = config.publicBaseUrl ? buildWebhookUrl(config) : "";
  } catch (error) {
    status.webhookUrlError = error.message;
  }

  if (!config.publicBaseUrl) {
    status.connected = false;
    status.nextStep = "Token is valid, but the tool is local only. Set Public Bot Tool URL to a public HTTPS URL, then publish to Telegram.";
    return status;
  }

  if (!status.webhook || !status.webhook.url) {
    status.connected = false;
    status.nextStep = "Public URL is set, but Telegram webhook is not active. Press Publish to Telegram.";
    return status;
  }

  const acceptedWebhookUrls = [status.webhookUrl, getLegacyWebhookUrl(config)].filter(Boolean);

  status.connected = acceptedWebhookUrls.includes(status.webhook.url);
  status.nextStep = status.connected
    ? (status.webhook.url === status.webhookUrl
      ? "Bot token and webhook are connected for this selected bot."
      : "Bot is connected on the old webhook path. Press Publish to Telegram once to switch it to the per-bot webhook URL.")
    : "Telegram has a webhook, but it points to a different URL. Press Publish to Telegram for the selected bot.";
  return status;
}

function pathSegmentsAfter(basePath, requestPath) {
  const base = (basePath || "/telegram/webhook").replace(/\/+$/, "") || "/";

  if (requestPath !== base && !requestPath.startsWith(`${base}/`)) {
    return null;
  }

  return requestPath
    .slice(base.length)
    .split("/")
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment));
}

function findWebhookSelection(config, requestPath) {
  for (const website of config.websites || []) {
    const segments = pathSegmentsAfter(website.webhookPath, requestPath);
    const activeBot = website.bots.find((entry) => entry.id === website.activeBotId) || website.bots[0];

    if (!segments || !segments.length || !activeBot) {
      continue;
    }

    if (segments.length >= 3 && segments[0] === website.id) {
      if (activeBot.id === segments[1]) {
        return {
          secretFromPath: segments[2],
          ...selectConfig(config, website.id, activeBot.id)
        };
      }
    }

    if (segments.length >= 2) {
      if (activeBot.id === segments[0]) {
        return {
          secretFromPath: segments[1],
          ...selectConfig(config, website.id, activeBot.id)
        };
      }
    }

    if (activeBot.webhookSecretToken === segments[0]) {
      return {
        secretFromPath: segments[0],
        ...selectConfig(config, website.id, activeBot.id)
      };
    }
  }

  return null;
}

async function route(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const config = store.getConfig();

  if (req.method === "GET" && requestUrl.pathname === "/") {
    serveStatic(res, "admin.html");
    return;
  }

  if (req.method === "GET" && requestUrl.pathname === "/health") {
    sendJson(res, 200, {
      ok: true,
      app: "telegram-bot-tool"
    });
    return;
  }

  if (req.method === "GET" && requestUrl.pathname.startsWith("/public/")) {
    serveStatic(res, requestUrl.pathname.replace(/^\/public\//, ""));
    return;
  }

  if (req.method === "GET" && requestUrl.pathname === "/miniapp") {
    serveStatic(res, "miniapp.html");
    return;
  }

  if (req.method === "GET" && requestUrl.pathname === "/api/public-config") {
    const selection = getSelection(config, requestUrl);

    sendJson(res, 200, {
      ok: true,
      config: publicConfig(selection.runtimeConfig)
    });
    return;
  }

  if (req.method === "GET" && requestUrl.pathname === "/api/config") {
    if (!requireAdmin(req, res)) return;
    const selection = getSelection(config, requestUrl);

    sendJson(res, 200, {
      ok: true,
      config: sanitizeConfig(config, { revealTokens: true }),
      selection: selectionSummary(selection),
      launchUrl: getSafeLaunchUrl(selection.runtimeConfig)
    });
    return;
  }

  if (req.method === "POST" && requestUrl.pathname === "/api/config") {
    if (!requireAdmin(req, res)) return;
    const body = await readRequestBody(req);
    const nextConfig = Array.isArray(body.websites)
      ? {
        activeWebsiteId: body.activeWebsiteId,
        activeBotId: body.activeBotId,
        websites: body.websites
      }
      : body;
    const savedConfig = store.saveConfig(nextConfig);
    const selection = getSelection(savedConfig, requestUrl, body);

    sendJson(res, 200, {
      ok: true,
      config: sanitizeConfig(savedConfig, { revealTokens: true }),
      selection: selectionSummary(selection),
      launchUrl: getSafeLaunchUrl(selection.runtimeConfig)
    });
    return;
  }

  if (req.method === "POST" && requestUrl.pathname === "/api/bot/verify") {
    if (!requireAdmin(req, res)) return;
    const body = await readRequestBody(req);
    const configCandidate = body.config && Array.isArray(body.config.websites) ? body.config : config;
    const selection = selectConfig(configCandidate, body.websiteId || requestUrl.searchParams.get("websiteId"), body.botId || requestUrl.searchParams.get("botId"));
    const storedSelection = getSelection(config, requestUrl, body);
    const candidateToken = String(body.telegramBotToken || selection.runtimeConfig.telegramBotToken || "").trim();
    const token = isMaskedToken(candidateToken)
      ? storedSelection.runtimeConfig.telegramBotToken
      : candidateToken;
    const client = new TelegramBotApi(token);
    const bot = await client.getMe();
    const savedConfig = updateBotMetadata(configCandidate, selection, {
      telegramBotToken: token,
      username: bot.username || selection.bot.username
    });

    sendJson(res, 200, {
      ok: true,
      bot,
      config: sanitizeConfig(savedConfig, { revealTokens: true })
    });
    return;
  }

  if (req.method === "POST" && requestUrl.pathname === "/api/bot/setup") {
    if (!requireAdmin(req, res)) return;
    const body = await readRequestBody(req);
    const current = store.saveConfig(config);
    const selection = getSelection(current, requestUrl, body);
    const result = await setupBot(selection.runtimeConfig);
    const savedConfig = updateBotMetadata(current, selection, {
      username: result.bot.username || selection.bot.username
    });

    sendJson(res, 200, {
      ok: true,
      ...result,
      config: sanitizeConfig(savedConfig, { revealTokens: true }),
      webhookUrl: selection.runtimeConfig.publicBaseUrl ? buildWebhookUrl(selection.runtimeConfig) : ""
    });
    return;
  }

  if (req.method === "GET" && requestUrl.pathname === "/api/bot/status") {
    if (!requireAdmin(req, res)) return;
    const selection = getSelection(config, requestUrl);
    const result = await getBotStatus(selection.runtimeConfig);

    sendJson(res, 200, {
      ok: true,
      status: result
    });
    return;
  }

  if (req.method === "POST" && requestUrl.pathname === "/api/bot/delete-webhook") {
    if (!requireAdmin(req, res)) return;
    const body = await readRequestBody(req);
    const selection = getSelection(config, requestUrl, body);
    const client = new TelegramBotApi(selection.runtimeConfig.telegramBotToken);
    const result = await client.deleteWebhook();

    sendJson(res, 200, {
      ok: true,
      result
    });
    return;
  }

  if (req.method === "POST" && requestUrl.pathname === "/api/bot/send-test") {
    if (!requireAdmin(req, res)) return;
    const body = await readRequestBody(req);
    const selection = getSelection(config, requestUrl, body);
    const chatId = body.chatId;

    if (!chatId) {
      throw new Error("chatId is required.");
    }

    const client = new TelegramBotApi(selection.runtimeConfig.telegramBotToken);
    const result = await client.sendMessage(
      chatId,
      body.message || selection.runtimeConfig.welcomeText || "Telegram bot is connected.",
      inlineKeyboard(selection.runtimeConfig),
      selection.runtimeConfig.welcomeParseMode
    );

    sendJson(res, 200, {
      ok: true,
      result
    });
    return;
  }

  if (req.method === "POST" && requestUrl.pathname === "/api/sso/preview") {
    if (!requireAdmin(req, res)) return;
    const body = await readRequestBody(req);
    const selection = getSelection(config, requestUrl, body);
    const user = {
      id: body.telegramId || 10001,
      first_name: body.firstName || "Telegram",
      last_name: body.lastName || "User",
      username: body.username || "telegram_user",
      language_code: body.language || "en"
    };

    sendJson(res, 200, {
      ok: true,
      preview: buildSsoPreview(selection.runtimeConfig, user)
    });
    return;
  }

  if (req.method === "POST" && requestUrl.pathname === "/api/sso/retry") {
    if (!requireAdmin(req, res)) return;
    const body = await readRequestBody(req);
    const selection = getSelection(config, requestUrl, body);
    const telegramId = String(body.telegramId || "").trim();

    if (!telegramId) {
      sendError(res, 400, "telegramId is required.");
      return;
    }

    const user = store.getUsers({
      websiteId: selection.website.id,
      botId: selection.bot.id
    }).find((entry) => String(entry.id) === telegramId);

    if (!user) {
      sendError(res, 404, "Telegram user was not found for the selected website bot.");
      return;
    }

    let ssoResult;

    try {
      ssoResult = await attemptWebsiteSso(selection.runtimeConfig, user);
    } catch (error) {
      ssoResult = {
        ok: false,
        error: error.message || "SSO request failed."
      };
    }

    const updatedUser = store.upsertTelegramUser(user, "sso", {
      ...selection.runtimeConfig,
      ssoResult
    });

    sendJson(res, 200, {
      ok: true,
      user: updatedUser,
      ssoResult
    });
    return;
  }

  if (req.method === "GET" && requestUrl.pathname === "/api/users") {
    if (!requireAdmin(req, res)) return;
    const selection = getSelection(config, requestUrl);
    const showAll = requestUrl.searchParams.get("all") === "1";

    sendJson(res, 200, {
      ok: true,
      users: store.getUsers(showAll ? {} : {
        websiteId: selection.website.id,
        botId: selection.bot.id
      })
    });
    return;
  }

  if (req.method === "GET" && requestUrl.pathname === "/api/sso/events") {
    if (!requireAdmin(req, res)) return;
    const selection = getSelection(config, requestUrl);
    const showAll = requestUrl.searchParams.get("all") === "1";
    const limit = Number(requestUrl.searchParams.get("limit")) || 200;

    sendJson(res, 200, {
      ok: true,
      events: store.getSsoEvents(showAll ? { limit } : {
        websiteId: selection.website.id,
        botId: selection.bot.id,
        limit
      })
    });
    return;
  }

  if (req.method === "POST" && requestUrl.pathname === "/api/auth/telegram") {
    const body = await readRequestBody(req);
    const selection = getSelection(config, requestUrl, body);
    const validation = validateWebAppInitData(body.initData, selection.runtimeConfig.telegramBotToken);

    if (!validation.ok || !validation.user) {
      sendError(res, 401, validation.reason || "Telegram authorization failed.");
      return;
    }

    const user = store.upsertTelegramUser(validation.user, "mini_app", selection.runtimeConfig);
    const sessionToken = createSessionToken(user, selection.runtimeConfig.telegramBotToken);

    sendJson(res, 200, {
      ok: true,
      user,
      sessionToken
    });
    return;
  }

  if (req.method === "POST" && requestUrl.pathname === "/api/auth/session") {
    const body = await readRequestBody(req);
    const selection = getSelection(config, requestUrl, body);
    const validation = verifySessionToken(body.sessionToken, selection.runtimeConfig.telegramBotToken);

    if (!validation.ok) {
      sendError(res, 401, validation.reason);
      return;
    }

    sendJson(res, 200, {
      ok: true,
      session: validation.session
    });
    return;
  }

  if (req.method === "GET" && requestUrl.pathname === "/telegram-login") {
    const selection = getSelection(config, requestUrl);
    const loginPayload = Object.fromEntries(requestUrl.searchParams.entries());

    delete loginPayload.websiteId;
    delete loginPayload.botId;

    const validation = validateLoginWidgetPayload(loginPayload, selection.runtimeConfig.telegramBotToken);

    if (!validation.ok || !validation.user) {
      sendError(res, 401, validation.reason || "Telegram login failed.");
      return;
    }

    store.upsertTelegramUser(validation.user, "login_widget", selection.runtimeConfig);
    send(res, 302, "", {
      location: selection.runtimeConfig.websiteUrl
    });
    return;
  }

  if (req.method === "POST") {
    const webhookSelection = findWebhookSelection(config, requestUrl.pathname);

    if (webhookSelection) {
      const runtimeConfig = webhookSelection.runtimeConfig;
      const secretFromHeader = req.headers["x-telegram-bot-api-secret-token"] || "";

      if (runtimeConfig.webhookSecretToken && webhookSelection.secretFromPath !== runtimeConfig.webhookSecretToken) {
        sendError(res, 403, "Invalid webhook path secret.");
        return;
      }

      if (runtimeConfig.webhookSecretToken && secretFromHeader && secretFromHeader !== runtimeConfig.webhookSecretToken) {
        sendError(res, 403, "Invalid webhook header secret.");
        return;
      }

      const update = await readRequestBody(req);
      const result = await handleTelegramUpdate(update, runtimeConfig, store);

      sendJson(res, 200, {
        ok: true,
        result
      });
      return;
    }
  }

  sendError(res, 404, "Not found.");
}

const server = http.createServer((req, res) => {
  route(req, res).catch((error) => {
    sendError(res, 500, error.message || "Internal server error.");
  });
});

server.on("error", (error) => {
  console.error(`Unable to start server on ${HOST}:${PORT}: ${error.message}`);
  process.exitCode = 1;
});

server.listen(PORT, HOST, () => {
  const displayHost = HOST === "0.0.0.0" ? "localhost" : HOST;
  console.log(`Telegram bot tool running on http://${displayHost}:${PORT}`);
  if (!process.env.ADMIN_TOKEN) {
    console.log(`Admin token for this run: ${ADMIN_TOKEN}`);
  }
});
