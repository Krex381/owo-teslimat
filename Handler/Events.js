const fs = require('fs');
const config = require('../config.js'); 

module.exports = async (bot) => {
    
    const eventFiles = fs.readdirSync('./Events').filter(file => file.endsWith('.js'));
    
    console.log(`[OLAYLAR] ${eventFiles.length} olay yükleniyor...`);
    
    for (const file of eventFiles) {
        try {
            const event = require(`../Events/${file}`);
            
            
            if (!event.name || !event.execute) {
                console.warn(`[OLAYLAR] Hata: ${file} geçersiz olay yapısı`);
                continue;
            }
            
            
            if (event.once) {
                bot.once(event.name, (...args) => event.execute(...args, bot, config));
                console.log(`[OLAYLAR] ${event.name} olayı (once) yüklendi`);
            } else {
                bot.on(event.name, (...args) => event.execute(...args, bot, config));
                console.log(`[OLAYLAR] ${event.name} olayı yüklendi`);
            }
        } catch (error) {
            console.error(`[OLAYLAR] Hata: ${file} yüklenemedi`, error);
        }
    }
};
