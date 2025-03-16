const Discord = require('discord.js');
const fs = require('fs');
const config = require('../config.js'); 

module.exports = {
    name: 'olustur',
    description: '🎁 OwO Cash için özel kod oluşturur',
    dm_permission: true,
    options: [
        {
            name: 'kullanici',
            description: '👤 Kodun tanımlanacağı kullanıcı (ID veya etiket)',
            type: 3,
            required: true
        },
        {
            name: 'miktar',
            description: '💸 Tanımlanacak OwO Cash miktarı',
            type: 4,
            required: true
        }
    ],
    run: async (bot, interaction) => { 
        
        await interaction.deferReply({ 
            flags: Discord.MessageFlags.Ephemeral 
        });

        if (interaction.user.id !== config.ownerID) {
            return interaction.editReply({ 
                content: '⛔ Bu komutu sadece bot sahibi kullanabilir!'
            });
        }

        let targetUser;
        const userInput = interaction.options.getString('kullanici');
        const amount = interaction.options.getInteger('miktar');
        
        
        if (/^\d+$/.test(userInput)) {
            
            try {
                targetUser = await bot.users.fetch(userInput);
            } catch (err) {
                return interaction.editReply({
                    content: '❌ Geçersiz kullanıcı ID\'si. Kullanıcı bulunamadı.'
                });
            }
        } else if (userInput.startsWith('<@') && userInput.endsWith('>')) {
            
            const userId = userInput.replace(/[<@!>]/g, '');
            try {
                targetUser = await bot.users.fetch(userId);
            } catch (err) {
                return interaction.editReply({
                    content: '❌ Geçersiz kullanıcı etiketi. Kullanıcı bulunamadı.'
                });
            }
        } else {
            return interaction.editReply({
                content: '❌ Geçersiz giriş. Lütfen bir kullanıcı ID\'si veya etiket girin.'
            });
        }
        
        if (!targetUser) {
            return interaction.editReply({
                content: '❌ Kullanıcı bulunamadı.'
            });
        }
        
        
        const key = Array(4).fill()
            .map(() => Array(5).fill()
            .map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)])
            .join('')).join('-');

        let db = { keys: {} };
        try {
            db = JSON.parse(fs.readFileSync('./db/database.json', 'utf8'));
        } catch (err) {}
        if (!db.keys) db.keys = {};

        db.keys[key] = {
            userId: targetUser.id,
            amount: amount,
            createdAt: new Date().toISOString(),
            createdBy: interaction.user.id,
            used: false
        };

        fs.writeFileSync('./db/database.json', JSON.stringify(db, null, 2));

        
        const embed = new Discord.EmbedBuilder()
            .setAuthor({ name: '🎉 OwO Cash Kodu Oluşturuldu!', iconURL: bot.user.displayAvatarURL() })
            .setThumbnail('https://i.imgur.com/gT4sZyw.png')
            .addFields(
                { name: '👤 Hedef Kullanıcı', value: `${targetUser.toString()} \`(${targetUser.id})\``, inline: true },
                { name: '💰 Miktar', value: `\`${amount.toLocaleString()} OwO Cash\` 🌟`, inline: true },
                { name: '🔑 Aktivasyon Kodu', value: `\`\`\`fix\n${key}\`\`\`` },
                { name: '📅 Oluşturulma Tarihi', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: true },
                { name: '🛠️ Oluşturan', value: `${interaction.user.toString()}`, inline: true }
            )
            .setColor('#00FF00')
            .setFooter({ 
                text: `OwO Cash Sistemi | ${interaction.user.tag}`, 
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
            })
            .setTimestamp();

        await interaction.editReply({ 
            content: `✅ **${targetUser.username}** için kod başarıyla oluşturuldu!`,
            embeds: [embed]
        });
    }
}