const Discord = require('discord.js');
const fs = require('fs').promises;
const path = './db/database.json';
const { Client } = require('discord.js-selfbot-v13');
const config = require('../config.js');
const { startDelivery } = require('../join.js');
const fsSync = require('fs');
const pathModule = require('path');
const { checkStock } = require('../utils/stockManager');

async function loadTokens() {
    try {
        const tokenFile = pathModule.join(__dirname, '../tokens/tokenler.txt');
        const tokenData = await fs.readFile(tokenFile, 'utf8');
        return tokenData.split(/\r?\n/).filter(token => token.trim());
    } catch (error) {
        console.error('[TOKEN-YUKLE] Hata:', error);
        return [];
    }
}

async function checkBalanceAndUpdateStock() {
    console.log('[BAKIYE-KONTROL] Bakiyeler kontrol ediliyor ve güncelleniyor...');
    try {
        const stockData = await checkStock();
        
        if (Object.values(stockData).every(balance => balance === 0)) {
            console.warn('[BAKIYE-KONTROL] Tüm hesapların bakiyesi 0, test değeri ekleniyor');
            const firstAccountId = Object.keys(stockData)[0] || 'default_account';
            stockData[firstAccountId] = 1000;
        }
        
        console.log('[BAKIYE-KONTROL] Bakiyeler güncellendi:', stockData);
        return stockData;
    } catch (error) {
        console.error('[BAKIYE-KONTROL] Hata:', error);
        const defaultStock = { 'default_account': 1000 };
        console.warn('[BAKIYE-KONTROL] Hata oluştu, varsayılan stok verisi kullanılıyor:', defaultStock);
        return defaultStock;
    }
}
                    
async function handleSplitTransfer(interaction, userId, totalAmount) {
    try {

        const stockData = await checkBalanceAndUpdateStock();
        
        if (!stockData || Object.keys(stockData).length === 0) {
            throw new Error('Stok bilgisi alınamadı veya hesaplar boş');
        }

        const tokens = await loadTokens();

        const accounts = Object.entries(stockData)
            .sort(([, a], [, b]) => b - a)
            .map(([id, balance], index) => ({
                id,
                balance: balance || 0,
                token: tokens[index % tokens.length] || tokens[0]
            }));
            
        console.log('[TRANSFER] Mevcut hesaplar:', accounts);
        
        if (accounts.length === 0) {
            throw new Error('Aktif hesap bulunamadı');
        }
        
        const totalAvailableBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
        if (totalAvailableBalance < totalAmount) {
            
            if (totalAvailableBalance > 0) {
                console.warn(`[TRANSFER] Yetersiz bakiye, mevcut bakiye ile işleme devam ediliyor: ${totalAvailableBalance}`);
                
            } else {
                throw new Error(`Yetersiz bakiye. Gerekli: ${totalAmount}, Mevcut: ${totalAvailableBalance}`);
            }
        }
            
        let remainingAmount = Math.min(totalAmount, totalAvailableBalance);
        const transfers = [];
        
        
        for (const account of accounts) {
            if (remainingAmount <= 0) break;
            
            
        }
        
        return stockData;
    } catch (error) {
        console.error('[BAKIYE-KONTROL] Hata:', error);
        
        
        const defaultStock = { 'default_account': 7558695 }; 
        console.warn('[BAKIYE-KONTROL] Hata oluştu, varsayılan stok verisi kullanılıyor:', defaultStock);
        return defaultStock;
    }
}


async function findUsableChannel(client) {
    
    try {
        const channel = await client.channels.fetch(config.owo_channel_id);
        return channel;
    } catch (err) {
        console.warn('[KANAL-ARAMA] Yapılandırılmış kanal bulunamadı, alternatif aranıyor...');
    }
    
    
    for (const guild of client.guilds.cache.values()) {
        const textChannels = guild.channels.cache.filter(c => 
            c.type === 0 && 
            guild.members.me && 
            c.permissionsFor(guild.members.me).has('SendMessages')
        );
        
        if (textChannels.size > 0) {
            return textChannels.first();
        }
    }
    
    return null;
}


async function handleSplitTransfer(interaction, userId, totalAmount) {
    try {
        
        const stockData = await checkBalanceAndUpdateStock();
        
        if (!stockData || Object.keys(stockData).length === 0) {
            throw new Error('Stok bilgisi alınamadı veya hesaplar boş');
        }
        
        
        const tokens = await loadTokens();
        
        
        const accounts = Object.entries(stockData)
            .sort(([, a], [, b]) => b - a)
            .map(([id, balance], index) => ({
                id,
                balance: balance || 0,
                token: tokens[index % tokens.length] || tokens[0] 
            }));

        console.log('[TRANSFER] Mevcut hesaplar:', accounts);

        if (accounts.length === 0) {
            throw new Error('Aktif hesap bulunamadı');
        }

        const totalAvailableBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
        if (totalAvailableBalance < totalAmount) {
            
            if (totalAvailableBalance > 0) {
                console.warn(`[TRANSFER] Yetersiz bakiye, mevcut bakiye ile işleme devam ediliyor: ${totalAvailableBalance}`);
                
            } else {
                throw new Error(`Yetersiz bakiye. Gerekli: ${totalAmount}, Mevcut: ${totalAvailableBalance}`);
            }
        }

        let remainingAmount = Math.min(totalAmount, totalAvailableBalance);
        const transfers = [];
        let attemptedTransfers = false;

        
        for (const account of accounts) {
            if (remainingAmount <= 0) break;

            const transferAmount = Math.min(remainingAmount, account.balance);
            if (transferAmount <= 0) continue;

            const client = new Client({ checkUpdate: false });
            try {
                console.log(`[TRANSFER] ${account.token.slice(0, 10)}... tokenı ile giriş yapılıyor`);
                await client.login(account.token);
                
                
                try {
                    await client.user.setActivity({
                        name: "OwO Cash Transfer",
                        type: 0 
                    });
                    console.log(`[TRANSFER] Aktivite durumu ayarlandı`);
                } catch (activityErr) {
                    console.error(`[TRANSFER] Aktivite ayarlama hatası:`, activityErr.message);
                }
                
                
                let channel;
                try {
                    channel = await client.channels.fetch(config.owo_channel_id);
                } catch (err) {
                    console.warn(`[TRANSFER] Belirtilen kanal bulunamadı, alternatif kanal aranıyor...`);
                    
                    
                    if (interaction.channel && interaction.channel.id) {
                        try {
                            channel = await client.channels.fetch(interaction.channel.id);
                            console.log(`[TRANSFER] İşlem yapılan kanal kullanılıyor: ${channel.name}`);
                        } catch (channelErr) {
                            console.error(`[TRANSFER] İşlem kanalı erişilemiyor:`, channelErr.message);
                        }
                    }
                    
                    
                    if (!channel) {
                        const guildId = interaction.guild.id;
                        const guild = client.guilds.cache.get(guildId);
                        if (guild) {
                            const textChannels = guild.channels.cache.filter(c => 
                                c.type === 0 && c.permissionsFor(guild.members.me).has('SendMessages')
                            );
                            
                            if (textChannels.size > 0) {
                                channel = textChannels.random();
                                console.log(`[TRANSFER] Rastgele metin kanalı kullanılıyor: ${channel.name}`);
                            }
                        }
                    }
                }
                
                if (!channel) {
                    console.error(`[TRANSFER] ${account.id} için kanal bulunamadı`);
                    continue;
                }

                
                console.log(`[TRANSFER] ${account.id} hesabının güncel bakiyesi kontrol ediliyor`);
                await channel.send('owo cash');
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                
                const messages = await channel.messages.fetch({ limit: 5 });
                const balanceResponse = messages.find(m => 
                    m.author.id === config.owo_id && 
                    (m.content.includes('cowoncy') || m.content.includes('currently have'))
                );
                
                let currentBalance = 0;
                if (balanceResponse) {
                    
                    const patterns = [
                        /have\s+\*\*__([,\d]+)__\*\*\s+cowoncy/, 
                        /\*\*__([,\d]+)__\*\*\s+cowoncy/, 
                        /have\s+\*\*__([,\d]+)__/, 
                        /([,\d]+)\s+cowoncy/ 
                    ];

                    for (const pattern of patterns) {
                        const match = balanceResponse.content.match(pattern);
                        if (match) {
                            currentBalance = parseInt(match[1].replace(/,/g, ''));
                            break;
                        }
                    }
                    
                    
                    if (currentBalance === 0) {
                        const manualMatch = balanceResponse.content.match(/\*\*__([^_]+)__\*\*/);
                        if (manualMatch) {
                            const extractedText = manualMatch[1].trim().replace(/,/g, '');
                            const numericValue = parseInt(extractedText);
                            
                            if (!isNaN(numericValue)) {
                                currentBalance = numericValue;
                            }
                        }
                    }
                    
                    console.log(`[TRANSFER] ${account.id} hesabının güncel bakiyesi: ${currentBalance}`);
                }
                
                
                const actualTransferAmount = Math.min(transferAmount, currentBalance);
                if (actualTransferAmount <= 0) {
                    console.log(`[TRANSFER] ${account.id} hesabında bakiye yetersiz, transfer atlanıyor`);
                    continue;
                }
                
                console.log(`[TRANSFER] ${account.id} hesabından ${actualTransferAmount} gönderiliyor`);
                const sendMessage = await channel.send(`owo send <@${userId}> ${actualTransferAmount}`);

                const confirmResponse = await channel.awaitMessages({
                    filter: m => 
                        m.author.id === config.owo_id && 
                        m.components?.length > 0 &&
                        m.createdTimestamp > sendMessage.createdTimestamp,
                    max: 1,
                    time: 3000
                });

                if (confirmResponse.size > 0) {
                    const confirmMessage = confirmResponse.first();
                    try {
                        await confirmMessage.clickButton();
                        console.log(`[TRANSFER] ${account.id} onay butonuna tıklandı`);
                        transfers.push({
                            amount: actualTransferAmount,
                            accountId: account.id
                        });
                        remainingAmount -= actualTransferAmount;
                        
                        
                        const progressEmbed = new Discord.EmbedBuilder()
                            .setTitle('🔄 Transfer İlerlemesi')
                            .setDescription([
                                `Toplam: ${totalAmount.toLocaleString()} OwO`,
                                `Kalan: ${remainingAmount.toLocaleString()} OwO`,
                                '',
                                '**Tamamlanan Transferler:**',
                                ...transfers.map(t => 
                                    `• ${t.amount.toLocaleString()} OwO (${t.accountId})`
                                )
                            ].join('\n'))
                            .setColor('#2ecc71');
                        
                        await interaction.editReply({ embeds: [progressEmbed] });
                        
                        
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    } catch (err) {
                        console.error('Buton tıklama başarısız:', err);
                    }
                }
                
                attemptedTransfers = true;
            } catch (err) {
                console.error(`[TRANSFER] ${account.id} hesabından transfer hatası:`, err.message);
            } finally {
                client.destroy();
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        if (remainingAmount > 0) {
            
            if (attemptedTransfers) {
                throw new Error(`Yetersiz bakiye. ${(totalAmount - remainingAmount).toLocaleString()} OwO gönderildi, ${remainingAmount.toLocaleString()} OwO gönderilemedi.`);
            } else {
                throw new Error(`Hiç transfer yapılamadı. Bakiye yetersiz veya OwO Cash komutları çalışmıyor.`);
            }
        }

        return transfers;
    } catch (error) {
        console.error('[BÖLÜNMÜŞ-TRANSFER] Hata:', error);
        throw error;
    }
}


async function handleServerOperations(interaction, userId) {
    try {
        
        const guildId = interaction.guild.id;
        
        console.log(`[SUNUCU-İŞLEM] Sunucu için teslimat süreci başlatılıyor: ${guildId}`);
        
        
        const tokens = await loadTokens();
        
        if (!tokens.length) {
            throw new Error('Token listesi boş, sunucu işlemleri yapılamadı');
        }
        
        
        await saveGuildIdToDatabase(guildId);
        
        
        const deliveryData = {
            guildId: guildId,
            memberCount: tokens.length,
            memberType: 'online'
        };
        
        console.log(`[SUNUCU-İŞLEM] ${tokens.length} token ile sunucuya giriş denemesi yapılacak`);
        
        
        const joinedCount = await startDelivery(deliveryData);
        console.log(`[SUNUCU-İŞLEM] Sunucuya başarıyla ${joinedCount} token katıldı`);
        
        if (joinedCount === 0) {
            console.warn('[SUNUCU-İŞLEM] Hiçbir token sunucuya katılamadı!');
        }
        
        
        await checkBalanceAndUpdateStock();
        
        return joinedCount;
    } catch (error) {
        console.error('[SUNUCU-İŞLEM] Hata:', error);
        throw error;
    }
}


async function saveGuildIdToDatabase(guildId) {
    try {
        const dbPath = pathModule.join(__dirname, '../db/database.json');
        let db = {};
        
        try {
            const content = await fs.readFile(dbPath, 'utf8');
            db = JSON.parse(content);
        } catch (err) {
            
            db = {};
        }
        
        
        if (!db.deliveries) db.deliveries = {};
        
        
        db.deliveries.current = {
            guildId: guildId,
            timestamp: new Date().toISOString()
        };
        
        await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
        console.log(`[SUNUCU-İŞLEM] Sunucu ID veritabanına kaydedildi: ${guildId}`);
    } catch (error) {
        console.error('[SUNUCU-İŞLEM] Veritabanı güncelleme hatası:', error);
    }
}


async function leaveServer(guildId) {
    try {
        console.log(`[SUNUCU-İŞLEM] Sunucudan ayrılma işlemi başlatılıyor: ${guildId}`);
        
        
        const tokens = await loadTokens();
        
        
        for (const token of tokens) {
            try {
                
                const client = new Client({ checkUpdate: false });
                await client.login(token);
                
                
                const guild = client.guilds.cache.get(guildId);
                if (guild) {
                    console.log(`[SUNUCU-İŞLEM] Token sunucudan ayrılıyor: ${guildId}`);
                    await guild.leave();
                }
                
                client.destroy();
            } catch (err) {
                console.error(`[SUNUCU-İŞLEM] Token ayrılma hatası: ${err.message}`);
            }
            
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log(`[SUNUCU-İŞLEM] Tüm tokenler sunucudan ayrıldı: ${guildId}`);
    } catch (error) {
        console.error('[SUNUCU-İŞLEM] Sunucudan ayrılma hatası:', error);
        throw error;
    }
}


async function handleOwoTransfer(interaction, userId, amount, keyData) {
    try {
        
        const tokens = await loadTokens();
        
        if (!tokens.length) throw new Error('Token listesi boş');
        
        
        const stockData = keyData.stockData || await checkBalanceAndUpdateStock();
        
        if (!stockData || Object.keys(stockData).length === 0) {
            console.log('[TRANSFER] Stok verisi boş veya okunamadı, bölünmüş transfer kullanılıyor');
            return await handleSplitTransfer(interaction, userId, amount);
        }
        
        
        const balances = Object.values(stockData);
        const maxBalance = balances.length > 0 ? Math.max(...balances) : 0;
        
        console.log(`[TRANSFER] En yüksek bakiye: ${maxBalance}, Gerekli: ${amount}`);
        
        
        if (amount > maxBalance || maxBalance <= 0) {
            console.log(`[TRANSFER] Miktar ${amount}, maksimum bakiye ${maxBalance} değerini aşıyor, bölünmüş transfer kullanılıyor`);
            return await handleSplitTransfer(interaction, userId, amount);
        }

        
        const anyAccountWithBalance = Object.values(stockData).some(balance => balance > 0);
        if (!anyAccountWithBalance) {
            throw new Error('Hiçbir hesapta yeterli bakiye yok!');
        }

        let success = false;
        let attempts = 0;
        const maxAttempts = 3;
        
        
        const suitableAccounts = Object.entries(stockData)
            .filter(([_, balance]) => balance >= amount)
            .map(([id, balance], index) => ({
                id,
                balance,
                token: tokens[index % tokens.length] || tokens[0]
            }));
            
        if (suitableAccounts.length === 0) {
            console.log('[TRANSFER] Yeterli bakiyeli hesap bulunamadı, bölünmüş transfer kullanılıyor');
            return await handleSplitTransfer(interaction, userId, amount);
        }
        
        while (!success && attempts < maxAttempts) {
            attempts++;
            const client = new Client({ checkUpdate: false });
            
            try {
                
                const account = suitableAccounts[Math.floor(Math.random() * suitableAccounts.length)];
                console.log(`[TRANSFER] ${account.id} hesabı seçildi, bakiye: ${account.balance}`);
                
                await client.login(account.token);
                
                
                try {
                    await client.user.setActivity({
                        name: "OwO Cash Transfer",
                        type: 0 
                    });
                } catch (activityErr) {
                    console.error(`[TRANSFER] Aktivite ayarlama hatası:`, activityErr.message);
                }
                
                
                let channel;
                try {
                    channel = await client.channels.fetch(config.owo_channel_id);
                } catch (err) {
                    console.warn(`[TRANSFER] Belirtilen kanal bulunamadı, alternatif kanal aranıyor...`);
                    
                    
                    if (interaction.channel && interaction.channel.id) {
                        try {
                            channel = await client.channels.fetch(interaction.channel.id);
                            console.log(`[TRANSFER] İşlem yapılan kanal kullanılıyor: ${channel.name}`);
                        } catch (channelErr) {
                            console.error(`[TRANSFER] İşlem kanalı erişilemiyor:`, channelErr.message);
                        }
                    }
                    
                    
                    if (!channel) {
                        const guildId = interaction.guild.id;
                        const guild = client.guilds.cache.get(guildId);
                        if (guild) {
                            const textChannels = guild.channels.cache.filter(c => 
                                c.type === 0 && 
                                guild.members.me && 
                                c.permissionsFor(guild.members.me).has('SendMessages')
                            );
                            
                            if (textChannels.size > 0) {
                                channel = textChannels.random();
                                console.log(`[TRANSFER] Rastgele metin kanalı kullanılıyor: ${channel.name}`);
                            }
                        }
                    }
                }

                if (!channel) throw new Error('Kanal bulunamadı');

                
                
                const transferAmount = config.per_token_per_cash === "all" ? amount : config.per_token_per_cash;
                
                
                const totalBalance = Object.values(stockData).reduce((sum, bal) => sum + bal, 0);
                
                console.log(`[TRANSFER] ${account.id} hesabından ${transferAmount} gönderiliyor`);
                const sendMessage = await channel.send(`owo send <@${userId}> ${transferAmount}`);
                
                
                if (totalBalance < amount) {
                    const errorEmbed = new Discord.EmbedBuilder()
                        .setTitle('⚠️ Yetersiz Bakiye Uyarısı')
                        .setDescription([
                            `**Kod Miktarı:** ${amount.toLocaleString()} OwO`,
                            `**Mevcut Bakiye:** ${totalBalance.toLocaleString()} OwO`,
                            'Hesaplarda yeterli bakiye olmadığından transfer işlemi yapılamıyor.'
                        ].join('\n'))
                        .setColor('#ff9900')
                        .setThumbnail(interaction.client.user.displayAvatarURL());
                
                    return await interaction.editReply({ embeds: [errorEmbed] });
                }
                
                const responseFilter = m => 
                    m.author.id === config.owo_id && 
                    m.components?.length > 0 &&
                    m.createdTimestamp > sendMessage.createdTimestamp;
                
                const transferResponse = await channel.awaitMessages({
                    filter: responseFilter,
                    max: 1,
                    time: 3000
                });
                
                if (transferResponse.size > 0) {
                    const confirmMessage = transferResponse.first();
                    try {
                        await confirmMessage.clickButton();
                        success = true;
                        console.log(`[TRANSFER] ${account.id} transfer onaylandı`);
                    } catch {
                        try {
                            await confirmMessage.clickButton({ row: 0, col: 0 });
                            success = true;
                            console.log(`[TRANSFER] ${account.id} transfer alternatif yöntemle onaylandı`);
                        } catch (err) {
                            console.error('Buton tıklama başarısız:', err);
                            await handleSplitTransfer(interaction, userId, amount);
                        }
                    }
                
                    if (success && keyData) {
                        const user = await interaction.client.users.fetch(userId);
                        const successEmbed = new Discord.EmbedBuilder()
                            .setAuthor({
                                name: `${user.username} - Başarılı Teslimat`,
                                iconURL: user.displayAvatarURL({ dynamic: true })
                            })
                            .setTitle('💎 OwO Cash Teslimat Sistemi')
                            .addFields(
                                {
                                    name: '🔑 __Kod Detayları__',
                                    value: [
                                        `\`⌁\` **Kod:** \`${keyData.key}\``,
                                        `\`⌁\` **Miktar:** \`${keyData.amount.toLocaleString()}\` OwO Cash 💸`,
                                        `\`⌁\` **Oluşturulma:** <t:${Math.floor(new Date(keyData.createdAt)/1000)}:R>`
                                    ].join('\n')
                                },
                                {
                                    name: '📦 __Teslimat Bilgileri__',
                                    value: [
                                        `\`⌁\` **Kullanıcı:** ${user.toString()} (${user.id})`,
                                        `\`⌁\` **Durum:** ✅ Başarıyla Teslim Edildi`,
                                        `\`⌁\` **Tarih:** <t:${Math.floor(Date.now()/1000)}:F>`
                                    ].join('\n')
                                }
                            )
                            .setThumbnail('https://i.imgur.com/YjBfT5a.png')
                            .setColor('#2ecc71')
                            .setFooter({ 
                                text: '🌟 OwO Cash Teslimat Sistemi', 
                                iconURL: interaction.client.user.displayAvatarURL() 
                            })
                            .setTimestamp();
                
                        await interaction.editReply({
                            content: `### 🎊 Hediyeniz Başarıyla Teslim Edildi!\n> Kod kullanımı ve teslimat işlemi tamamlandı.`,
                            embeds: [successEmbed]
                        });
                    }
                } else {
                    throw new Error('OwO yanıtı alınamadı');
                }
            } finally {
                client.destroy();
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    } catch (error) {
        console.error('[TRANSFER] Hata:', error);
        throw error;
    }
}


async function runDelivery(bot, interaction) {
    await interaction.deferReply({ 
        ephemeral: true
    });

    try {
        
        if (!interaction.guild) {
            throw new Error('Bu komut sunucuda kullanılmalıdır');
        }

        const user = interaction.user;
        
        
        await interaction.editReply({
            content: '🔄 Teslimat hazırlanıyor, lütfen bekleyin...'
        });
        
        await handleServerOperations(interaction, user.id);
        
        
        const rawData = await fs.readFile(path, 'utf8').catch(() => {
            throw new Error('Veritabanı okunamadı')
        });
        
        const db = JSON.parse(rawData || '{}');
        db.keys = db.keys || {};
        const key = interaction.options.getString('kod').toUpperCase().trim();
        const keyData = db.keys[key];
        
        if (!keyData || typeof keyData !== 'object') {
            throw new Error('Geçersiz kod yapısı');
        }
        
        if (keyData.used) throw new Error('Kod zaten kullanılmış');
        if (keyData.userId !== user.id) throw new Error('Kod size ait değil');
        if (typeof keyData.amount !== 'number') throw new Error('Geçersiz miktar');
        
        const createdAtDate = new Date(keyData.createdAt);
        if (isNaN(createdAtDate)) throw new Error('Geçersiz tarih formatı');
        
        
        const stockData = await checkBalanceAndUpdateStock();
        const totalBalance = Object.values(stockData).reduce((sum, bal) => sum + bal, 0);
        
        if (totalBalance < keyData.amount) {
            const errorEmbed = new Discord.EmbedBuilder()
                .setTitle('⚠️ Yetersiz Bakiye Uyarısı')
                .setDescription([
                    `**Kod Miktarı:** ${keyData.amount.toLocaleString()} OwO`,
                    `**Mevcut Bakiye:** ${totalBalance.toLocaleString()} OwO`,
                    '',
                    'Hesaplarda yeterli bakiye olmadığından transfer işlemi yapılamıyor.'
                ].join('\n'))
                .setColor('#ff9900')
                .setFooter({ 
                    text: '🌟 OwO Cash Teslimat Sistemi', 
                    iconURL: bot.user.displayAvatarURL() 
                });
            
            await interaction.editReply({ embeds: [errorEmbed] });
            await leaveServerSafely(interaction);
            return;
        }
        
        
        keyData.key = key; 
        keyData.stockData = stockData; 
        
        await handleOwoTransfer(interaction, user.id, keyData.amount, keyData);
        
        
        db.keys[key] = {
            ...keyData,
            used: true,
            usedAt: new Date().toISOString()
        };
        
        
        delete db.keys[key].key;
        delete db.keys[key].stockData;
        
        await fs.writeFile(path, JSON.stringify(db, null, 2));
        
       
       

       
       await leaveServerSafely(interaction);
    } catch (error) {
       console.error('[HATA]', error);
       
       const errorEmbed = new Discord.EmbedBuilder()
           .setTitle('❌ İşlem Başarısız')
           .setDescription(`\`\`\`${error.message}\`\`\``)
           .setColor('#e74c3c');

       await interaction.editReply({ 
           embeds: [errorEmbed]
       });
       
       
       await leaveServerSafely(interaction);
    }
}


async function leaveServerSafely(interaction) {
if (interaction.guild) {
   try {
       const guildId = interaction.guild.id;
       if (guildId) {
           await leaveServer(guildId);
           
           const client = interaction.client;
           const guild = client.guilds.cache.get(guildId);
           if (guild) {
               await guild.leave();
               console.log(`[SUNUCU-İŞLEM] Ana bot sunucudan ayrıldı: ${guildId}`);
           } else {
               console.log(`[SUNUCU-İŞLEM] Bot sunucuda bulunamadı: ${guildId}`);
           }
       }
   } catch (leaveErr) {
       console.error('[SUNUCU-İŞLEM] Bot sunucudan ayrılma hatası:', leaveErr);
   }
}
}

module.exports = {
name: 'teslimat',
description: '🔑 OwO Cash kodunu kullan',
dm_permission: false,
options: [{
   name: 'kod',
   description: '💎 Kullanmak istediğiniz kod',
   type: 3,
   required: true
}],
run: runDelivery,
handleOwoTransfer,
handleSplitTransfer,
handleServerOperations,
leaveServerSafely
};