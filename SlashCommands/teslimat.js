const Discord = require('discord.js');
const fs = require('fs').promises;
const path = './db/database.json';
const { Client } = require('discord.js-selfbot-v13');
const config = require('../config.json');

// Add new function for handling split transfers
async function handleSplitTransfer(interaction, userId, totalAmount) {
    try {
        // Read current stock data
        const stockData = JSON.parse(await fs.readFile('./db/stock.json', 'utf8'));
        
        // Sort accounts by balance (highest first)
        const accounts = Object.entries(stockData)
            .sort(([, a], [, b]) => b - a)
            .map(([id, balance]) => ({
                id,
                balance,
                token: config.account_tokens[0] // Match token to account - you need to implement proper matching
            }));

        console.log('[TRANSFER] Mevcut hesaplar:', accounts);

        let remainingAmount = totalAmount;
        const transfers = [];

        // Try to make transfers from accounts with sufficient balance
        for (const account of accounts) {
            if (remainingAmount <= 0) break;

            const transferAmount = Math.min(remainingAmount, account.balance);
            if (transferAmount <= 0) continue;

            const client = new Client({ checkUpdate: false });
            try {
                await client.login(account.token);
                const channel = await client.channels.fetch(config.owo_channel_id);

                console.log(`[TRANSFER] ${account.id} hesabından ${transferAmount} gönderiliyor`);
                const sendMessage = await channel.send(`owo send <@${userId}> ${transferAmount}`);

                const response = await channel.awaitMessages({
                    filter: m => 
                        m.author.id === config.owo_id && 
                        m.components?.length > 0 &&
                        m.createdTimestamp > sendMessage.createdTimestamp,
                    max: 1,
                    time: 1500
                });

                if (response.size > 0) {
                    const confirmMessage = response.first();
                    try {
                        await confirmMessage.clickButton();
                        transfers.push({
                            amount: transferAmount,
                            accountId: account.id
                        });
                        remainingAmount -= transferAmount;
                        
                        // Update progress
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
                    } catch (err) {
                        console.error('Buton tıklama başarısız:', err);
                    }
                }
            } finally {
                client.destroy();
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        if (remainingAmount > 0) {
            throw new Error(`Yetersiz bakiye. ${(totalAmount - remainingAmount).toLocaleString()} OwO gönderildi, ${remainingAmount.toLocaleString()} OwO gönderilemedi.`);
        }

        return transfers;
    } catch (error) {
        console.error('[BÖLÜNMÜŞ-TRANSFER] Hata:', error);
        throw error;
    }
}

// Modify existing handleOwoTransfer to use split transfer for large amounts
async function handleOwoTransfer(interaction, userId, amount) {
    try {
        if (!config.account_tokens?.length) throw new Error('Token listesi boş');
        
        // Read stock data
        const stockData = JSON.parse(await fs.readFile('./db/stock.json', 'utf8'));
        
        // If amount is larger than any single account balance, use split transfer
        const maxBalance = Math.max(...Object.values(stockData));
        if (amount > maxBalance) {
            console.log(`[TRANSFER] Amount ${amount} exceeds max balance ${maxBalance}, using split transfer`);
            return await handleSplitTransfer(interaction, userId, amount);
        }

        let success = false;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (!success && attempts < maxAttempts) {
            attempts++;
            const client = new Client({ checkUpdate: false });
            
            try {
                const token = config.account_tokens[Math.floor(Math.random() * config.account_tokens.length)];
                await client.login(token);
                
                const channel = await client.channels.fetch(config.owo_channel_id);
                if (!channel) throw new Error('Kanal bulunamadı');

                const transferAmount = config.per_token_per_cash === "all" ? amount : config.per_token_per_cash;
                
                
                const sendMessage = await channel.send(`owo send <@${userId}> ${transferAmount}`);
                
                
                const responseFilter = m => 
                    m.author.id === config.owo_id && 
                    m.components?.length > 0 &&
                    m.createdTimestamp > sendMessage.createdTimestamp;

                
                const response = await channel.awaitMessages({
                    filter: responseFilter,
                    max: 1,
                    time: 1500
                });

                if (response.size > 0) {
                    const confirmMessage = response.first();
                    try {
                        
                        await confirmMessage.clickButton();
                        success = true;
                    } catch {
                        
                        try {
                            await confirmMessage.clickButton({ row: 0, col: 0 });
                            success = true;
                        } catch (err) {
                            console.error('Button click failed:', err);
                        }
                    }

                    if (success) {
                        await interaction.editReply({
                            content: `✅ **${transferAmount.toLocaleString()} OwO** başarıyla gönderildi!\n> Deneme: ${attempts}/${maxAttempts}`,
                            components: []
                        });
                    }
                } else {
                    throw new Error('OwO yanıtı alınamadı');
                }

            } catch (err) {
                console.error(`Deneme ${attempts}/${maxAttempts} başarısız:`, err);
                if (attempts === maxAttempts) throw err;
                
                
                await new Promise(resolve => setTimeout(resolve, 1000));
            } finally {
                client.destroy();
            }
        }

    } catch (error) {
        await interaction.editReply({
            content: `❌ Transfer hatası: ${error.message}`,
            components: []
        });
        throw error;
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
    run: async (bot, interaction) => {
        await interaction.deferReply({ 
            flags: Discord.MessageFlags.Ephemeral 
        });

        try {

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

            const user = interaction.user;
            

            if (keyData.used) throw new Error('Kod zaten kullanılmış');
            if (keyData.userId !== user.id) throw new Error('Kod size ait değil');
            if (typeof keyData.amount !== 'number') throw new Error('Geçersiz miktar');
            

            const createdAtDate = new Date(keyData.createdAt);
            if (isNaN(createdAtDate)) throw new Error('Geçersiz tarih formatı');

            await handleOwoTransfer(interaction, user.id, keyData.amount);

            db.keys[key] = { 
                ...keyData, 
                used: true, 
                usedAt: new Date().toISOString() 
            };
            await fs.writeFile(path, JSON.stringify(db, null, 2));

            // Embed oluşturma
            const embed = new Discord.EmbedBuilder()
                .setAuthor({
                    name: `${user.username} - Başarılı Teslimat`,
                    iconURL: user.displayAvatarURL({ dynamic: true })
                })
                .setTitle('💎 OwO Cash Teslimat Sistemi')
                .setDescription(`> 🎉 Tebrikler! Kodunuz başarıyla kullanıldı ve ödülünüz gönderildi.`)
                .addFields(
                    {
                        name: '🔑 __Kod Detayları__',
                        value: [
                            `\`⌁\` **Kod:** \`${key}\``,
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
                    iconURL: bot.user.displayAvatarURL() 
                })
                .setTimestamp();

            await interaction.editReply({ 
                content: `### 🎊 Hediyeniz Başarıyla Teslim Edildi!\n> Kod kullanımı ve teslimat işlemi tamamlandı.`,
                embeds: [embed] 
            });

        } catch (error) {
            console.error('[HATA]', error);
            
            const errorEmbed = new Discord.EmbedBuilder()
                .setTitle('❌ İşlem Başarısız')
                .setDescription(`\`\`\`${error.message}\`\`\``)
                .setColor('#e74c3c');

            await interaction.editReply({ 
                embeds: [errorEmbed]
            });
        }
    }
};