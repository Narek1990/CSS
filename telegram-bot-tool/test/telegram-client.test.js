"use strict";

const assert = require("assert/strict");
const test = require("node:test");
const {
  buildLaunchUrl,
  getMenuButton,
  inlineKeyboard,
  renderWelcomeText,
  replyKeyboard
} = require("../src/telegram-client");

const config = {
  websiteUrl: "https://esportesnew.com/",
  publicBaseUrl: "https://bot.esportesnew.com",
  launchMode: "direct",
  menuButtonId: "deposit",
  buttons: [
    {
      id: "play",
      label: "Play",
      type: "web_app",
      placement: "inline",
      url: "/",
      row: 0,
      enabled: true
    },
    {
      id: "deposit",
      label: "Deposit",
      type: "web_app",
      placement: "both",
      url: "/en/home?m=deposit",
      row: 1,
      enabled: true
    },
    {
      id: "history",
      label: "History",
      type: "url",
      placement: "inline",
      url: "/en/profile/transactions",
      row: 2,
      enabled: true
    },
    {
      id: "disabled",
      label: "Disabled",
      type: "web_app",
      placement: "inline",
      url: "/disabled",
      row: 3,
      enabled: false
    }
  ]
};

test("builds inline buttons from managed config", () => {
  const keyboard = inlineKeyboard(config);

  assert.deepEqual(keyboard.inline_keyboard.map((row) => row.map((button) => button.text)), [
    ["Play"],
    ["Deposit"],
    ["History"]
  ]);
  assert.equal(keyboard.inline_keyboard[0][0].web_app.url, "https://esportesnew.com/");
  assert.equal(keyboard.inline_keyboard[2][0].url, "https://esportesnew.com/en/profile/transactions");
});

test("reply keyboard uses only Mini App buttons", () => {
  const keyboard = replyKeyboard(config);

  assert.deepEqual(keyboard.keyboard.map((row) => row.map((button) => button.text)), [
    ["Deposit"]
  ]);
});

test("menu button follows selected managed button", () => {
  assert.equal(getMenuButton(config).label, "Deposit");
});

test("wrapper launch URL carries target path", () => {
  const url = buildLaunchUrl({
    ...config,
    launchMode: "wrapper"
  }, "/en/home?m=deposit");

  assert.equal(url, "https://bot.esportesnew.com/miniapp?target=https%3A%2F%2Fesportesnew.com%2Fen%2Fhome%3Fm%3Ddeposit");
});

test("welcome text follows Telegram user language with default fallback", () => {
  const welcomeConfig = {
    welcomeParseMode: "HTML",
    welcomeText: "Default {{first_name}}",
    welcomeMessages: {
      default: "Default {{first_name}}",
      en: "Hello <b>{{first_name}}</b>",
      pt: "Ola {{first_name}}"
    }
  };

  assert.equal(renderWelcomeText(welcomeConfig, { first_name: "Narek", language_code: "en-US" }), "Hello <b>Narek</b>");
  assert.equal(renderWelcomeText(welcomeConfig, { first_name: "Joao", language_code: "pt" }), "Ola Joao");
  assert.equal(renderWelcomeText(welcomeConfig, { first_name: "Ani", language_code: "hy" }), "Default Ani");
});
