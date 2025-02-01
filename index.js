require('dotenv').config();
const Discord = require('discord.js');
const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs').promises;
const { checkStock } = require('./utils/stockManager');
const config = require('./config.json');
const bot = new Discord.Client({ 
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.DirectMessages
    ],
    partials: [
        Discord.Partials.Channel,
        Discord.Partials.Message,
        Discord.Partials.User,
        Discord.Partials.GuildMember
    ]
});

bot.slashCommands = new Discord.Collection();
bot.config = config;

bot.login(config.token)
    .then(() => { 
        console.log(`[!] — Bot Aktif | ${bot.user.tag}`);
        console.log(`[!] — ${bot.slashCommands.size} Komut Yüklendi`);
    })
    .catch((error) => { 
        console.error('[HATA] Bot giriş yapamadı:', error);
        console.log('[!] — config.json dosyasını kontrol edin!');
    });


require('./Handler/slashcommand')(bot);
require('./Handler/Events')(bot);
require('./Handler/anticrash')(bot);
