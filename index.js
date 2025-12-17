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

function createBot() {
  bot = mineflayer.createBot(botOptions);

  bot.on('login', () => {
    console.log(`Bot logged in as ${bot.username}`);
    startAntiAfk();
  });

  bot.on('error', (err) => {
    console.log(`Bot error: ${err}`);
  });

  bot.on('end', (reason) => {
    console.log(`Bot disconnected: ${reason}`);
    console.log('Reconnecting in 10 seconds...');
    setTimeout(createBot, 10000);
  });
  
  bot.on('kicked', (reason) => {
      console.log(`Bot kicked: ${reason}`);
  });
  
  bot.on('spawn', () => {
      console.log('Bot spawned');
  });
}

function startAntiAfk() {
  // Simple Anti-AFK: Randomly look around and jump every few seconds
  setInterval(() => {
    if (!bot || !bot.entity) return;

    // Random yaw and pitch
    const yaw = Math.random() * Math.PI - (0.5 * Math.PI);
    const pitch = Math.random() * Math.PI - (0.5 * Math.PI);
    
    bot.look(yaw, pitch);
    
    // Occasionally jump
    if (Math.random() < 0.3) {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 500);
    }
    
    // Swing arm
    bot.swingArm();
    
    console.log('Anti-AFK action performed');

  }, 5000 + Math.random() * 5000); // Every 5-10 seconds
}

// Start the bot
createBot();
