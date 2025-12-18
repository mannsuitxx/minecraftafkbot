const mineflayer = require('mineflayer');
const express = require('express');

// --- Web Server (for Render) ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Minecraft Bot is running!');
});

app.listen(PORT, () => {
  console.log(`Web server listening on port ${PORT}`);
});

// --- Minecraft Bot ---
const botOptions = {
  host: process.env.MC_HOST || 'localhost', // Your server IP
  port: parseInt(process.env.MC_PORT) || 25565,       // Your server Port
  username: process.env.MC_USERNAME || 'Bot_AFK', // Bot username
  version: process.env.MC_VERSION || false,     // Version (false = auto)
  auth: 'offline' // 'microsoft' or 'offline'. Aternos usually requires cracked/offline or specific auth handling if online-mode=true.
                  // Note: Aternos 'cracked' servers use 'offline'. Genuine accounts need 'microsoft'.
};

let bot;
let antiAfkInterval;
let scheduledReconnectTimeout;

function createBot() {
  bot = mineflayer.createBot(botOptions);

  bot.on('login', () => {
    console.log(`Bot logged in as ${bot.username}`);
    startAntiAfk();

    // Schedule a disconnect after 1 hour (3600000 ms)
    if (scheduledReconnectTimeout) clearTimeout(scheduledReconnectTimeout);
    scheduledReconnectTimeout = setTimeout(() => {
        console.log('Planned hourly disconnect...');
        bot.end();
    }, 3600000);
  });

  bot.on('error', (err) => {
    console.log('Bot error encountered:', err);
    if (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED') {
        console.log(`Connection failed: ${err.code}. Attempting to reconnect...`);
        // If the socket is reset/refused, 'end' might not fire automatically in all cases.
        // We ensure 'bot.end()' is called to trigger the 'end' event logic.
        // But if end() throws or doesn't work, we might need a fallback.
        try {
            bot.end(); 
        } catch (e) {
            console.log('Error calling bot.end(), manually triggering reconnect logic:', e);
            // If bot.end() fails, we manually call the cleanup and reconnect logic
            // providing we haven't already scheduled one.
            bot.emit('end', 'error_trigger'); 
        }
    }
  });

  bot.on('end', (reason) => {
    console.log(`Bot disconnected: ${reason}`);
    stopAntiAfk();
    if (scheduledReconnectTimeout) {
        clearTimeout(scheduledReconnectTimeout);
        scheduledReconnectTimeout = null;
    }
    
    // Prevent multiple reconnection timers
    if (!bot._reconnectTimer) {
        console.log('Reconnecting in 10 seconds...');
        bot._reconnectTimer = setTimeout(() => {
            bot._reconnectTimer = null;
            createBot();
        }, 10000);
    }
  });
  
  bot.on('kicked', (reason) => {
      console.log(`Bot kicked: ${reason}`);
  });
  
  bot.on('spawn', () => {
      console.log('Bot spawned');
  });
}

function startAntiAfk() {
  if (antiAfkInterval) clearInterval(antiAfkInterval);

  // Improved Anti-AFK: Move, Sneak, Look, Jump to simulate activity
  antiAfkInterval = setInterval(() => {
    if (!bot || !bot.entity) return;

    // Always look around slightly
    const yaw = Math.random() * Math.PI - (0.5 * Math.PI);
    const pitch = Math.random() * Math.PI - (0.5 * Math.PI);
    bot.look(yaw, pitch);

    const action = Math.floor(Math.random() * 4);
    
    switch (action) {
        case 0: // Jump
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 800);
            break;
        case 1: // Sneak
            bot.setControlState('sneak', true);
            setTimeout(() => bot.setControlState('sneak', false), 1500);
            break;
        case 2: // Swing Arm
            bot.swingArm();
            break;
        case 3: // Walk sequence (Forward then Back)
            bot.setControlState('forward', true);
            setTimeout(() => {
                bot.setControlState('forward', false);
                // Wait a bit then move back
                setTimeout(() => {
                    bot.setControlState('back', true);
                    setTimeout(() => bot.setControlState('back', false), 600);
                }, 200);
            }, 600);
            break;
    }
    
    console.log(`Anti-AFK action ${action} performed`);

  }, 10000 + Math.random() * 10000); // Every 10-20 seconds
}

function stopAntiAfk() {
    if (antiAfkInterval) {
        clearInterval(antiAfkInterval);
        antiAfkInterval = null;
    }
    if (bot) bot.clearControlStates();
}

// Start the bot
createBot();

// --- Keep Alive (Self Ping) ---
// Render free tier sleeps after 15 mins of inactivity. 
// This tries to keep it awake, but an external uptime monitor is better.
const http = require('http');
setInterval(() => {
    http.get(`http://localhost:${PORT}`, (res) => {
        console.log('Keep-alive ping sent. Status:', res.statusCode);
    }).on('error', (err) => {
        console.error('Keep-alive ping failed:', err.message);
    });
}, 5 * 60 * 1000); // Ping every 5 minutes
