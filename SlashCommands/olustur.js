const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'olustur',
    description: '🎁 OwO Cash için özel kod oluşturur',
    dm_permission: true,
    options: [
        {
            name: 'kullanici',
            description: '👤 Kodun tanımlanacağı kullanıcı',
            type: 6,
            required: true
        },
        {
            name: 'miktar',
            description: '💸 Tanımlanacak OwO Cash miktarı',
            type: 4,
            required: true
        }
    ],
    run: async (bot, interaction, args, config) => {
        
        await interaction.deferReply({ 
            flags: Discord.MessageFlags.Ephemeral 
        });

        if (interaction.user.id !== config.ownerID) {
            return interaction.editReply({ 
                content: '⛔ Bu komutu sadece bot sahibi kullanabilir!'
            });
        }

        const targetUser = interaction.options.getUser('kullanici');
        const amount = interaction.options.getInteger('miktar');
        
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