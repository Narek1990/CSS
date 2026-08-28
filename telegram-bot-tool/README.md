# Telegram Bot Website Manager

This tool connects Telegram bots to websites such as `https://esportesnew.com/`, creates Telegram Web App buttons, validates Telegram Mini App sign-in data, and keeps a small local list of Telegram users who open the Mini App or message a bot.

It is intentionally dependency-free and runs on Node 18+.

## What It Does

- Verifies a Telegram bot token with `getMe`.
- Manages several websites from one dashboard.
- Lets each website have several Telegram bot profiles.
- Sets bot commands: `/start`, `/app`, `/keyboard`.
- Sets the private-chat menu button with `setChatMenuButton`.
- Manages a separate button list per bot: add, edit, disable, delete, reorder, choose row, and choose button type.
- Adds a rich welcome-message editor for Telegram HTML formatting.
- Sends a single welcome message with inline buttons, matching the simple bot shown in the recording.
- Can also send reply-keyboard Web App buttons when a button's placement is set to **Reply Keyboard** or **Both**.
- Hosts `/miniapp`, an optional wrapper that loads `https://esportesnew.com/` in an iframe.
- Validates `Telegram.WebApp.initData` on the server before creating a local session token.
- Stores config and Telegram users in `.data/`, which is ignored by git.

Telegram opens Mini Apps in its own webview. Opening the site directly is usually better than wrapping it in an iframe, especially because the live EsportesNew page already loads Telegram's Web App script. Use wrapper mode only when you need this tool to sit between Telegram and the website.

## Setup

1. Copy the example environment file:

   ```sh
   cp .env.example .env
   ```

2. Edit `.env`:

   ```sh
   PORT=8787
   HOST=127.0.0.1
   WEBSITE_URL=https://esportesnew.com/
   PUBLIC_BASE_URL=https://bot.esportesnew.com
   TELEGRAM_BOT_TOKEN=123456:your-token-here
   ADMIN_TOKEN=change-this-before-deploy
   LAUNCH_MODE=direct
   ```

3. Run the tool:

   ```sh
   npm start
   ```

4. Open the admin panel:

   ```text
   http://localhost:8787
   ```

5. Choose a website and bot profile, press **Verify Bot**, edit the button list, then press **Publish to Telegram**.

## Connecting The Bot

There are two levels of connection:

1. **Token connection**: choose the website and bot, paste the token, then verify. This confirms the tool can call Telegram as the selected bot.
2. **Webhook connection**: set `PUBLIC_BASE_URL` to the public HTTPS URL where this tool is hosted, then publish the selected bot. This lets Telegram deliver `/start` and button callback updates to the tool.

Local URLs such as `http://127.0.0.1:8787` cannot be used by Telegram as a webhook. For a quick test, expose the local server with an HTTPS tunnel and use that tunnel URL as `PUBLIC_BASE_URL`. For production, deploy the tool and use a stable URL such as `https://bot.esportesnew.com`.

After changing `PUBLIC_BASE_URL`, restart the tool or save the value in the dashboard, then press **Publish to Telegram** again. The **Check Connection** button shows whether the token is valid and whether the webhook is live.

## Button Manager

Each bot profile has its own buttons. The first bot starts with the same simple shape as your sample bot:

- `Play`
- `Deposit`
- `History`

Each button has:

- **Label**: the text Telegram displays.
- **Type**: `Mini App`, `Browser URL`, or `Callback`.
- **Placement**: `Inline`, `Reply Keyboard`, or `Both`.
- **Row**: buttons with the same row number appear side by side; different rows stack vertically.
- **URL or Path**: use a full HTTPS URL or a site-relative path such as `/en/home?m=deposit`.
- **Callback Data**: used only for callback buttons.

The preview panel shows the message and buttons before you publish. `Publish to Telegram` updates commands, the chat menu button, and the webhook for the selected bot only. New `/start` messages use the latest saved buttons for that bot profile.

## Multiple Websites And Bots

Use **Add Website** to create another website profile. Each website stores:

- Website name and app title.
- Website URL.
- Public bot-tool URL.
- Direct-site or iframe-wrapper launch mode.
- Mini App and webhook paths.

Use **Add Bot** inside a website to create another Telegram bot profile. Each bot stores:

- Its own Telegram token.
- Its own Telegram username after verification.
- Its own welcome message.
- Its own menu button choice.
- Its own managed Telegram buttons.

The webhook URL includes the website ID and bot ID, so one public tool can receive updates for several bots separately.

## Welcome Message Editor

The welcome editor stores Telegram HTML. The toolbar supports bold, italic, underline, strikethrough, code, links, and clear formatting. You can still use placeholders:

```text
{{first_name}}
{{last_name}}
{{username}}
```

The dashboard escapes typed text before sending it to Telegram, while preserving allowed formatting tags.

## Public HTTPS Requirement

Telegram Bot API Web App URLs must be HTTPS. For production, deploy this tool to a Node host at a public URL such as:

```text
https://bot.esportesnew.com
```

On most production hosts, set `HOST=0.0.0.0` so the platform can route traffic to the Node process.

For local testing, expose the server through a temporary HTTPS tunnel and set `PUBLIC_BASE_URL` to that tunnel URL.

## BotFather Steps

Create or open your bot in `@BotFather`, then configure:

- `/setdomain` with `esportesnew.com` if you use Telegram Login Widget or direct website auth.
- `/setmenubutton` if you want to configure the menu button manually instead of using this tool.
- Bot Settings > Configure Mini App > Enable Mini App if you want the profile-level **Launch app** button and `https://t.me/<botusername>?startapp` direct links.

This tool can set commands, webhook, and the chat menu button through the Bot API, but the profile-level Main Mini App still belongs in BotFather.

## Sign Up / Sign In Integration

The route `POST /api/auth/telegram` receives:

```json
{
  "initData": "Telegram.WebApp.initData"
}
```

It validates the Telegram signature using the bot token. If valid, it upserts the Telegram user into `.data/users.json` and returns:

```json
{
  "ok": true,
  "user": {
    "id": 42,
    "first_name": "Narek",
    "username": "narek"
  },
  "sessionToken": "..."
}
```

To connect this to the real EsportesNew account system, the website backend needs an endpoint that uses the same validation logic from `src/telegram-auth.js`, then creates or logs in the website user and sets the website's normal session cookie. A separate `bot.esportesnew.com` service cannot create a first-party `esportesnew.com` login session unless the production website backend accepts and exchanges the validated Telegram session.

## Wrapper Mode

Set:

```sh
LAUNCH_MODE=wrapper
```

or choose **Wrapper** in the admin panel. Telegram will open:

```text
https://bot.esportesnew.com/miniapp
```

The wrapper validates Telegram identity and embeds `https://esportesnew.com/` in an iframe. After sign-in it posts this message to the iframe:

```js
{
  source: "esportesnew-telegram-bot-tool",
  type: "telegram-auth",
  user,
  sessionToken
}
```

The website must add a `message` listener if it wants to consume that session.

When a managed button has a deep link, wrapper mode opens `/miniapp?target=<encoded-url>` and only allows targets on the configured EsportesNew origin.

## Security Notes

- Do not commit `.env` or `.data/`.
- Rotate the bot token if it is ever pasted into a chat, ticket, screenshot, or public repo.
- Use `ADMIN_TOKEN` in production so the dashboard cannot be used by visitors.
- Keep Telegram init data short-lived; this tool defaults to 24 hours.

## Useful Commands

```sh
npm test
npm run check
npm start
```

References: Telegram Mini Apps documentation and Telegram Bot API documentation.
