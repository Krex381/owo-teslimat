const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config.json');

async function checkStock() {
    try {
        const stockData = {};
        const stockPath = path.join(__dirname, '..', 'db', 'stock.json');

        for (const token of config.account_tokens) {
            const client = new Client({ checkUpdate: false });
            
            try {
                await client.login(token);
                console.log(`[STOK] ${client.user.tag} kontrol ediliyor...`);
                
                const channel = await client.channels.fetch(config.owo_channel_id);
                
                
                await channel.send('owo cash');
                await new Promise(resolve => setTimeout(resolve, 2000));

                
                const messages = await channel.messages.fetch({ limit: 5 });
                const response = messages.find(m => 
                    m.author.id === config.owo_id && 
                    m.content.includes('cowoncy')
                );

                if (response) {
                    console.log("[STOK] Bulunan yanıt:", response.content);
                    
                    let amount;
                    const patterns = [
                        /\*\*__(\d[,\d]*)__\*\* cowoncy/, // **__1,234__** cowoncy
                        /have \*\*__([,\d]+)__ cowoncy/, // have **__1,234__ cowoncy
                        /have ([,\d]+) cowoncy/, // have 1,234 cowoncy
                        /(\d[,\d]*) cowoncy/ // 1,234 cowoncy
                    ];

                    for (const pattern of patterns) {
                        const match = response.content.match(pattern);
                        if (match) {
                            amount = parseInt(match[1].replace(/,/g, ''));
                            break;
                        }
                    }

                    if (amount) {
                        stockData[client.user.id] = amount;
                        console.log(`[STOK] ${client.user.tag} için miktar: ${amount}`);
                    } else {
                        console.log(`[STOK] Yanıt ayrıştırılamadı: ${response.content}`);
                    }
                } else {
                    console.log(`[STOK] Son 5 mesajda eşleşme bulunamadı`);
                }

            } catch (err) {
                console.error(`[STOK] ${token.slice(0,10)}... için başarısız:`, err);
            } finally {
                client.destroy();
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        // Only save if we have data
        if (Object.keys(stockData).length > 0) {
            await fs.mkdir(path.join(__dirname, '..', 'db'), { recursive: true });
            await fs.writeFile(
                stockPath,
                JSON.stringify(stockData, null, 2),
                'utf8'
            );
            console.log('[STOK] Kaydedildi:', stockData);
        } else {
            console.log('[STOK] Kaydedilecek veri yok');
        }

        return stockData;

    } catch (error) {
        console.error('[STOK] Kontrol başarısız:', error);
        throw error;
    }
}

module.exports = { checkStock };
