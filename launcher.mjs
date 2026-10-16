// Fills in EMAIL_* / IMAP_* from the Windows user environment (HKCU\Environment)
// when the host app launches the server with a filtered environment, then starts server.js.
import { execFileSync } from "node:child_process";

const NAMES = ["EMAIL_ADDRESS", "EMAIL_PASSWORD", "EMAIL_DISPLAY_NAME", "IMAP_HOST", "IMAP_PORT"];

if (process.platform === "win32") {
  for (const name of NAMES) {
    if (process.env[name]) continue;
    try {
      const out = execFileSync("reg", ["query", "HKCU\\Environment", "/v", name], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
      const match = out.match(new RegExp(`^\\s*${name}\\s+REG_(?:EXPAND_)?SZ\\s+(.*)$`, "m"));
      if (match) process.env[name] = match[1].trim();
    } catch {
      // Not set; server.js reports what is missing.
    }
  }
}

await import("./server.js");
