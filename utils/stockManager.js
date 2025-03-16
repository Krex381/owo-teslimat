const fs = require('fs').promises;
const path = require('path');
const { Client } = require('discord.js-selfbot-v13');
const config = require('../config.js');

async function loadTokens() {
    try {
        const tokenFile = path.join(__dirname, '../tokens/tokenler.txt');
        const tokenData = await fs.readFile(tokenFile, 'utf8');
        const tokens = tokenData.split(/\r?\n/).filter(token => token.trim());
        console.log(`[TOKEN-YUKLE] ${tokens.length} token yüklendi`);
        return tokens;
    } catch (error) {
        console.error('[TOKEN-YUKLE] Hata:', error);
        return [];
    }
}

async function checkStock() {
    console.log('[STOK-KONTROL] Stok kontrolü başlatılıyor...');
    
    try {

        const stockPath = path.join(__dirname, '../db/stock.json');
        try {
            await fs.access(stockPath);
        } catch {
            await fs.mkdir(path.dirname(stockPath), { recursive: true });
            await fs.writeFile(stockPath, '{}');
            console.log('[STOK-KONTROL] Yeni stok dosyası oluşturuldu');
        }
    } catch (error) {
        console.error('[STOK-KONTROL] Dosya kontrolü hatası:', error);
    }
    
    const tokens = await loadTokens();
    if (!tokens || tokens.length === 0) {
        console.error('[STOK-KONTROL] Token bulunamadı');
        return {};
    }

    const stockData = {};
    const stockPath = path.join(__dirname, '../db/stock.json');
    
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const client = new Client({ checkUpdate: false });
        
        try {
            console.log(`[STOK-KONTROL] (${i+1}/${tokens.length}) Token kontrol ediliyor...`);
            await client.login(token);
            
            let userId;
            try {
                const base64UserId = token.split('.')[0];
                userId = Buffer.from(base64UserId, 'base64').toString();
            } catch (err) {
                userId = `account${i+1}`;
                console.log(`[STOK-KONTROL] Token ID çözülemedi, varsayılan kullanılıyor: ${userId}`);
            }
            
            try {
                await client.user.setActivity({
                    name: "OwO Cash Checking",
                    type: 0
                });
            } catch (activityErr) {
                console.error(`[STOK-KONTROL] Aktivite ayarlama hatası:`, activityErr.message);
            }
            
            let channel;
            try {
                channel = await client.channels.fetch(config.owo_channel_id);
            } catch (err) {
                console.warn(`[STOK-KONTROL] Belirtilen kanal bulunamadı, alternatif kanal aranıyor...`);
                
                const availableGuilds = client.guilds.cache.values();
                for (const guild of availableGuilds) {
                    const textChannels = guild.channels.cache.filter(c => 
                        c.type === 0 &&
                        guild.members.me && 
                        c.permissionsFor(guild.members.me).has('SendMessages')
                    );
                    
                    if (textChannels.size > 0) {
                        channel = textChannels.first();
                        console.log(`[STOK-KONTROL] Alternatif kanal bulundu: ${channel.name} (${guild.name})`);
                        break;
                    }
                }
            }
            
            if (!channel) {
                console.error('[STOK-KONTROL] Hiçbir kanal bulunamadı');
                continue;
            }
            
            console.log(`[STOK-KONTROL] ${userId} için bakiye sorgulanıyor...`);
            await channel.send('owo cash');
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const messages = await channel.messages.fetch({ limit: 5 });
            const response = messages.find(m => 
                m.author.id === config.owo_id && 
                (m.content.includes('cowoncy') || m.content.includes('currently have'))
            );

            if (response) {
                console.log("[STOK-KONTROL] Bulunan yanıt:", response.content);
                
                let amount;
                // Updated pattern to match OwO's response format more accurately
                const patterns = [
                    /have\s+\*\*__([,\d]+)__\*\*\s+cowoncy/, // have **__7,558,695__** cowoncy
                    /\*\*__([,\d]+)__\*\*\s+cowoncy/, // **__7,558,695__** cowoncy
                    /have\s+\*\*__([,\d]+)__/, // you currently have **__7,558,695__
                    /([,\d]+)\s+cowoncy/ // 7,558,695 cowoncy
                ];

                for (const pattern of patterns) {
                    const match = response.content.match(pattern);
                    if (match) {
                        amount = parseInt(match[1].replace(/,/g, ''));
                        break;
                    }
                }
                
                if (amount !== undefined) {
                    stockData[userId] = amount;
                    console.log(`[STOK-KONTROL] ${userId}: ${amount.toLocaleString()} OwO bulundu`);
                } else {

                    console.log(`[STOK-KONTROL] Otomatik eşleşme bulunamadı, manuel analiz yapılıyor...`);
                    

                    const manualMatch = response.content.match(/\*\*__([^_]+)__\*\*/);
                    if (manualMatch) {
                        const extractedText = manualMatch[1].trim().replace(/,/g, '');
                        const numericValue = parseInt(extractedText);
                        
                        if (!isNaN(numericValue)) {
                            amount = numericValue;
                            stockData[userId] = amount;
                            console.log(`[STOK-KONTROL] Manuel analiz ile ${userId}: ${amount.toLocaleString()} OwO bulundu`);
                        } else {
                            console.log(`[STOK-KONTROL] Manuel analiz başarısız, geçersiz sayı: ${extractedText}`);
                            stockData[userId] = 0;
                        }
                    } else {
                        console.log(`[STOK-KONTROL] ${userId} için bakiye formatı tanınamadı: ${response.content}`);
                        stockData[userId] = 0;
                    }
                }
            } else {
                console.log(`[STOK-KONTROL] ${userId} için cowoncy yanıtı bulunamadı`);
                stockData[userId] = 0;
            }
        } catch (error) {
            console.error(`[STOK-KONTROL] Hata (${i+1}/${tokens.length}):`, error.message);
            continue;
        } finally {
            client.destroy();

            if (i < tokens.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }
    
    try {
        if (Object.keys(stockData).length > 0) {
            await fs.writeFile(stockPath, JSON.stringify(stockData, null, 2));
            console.log('[STOK-KONTROL] Stok verileri güncellendi:', stockData);
        } else {
            console.warn('[STOK-KONTROL] Güncellenecek veri bulunamadı');
        }
    } catch (error) {
        console.error('[STOK-KONTROL] Stok verileri kaydedilemedi:', error.message);
    }
    
    return stockData;
}

module.exports = { checkStock, loadTokens };
