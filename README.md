# Personal Site Blocker — Chrome Extension (Manifest V3)

A tiny, privacy-friendly Chrome extension that lets **_you_** decide which websites to block.  
Just type a domain (or any URL pattern) into the popup and Chrome will stop every navigation that matches it—great for cutting distractions without third-party services or heavy blockers.

---

## ✨ Features

- **Manual block list** – Add / remove patterns in a second.
- **Instant effect** – Uses Dynamic Declarative NetRequest rules; no page reload needed.
- **No background polling** – Service-worker sleeps when not updating rules.
- **Cloud sync** – Block list is stored with `chrome.storage.sync` (optional; works offline too).
- **Lightweight** – < 25 KB unpacked, zero external dependencies.

---

## 📂 Project Structure

personal-site-blocker/
├── manifest.json
├── background.js # service-worker (dynamic rules)
├── popup.html # minimal UI
├── popup.js # UI logic + messaging
└── icons/
├── block16.png
├── block48.png
└── block128.png

yaml
Copy
Edit

_(Remove the `icons/` folder or the `"icons"` entry in `manifest.json` if you don’t want custom icons.)_

---

## 🚀 Getting Started

1. **Clone / download** this folder.
2. Open `chrome://extensions` in Chrome or any Chromium-based browser.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** ➜ select the project folder.
5. The “🛑 SB” icon appears in your toolbar.  
   Click it to open the popup.

---

## 🛠 Usage

1. In the popup, type a domain or pattern—for example:
   reddit.com

nginx
Copy
Edit
or  
://twitter.com/

yaml
Copy
Edit 2. Press **Add** (or Enter).  
The pattern shows up in **Currently blocked**. 3. Try visiting the site: Chrome shows its standard **“This page has been blocked by an extension”** error. 4. Click the **✕** next to a pattern to unblock it.

### Pattern Cheat-Sheet

| Pattern you enter    | Blocks …                                              |
| -------------------- | ----------------------------------------------------- |
| `reddit.com`         | `https://reddit.com/*`, `https://www.reddit.com/*`    |
| `://twitter.com/`    | exactly `twitter.com` (not `mobile.twitter.com`)      |
| `facebook.`          | any URL containing `facebook.` (all sub-domains/TLDs) |
| `://*.example.com/`¹ | every sub-domain of `example.com`                     |

¹ Uses full [URL-filter syntax](https://developer.chrome.com/docs/extensions/develop/concepts/declarativeNetRequest/url_filters/) (wildcards, `|`, anchors, etc.)—but simple substrings work fine for personal use.

---

## 🔒 Permissions Explained

| Permission               | Why it’s needed                                          |
| ------------------------ | -------------------------------------------------------- |
| `declarativeNetRequest`  | Add/remove blocking rules entirely in the browser engine |
| `host_permissions:<all>` | Allow rules to match any site you choose                 |
| `storage`                | Save your block list (optional cloud sync)               |

No network calls leave your machine—everything runs locally.

---

## 🧑‍💻 Development Notes

- **Increment rule IDs** if you ever change `RULE_ID_START` or want multiple sets.
- Service-worker sleeps; wakes only when the action popup sends an `updateBlockList` message or on install.
- For production, use **“Pack extension”** in `chrome://extensions` to generate a signed `.crx`.

---

## 🎨 Custom Icons (Optional)

Replace the three PNGs in `icons/` with any 16×16, 48×48, 128×128 art.  
OR remove the `"icons"` block from `manifest.json` to let Chrome use a default placeholder.

---

## 🤝 Contributing

Feel free to open issues or submit pull requests for:

- UI improvements (dark-mode, options page, import/export).
- Wildcard helpers / validation.
- Edge support (should work with minor tweaks).

---

## 📜 License

MIT © 2025 — Do whatever you want, just don’t blame me if you lock yourself out of the internet 😉
