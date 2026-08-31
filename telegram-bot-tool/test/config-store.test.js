"use strict";

const assert = require("assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const { createStore, normalizeConfig, sanitizeConfig, selectConfig } = require("../src/config-store");

test("migrates legacy single-bot config into one website with one bot", () => {
  const config = normalizeConfig({
    appTitle: "EsportesNew",
    websiteUrl: "https://esportesnew.com/",
    publicBaseUrl: "https://bot.example.com",
    telegramBotToken: "123456:secret-token",
    webhookSecretToken: "webhook-secret",
    buttons: [
      {
        id: "play",
        label: "Play",
        type: "web_app",
        placement: "inline",
        url: "/",
        row: 0,
        enabled: true
      }
    ]
  });
  const selection = selectConfig(config);

  assert.equal(config.websites.length, 1);
  assert.equal(config.websites[0].bots.length, 1);
  assert.equal(selection.runtimeConfig.websiteUrl, "https://esportesnew.com/");
  assert.equal(selection.runtimeConfig.telegramBotToken, "123456:secret-token");
  assert.equal(selection.runtimeConfig.webhookSecretToken, "webhook-secret");
});

test("saving sanitized config preserves stored bot tokens", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "telegram-config-store-"));
  const store = createStore(dir);
  const saved = store.saveConfig({
    appTitle: "EsportesNew",
    publicBaseUrl: "https://bot.example.com",
    telegramBotToken: "123456:secret-token"
  });
  const sanitized = sanitizeConfig(saved);

  sanitized.websites[0].bots[0].label = "Renamed bot";

  const resaved = store.saveConfig(sanitized);
  const selection = selectConfig(resaved);

  assert.equal(selection.bot.label, "Renamed bot");
  assert.equal(selection.runtimeConfig.telegramBotToken, "123456:secret-token");
});

test("sanitized config can reveal tokens only when admin route asks for it", () => {
  const config = normalizeConfig({
    telegramBotToken: "123456:secret-token"
  });
  const masked = sanitizeConfig(config);
  const revealed = sanitizeConfig(config, { revealTokens: true });

  assert.equal(masked.websites[0].bots[0].telegramBotToken, "123456...oken");
  assert.equal(revealed.websites[0].bots[0].telegramBotToken, "123456:secret-token");
});

test("uses one connected bot per website and leaves old bot records inert", () => {
  const config = normalizeConfig({
    activeWebsiteId: "site",
    activeBotId: "second",
    websites: [
      {
        id: "site",
        name: "Site",
        websiteUrl: "https://example.com/",
        activeBotId: "second",
        bots: [
          {
            id: "first",
            label: "First",
            telegramBotToken: "111:first"
          },
          {
            id: "second",
            label: "Second",
            telegramBotToken: "222:second",
            buttons: [
              {
                id: "open",
                label: "Open",
                type: "web_app",
                placement: "inline",
                url: "/second",
                row: 0,
                enabled: true
              }
            ]
          }
        ]
      }
    ]
  });
  const first = selectConfig(config, "site", "first");
  const second = selectConfig(config, "site", "second");

  assert.equal(config.websites[0].bots.length, 2);
  assert.equal(second.runtimeConfig.telegramBotToken, "222:second");
  assert.equal(second.runtimeConfig.buttons[0].url, "/second");
  assert.equal(first.runtimeConfig.telegramBotToken, "222:second");
});

test("normalizes localized button labels, commands, and sso config", () => {
  const config = normalizeConfig({
    websites: [
      {
        id: "site",
        name: "Site",
        websiteUrl: "https://example.com/",
        bots: [
          {
            id: "site-bot",
            buttons: [
              {
                id: "deposit",
                label: "Deposit",
                labels: {
                  default: "Deposit",
                  es: "Deposito"
                },
                url: "/deposit"
              }
            ],
            commands: [
              {
                command: "/login",
                description: "Sign in",
                action: "sso",
                enabled: true,
                responseText: "Open app"
              }
            ],
            sso: {
              enabled: true,
              usernameTemplate: "tg_{{telegram_username}}",
              serverLoginEnabled: true
            }
          }
        ]
      }
    ]
  });
  const selection = selectConfig(config, "site");

  assert.equal(selection.runtimeConfig.buttons[0].labels.es, "Deposito");
  assert.equal(selection.runtimeConfig.commands[0].command, "login");
  assert.equal(selection.runtimeConfig.commands[0].action, "sso");
  assert.equal(selection.runtimeConfig.sso.usernameTemplate, "tg_{{telegram_username}}");
  assert.equal(selection.runtimeConfig.sso.loginEndpoint, "/api/identity/api/v1/playeraccount/login");
});
