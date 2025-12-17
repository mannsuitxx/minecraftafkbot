# Minecraft Anti-AFK Bot for Render

This bot connects to a Minecraft server (specifically designed for Aternos) and stays online, performing random movements to prevent being kicked for AFK. It also runs a small web server to satisfy Render's port binding requirements.

## Deployment on Render

1.  **Create a New Web Service** on [Render](https://render.com/).
2.  Connect your repository containing this code.
3.  **Environment Variables:**
    You must configure the following Environment Variables in the Render dashboard:

    *   `MC_HOST`: The address of your Aternos server (e.g., `example.aternos.me`).
    *   `MC_PORT`: The port of your server (e.g., `12345`). **Important:** Aternos provides dynamic ports unless you have a specific setup, check your server page.
    *   `MC_USERNAME`: The username the bot should use (e.g., `AFKBot`).
    *   `MC_VERSION`: (Optional) The Minecraft version (e.g., `1.20.1`). If omitted, it attempts to auto-detect.

4.  **Bot Account Type:**
    *   By default, the code is set to `auth: 'offline'`, which works for Cracked servers or if you just want a non-premium bot on a server that allows it.
    *   If your Aternos server has `Cracked` enabled (which is common for these bots), this will work out of the box.

## How it Works

*   **Web Server:** Listens on the port assigned by Render (default 3000) to keep the service alive.
*   **Anti-AFK:** The bot looks around randomly, jumps, and swings its arm every 5-10 seconds.
*   **Auto-Reconnect:** If the bot gets kicked or the server restarts, it attempts to reconnect every 10 seconds.

## Aternos Specifics

*   **Queue:** If the server is full or has a queue, the bot might get stuck in the queue. `mineflayer` handles basic queues, but Aternos sometimes has web-based queues which this bot *cannot* bypass. The server must be online.
*   **Uptime:** This bot keeps the player online, which keeps the server online (if Aternos detects players).

## Local Testing

You can test locally by creating a `.env` file (not committed) or just setting variables in your terminal:

```bash
export MC_HOST=yourserver.aternos.me
export MC_PORT=12345
npm start
```
