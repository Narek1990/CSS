"use strict";

const crypto = require("crypto");

function fixedTimeEqual(left, right, encoding = "hex") {
  const leftBuffer = Buffer.from(left || "", encoding);
  const rightBuffer = Buffer.from(right || "", encoding);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function toSortedDataCheckString(params, ignoredKeys) {
  const ignored = new Set(ignoredKeys);
  const pairs = [];

  for (const [key, value] of params.entries()) {
    if (!ignored.has(key)) {
      pairs.push(`${key}=${value}`);
    }
  }

  return pairs.sort().join("\n");
}

function parseMaybeJson(value) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (_error) {
    return null;
  }
}

function normalizeBotToken(botToken) {
  const token = String(botToken || "").trim();

  if (!token) {
    throw new Error("Telegram bot token is required.");
  }

  return token;
}

function validateFreshAuthDate(authDateValue, maxAgeSeconds, nowSeconds) {
  const authDate = Number(authDateValue);

  if (!Number.isFinite(authDate) || authDate <= 0) {
    return {
      ok: false,
      reason: "Telegram auth_date is missing or invalid."
    };
  }

  if (authDate > nowSeconds + 60) {
    return {
      ok: false,
      reason: "Telegram auth_date is in the future."
    };
  }

  if (maxAgeSeconds > 0 && nowSeconds - authDate > maxAgeSeconds) {
    return {
      ok: false,
      reason: "Telegram init data has expired."
    };
  }

  return { ok: true, authDate };
}

function validateWebAppInitData(initData, botToken, options = {}) {
  const token = normalizeBotToken(botToken);
  const params = new URLSearchParams(String(initData || ""));
  const hash = params.get("hash") || "";
  const maxAgeSeconds = Number.isFinite(options.maxAgeSeconds)
    ? options.maxAgeSeconds
    : 24 * 60 * 60;
  const nowSeconds = Number.isFinite(options.nowSeconds)
    ? options.nowSeconds
    : Math.floor(Date.now() / 1000);

  if (!hash) {
    return {
      ok: false,
      reason: "Telegram init data hash is missing."
    };
  }

  const fresh = validateFreshAuthDate(params.get("auth_date"), maxAgeSeconds, nowSeconds);

  if (!fresh.ok) {
    return fresh;
  }

  const dataCheckString = toSortedDataCheckString(params, ["hash"]);
  const secretKey = crypto.createHmac("sha256", "WebAppData").update(token).digest();
  const expectedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  if (!fixedTimeEqual(hash, expectedHash)) {
    return {
      ok: false,
      reason: "Telegram init data signature is invalid."
    };
  }

  const fields = Object.fromEntries(params.entries());
  const user = parseMaybeJson(params.get("user"));

  return {
    ok: true,
    authDate: fresh.authDate,
    queryId: params.get("query_id") || "",
    user,
    fields
  };
}

function validateLoginWidgetPayload(payload, botToken, options = {}) {
  const token = normalizeBotToken(botToken);
  const params = new URLSearchParams();
  const maxAgeSeconds = Number.isFinite(options.maxAgeSeconds)
    ? options.maxAgeSeconds
    : 24 * 60 * 60;
  const nowSeconds = Number.isFinite(options.nowSeconds)
    ? options.nowSeconds
    : Math.floor(Date.now() / 1000);

  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const hash = params.get("hash") || "";

  if (!hash) {
    return {
      ok: false,
      reason: "Telegram login hash is missing."
    };
  }

  const fresh = validateFreshAuthDate(params.get("auth_date"), maxAgeSeconds, nowSeconds);

  if (!fresh.ok) {
    return fresh;
  }

  const dataCheckString = toSortedDataCheckString(params, ["hash"]);
  const secretKey = crypto.createHash("sha256").update(token).digest();
  const expectedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  if (!fixedTimeEqual(hash, expectedHash)) {
    return {
      ok: false,
      reason: "Telegram login signature is invalid."
    };
  }

  return {
    ok: true,
    authDate: fresh.authDate,
    user: {
      id: Number(params.get("id")),
      first_name: params.get("first_name") || "",
      last_name: params.get("last_name") || "",
      username: params.get("username") || "",
      photo_url: params.get("photo_url") || ""
    },
    fields: Object.fromEntries(params.entries())
  };
}

function signSession(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function createSessionToken(user, botToken, ttlSeconds = 7 * 24 * 60 * 60) {
  const token = normalizeBotToken(botToken);
  const nowSeconds = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    sub: String(user.id),
    username: user.username || "",
    name: [user.first_name, user.last_name].filter(Boolean).join(" "),
    iat: nowSeconds,
    exp: nowSeconds + ttlSeconds
  })).toString("base64url");
  const signature = signSession(payload, token);

  return `${payload}.${signature}`;
}

function verifySessionToken(sessionToken, botToken) {
  const token = normalizeBotToken(botToken);
  const [payload, signature] = String(sessionToken || "").split(".");

  if (!payload || !signature) {
    return {
      ok: false,
      reason: "Session token is malformed."
    };
  }

  const expectedSignature = signSession(payload, token);

  if (!fixedTimeEqual(signature, expectedSignature, "base64url")) {
    return {
      ok: false,
      reason: "Session token signature is invalid."
    };
  }

  let decoded;

  try {
    decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch (_error) {
    return {
      ok: false,
      reason: "Session token payload is invalid."
    };
  }

  if (!decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) {
    return {
      ok: false,
      reason: "Session token has expired."
    };
  }

  return {
    ok: true,
    session: decoded
  };
}

module.exports = {
  createSessionToken,
  validateLoginWidgetPayload,
  validateWebAppInitData,
  verifySessionToken
};
