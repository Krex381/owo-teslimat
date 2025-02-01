require('dotenv').config();
const Discord = require('discord.js');
const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs').promises;
const { checkStock } = require('./utils/stockManager');
const bot = new Discord.Client({ 
    intents: 3276799, 
    partials: [
        Discord.Partials.Channel, 
        Discord.Partials.Message, 
        Discord.Partials.User, 
        Discord.Partials.GuildMember, 
        Discord.Partials.Reaction, 
        Discord.Partials.ThreadMember, 
        Discord.Partials.GuildScheduledEvent
    ] 
});

bot.slashCommands = new Discord.Collection();
bot.setMaxListeners(70);

bot.login(process.env.TOKEN)
    .then(() => { 
        console.log(`[!] — Logged in as ${bot.user.tag} (${bot.user.id})`); 
    })
    .catch(() => { 
        console.log('\x1b[31m[!] — Please configure a valid bot token in .env file\x1b[0m'); 
    });

const slashcommandHandler = require('./Handler/slashcommand.js')(bot);
const eventdHandler = require('./Handler/Events')(bot);
const anticrashHandler = require('./Handler/anticrash');
anticrashHandler(bot);