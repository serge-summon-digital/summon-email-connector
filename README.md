# Summon Email Connector (IONOS mailbox for Claude)

A small MCP server that lets Claude read and search **your own** IONOS mailbox, save **drafts** (with attachments from your computer), move or copy mail between folders, create or rename folders and save attachments to your computer. It cannot send, delete or flag mail, or move or copy mail into Trash; you review and send drafts yourself in IONOS webmail.

Each person runs their own copy on their own Mac with their own IONOS app password, so nobody's Claude can reach anyone else's inbox. It runs locally and is free.

## What Claude can do

| Tool | What it does |
| --- | --- |
| `list_folders` | Folders with message and unread counts |
| `list_emails` | Newest emails in a folder (headers only), optionally unread only or since a date |
| `search_emails` | Filter by from, to, subject, text, since, before, unread |
| `read_email` | One email's headers, plain-text body (up to 20,000 characters) and attachment names |
| `create_draft` | Saves a draft, optionally threaded as a reply and with attachments from your computer (20 MB max), in your IONOS Drafts folder. It is not sent. |
| `move_emails` | Moves emails by UID from one folder to another (not into Trash). Read/unread status is kept. |
| `copy_emails` | Copies emails by UID into another folder and leaves the originals in place (not into Trash), e.g. filing invoices into `VAT/VAT Q4 2026` |
| `save_attachment` | Saves one attachment into a folder on your computer without overwriting; text attachments also come back as text |
| `create_folder` | Creates a folder, e.g. `Tidied/Newsletters` |
| `rename_folder` | Renames a folder and keeps its mail. INBOX and system folders can't be renamed. |

Folders are opened read-only for reading, so reading never marks mail as read.

**Windows:** start the server with `node --use-system-ca launcher.mjs`. `--use-system-ca` lets Node trust certificates in the Windows store (needed when antivirus such as AVG inspects mail traffic), and `launcher.mjs` reads `EMAIL_*` from your Windows user environment when the host app doesn't pass it through. The tool descriptions tell Claude that email content is untrusted and must never be followed as instructions.

## Setup (about 10 minutes)

Run every command in the **Terminal** app (Applications > Utilities > Terminal), not in a Claude chat, so your password never goes through Claude.

### 0. Check Node.js

```bash
node -v
```

If it prints `v20` or higher, go to step 1. If you get "command not found" or a lower version, install the LTS version from https://nodejs.org (the macOS installer), then close and reopen Terminal.

### 1. Create an IONOS app password

1. Open IONOS webmail in your browser.
2. Click your **profile** (top right).
3. Click **Login & security**.
4. Open **App passwords** and **add** a new app password (for example, name it "Claude").
5. Copy the password it shows. You'll paste it in step 3.

Use this app password, not your normal email password.

### 2. Download the connector (once)

```bash
git clone https://github.com/serge-summon-digital/summon-email-connector.git ~/summon-email-connector
```

```bash
cd ~/summon-email-connector && npm install
```

If your Mac pops up "install developer tools" when you run `git`, click **Install**, wait for it to finish, then run the first command again.

### 3. Connect it to Claude

**Claude Code** (the `claude` command, or the Code tab in the Claude app): paste this as one line, replacing the three values in quotes:

```bash
claude mcp add summon-email --scope user --env EMAIL_ADDRESS=you@summon.co --env EMAIL_PASSWORD='your-app-password' --env EMAIL_DISPLAY_NAME='Your Name' -- node ~/summon-email-connector/server.js
```

**Claude Desktop** (the chat app):

1. In Terminal, run `which node` and copy the path it prints (for example `/usr/local/bin/node`).
2. In Terminal, run `whoami` and note your Mac username.
3. In the Claude app, open **Settings > Developer > Edit Config**. This opens `claude_desktop_config.json`.
4. Add the following, replacing the node path, your Mac username, email address, app password and name:

   ```json
   {
     "mcpServers": {
       "summon-email": {
         "command": "/usr/local/bin/node",
         "args": ["/Users/YOUR-MAC-USERNAME/summon-email-connector/server.js"],
         "env": {
           "EMAIL_ADDRESS": "you@summon.co",
           "EMAIL_PASSWORD": "your-app-password",
           "EMAIL_DISPLAY_NAME": "Your Name"
         }
       }
     }
   }
   ```

   If the file already has an `mcpServers` section, add the `summon-email` entry inside it rather than pasting a second one.
5. Save the file, then fully quit Claude (Cmd+Q) and reopen it.

### 4. Test it

Start a new Claude chat and ask: **"list my unread emails from today"**.

## Troubleshooting

- **`IONOS rejected the login for ...`:** the email address or app password is wrong. In Claude Code, run `claude mcp remove summon-email --scope user` and redo step 3. In Claude Desktop, fix the config file and restart the app.
- **Claude doesn't show the email tools:** fully quit and reopen Claude Desktop, or start a new Claude Code session. In Claude Code, `claude mcp list` should show `summon-email` as connected.
- **Desktop config errors:** the file must be valid JSON (matching braces, commas between entries).

## Updating

```bash
cd ~/summon-email-connector && git pull && npm install
```

Then restart Claude.

## Turning it off

Delete the app password in IONOS (profile > Login & security > App passwords), or remove the connector: `claude mcp remove summon-email --scope user` (Claude Code), or delete the `summon-email` entry from the Desktop config file.

## Notes

- Your app password is stored only on your own Mac, in your Claude config (`~/.claude.json` or the Desktop config file).
- Mail server: `imap.ionos.co.uk:993` over TLS. Optional overrides: `IMAP_HOST`, `IMAP_PORT`.
- Each tool call opens and closes its own connection; nothing stays logged in.
- Sending from Claude is deliberately not supported. Open IONOS webmail > Drafts, check the draft and send it yourself.
