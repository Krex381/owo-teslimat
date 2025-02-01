const Discord = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config.json');
const { checkStock } = require('../utils/stockManager');

module.exports = {
    name: 'stok',
    description: '💰 OwO Cash stok durumunu gösterir',
    dm_permission: false,
    run: async (bot, interaction) => {
        if (interaction.user.id !== config.ownerID) {
            return interaction.reply({
                content: '⛔ Bu komutu sadece bot sahibi kullanabilir!',
                flags: [Discord.MessageFlags.Ephemeral]
            });
        }

        // Initial reply with loading message
        await interaction.reply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription('🔄 Hesaplar kontrol ediliyor...')
                    .setColor('#2F3136')
            ],
            flags: [Discord.MessageFlags.Ephemeral]
        });

        try {
            // Force new stock check
            const stockData = await checkStock();

            let totalStock = 0;
            const stockDetails = [];

            for (const [accountId, amount] of Object.entries(stockData)) {
                totalStock += parseInt(amount) || 0;
                stockDetails.push(`\`•\` Account ID: \`${accountId}\` → ${amount.toLocaleString()} OwO`);
            }

            const embed = new Discord.EmbedBuilder()
                .setTitle('🏦 OwO Cash Stok Durumu')
                .setDescription([
                    `### 📊 Toplam Stok: \`${totalStock.toLocaleString()}\` OwO`,
                    '',
                    '### 📝 Hesap Detayları:',
                    ...stockDetails
                ].join('\n'))
                .setColor('#2F3136')
                .setTimestamp()
                .setFooter({ 
                    text: `Son Güncelleme`, 
                    iconURL: bot.user.displayAvatarURL() 
                });

            await interaction.editReply({ 
                embeds: [embed],
                flags: [Discord.MessageFlags.Ephemeral]
            });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ 
                content: '❌ Stok bilgisi alınamadı!',
                flags: [Discord.MessageFlags.Ephemeral]
            });
        }
    }
};
