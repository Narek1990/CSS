"use strict";

const assert = require("assert/strict");
const crypto = require("crypto");
const test = require("node:test");
const {
  createSessionToken,
  validateLoginWidgetPayload,
  validateWebAppInitData,
  verifySessionToken
} = require("../src/telegram-auth");

const BOT_TOKEN = "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11";

function signedWebAppInitData(fields, botToken) {
  const params = new URLSearchParams();

  Object.entries(fields).forEach(([key, value]) => {
    params.set(key, typeof value === "string" ? value : JSON.stringify(value));
  });

  const dataCheckString = Array.from(params.entries())
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join("\n");
  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const hash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  params.set("hash", hash);

  return params.toString();
}

function signedLoginPayload(fields, botToken) {
  const params = new URLSearchParams();

  Object.entries(fields).forEach(([key, value]) => {
    params.set(key, String(value));
  });

  const dataCheckString = Array.from(params.entries())
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join("\n");
  const secretKey = crypto.createHash("sha256").update(botToken).digest();
  const hash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  return {
    ...fields,
    hash
  };
}

test("validates signed Telegram Web App init data", () => {
  const initData = signedWebAppInitData({
    auth_date: 1733509682,
    query_id: "AAHdF6IQAAAAAN0XohDhrOrc",
    user: {
      id: 42,
      first_name: "Narek",
      username: "narek"
    }
  }, BOT_TOKEN);
  const result = validateWebAppInitData(initData, BOT_TOKEN, {
    nowSeconds: 1733509700,
    maxAgeSeconds: 3600
  });

  assert.equal(result.ok, true);
  assert.equal(result.user.id, 42);
  assert.equal(result.user.username, "narek");
});

test("rejects tampered Telegram Web App init data", () => {
  const initData = signedWebAppInitData({
    auth_date: 1733509682,
    user: { id: 42, first_name: "Narek" }
  }, BOT_TOKEN).replace("Narek", "Other");
  const result = validateWebAppInitData(initData, BOT_TOKEN, {
    nowSeconds: 1733509700,
    maxAgeSeconds: 3600
  });

  assert.equal(result.ok, false);
});

test("validates Telegram login widget payload", () => {
  const payload = signedLoginPayload({
    id: 42,
    first_name: "Narek",
    username: "narek",
    auth_date: 1733509682
  }, BOT_TOKEN);
  const result = validateLoginWidgetPayload(payload, BOT_TOKEN, {
    nowSeconds: 1733509700,
    maxAgeSeconds: 3600
  });

  assert.equal(result.ok, true);
  assert.equal(result.user.id, 42);
});

test("creates and verifies local Telegram session token", () => {
  const sessionToken = createSessionToken({
    id: 42,
    first_name: "Narek",
    username: "narek"
  }, BOT_TOKEN);
  const result = verifySessionToken(sessionToken, BOT_TOKEN);

  assert.equal(result.ok, true);
  assert.equal(result.session.sub, "42");
});
