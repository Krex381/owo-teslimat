const Discord = require('discord.js');
const fs = require('fs');
const path = './db/database.json';
const config = require('../config.js'); 

module.exports = {
    name: 'kodlar',
    description: '📜 Kullanıcının OwO Cash kodlarını gösterir',
    dm_permission: false,
    options: [{
        name: 'kullanici',
        description: '👤 Kodlarını görüntülemek istediğiniz kullanıcı',
        type: 6,
        required: false
    }],
    run: async (bot, interaction) => { 
        await interaction.deferReply({ 
            flags: Discord.MessageFlags.Ephemeral 
        });
        
        const generateEmbed = async (targetUser) => {
            let db = { keys: {} };
            try {
                db = JSON.parse(fs.readFileSync(path, 'utf8'));
            } catch (err) {
                return { content: '❌ Veritabanı bulunamadı!', embeds: [] };
            }

            const userCodes = Object.entries(db.keys || {})
                .filter(([_, data]) => data.userId === targetUser.id)
                .map(([key, data]) => ({
                    key,
                    
                    amount: `🪙 ${data.amount.toLocaleString('tr-TR')} OwO`,
                    date: `<t:${Math.floor(new Date(data.createdAt)/1000)}:D>`,
                    status: data.used ? '🔴 Kullanıldı' : '🟢 Aktif'
                }));

            const embed = new Discord.EmbedBuilder()
                .setAuthor({ 
                    name: `📂 ${targetUser.username} - OwO Kod Geçmişi`, 
                    iconURL: targetUser.displayAvatarURL({ dynamic: true }) 
                })
                .setColor('#2F3136')
                .setThumbnail('https://i.imgur.com/rVzH2Id.png');

            if (userCodes.length > 0) {
                
                const totalAmount = userCodes.reduce((acc, code) => 
                    acc + Number(code.amount.match(/[\d.]+/)[0].replace(/\./g, '')), 0);
                
                const avgAmount = userCodes.length > 0 
                    ? Math.round(totalAmount / userCodes.length) 
                    : 0;

                const codeList = userCodes.slice(0, 5).map((code, index) => 
                    `**${index+1}.** \`\`\`fix\n${code.key}\`\`\`\n» ${code.amount} • ${code.date} • ${code.status}`
                ).join('\n\n');

                embed.addFields(
                    {
                        name: '📊 İstatistikler',
                        value: [
                            `• Toplam Kod: \`${userCodes.length}\``,
                            `• Toplam Tutar: \`${totalAmount.toLocaleString('tr-TR')} OwO\``,
                            `• Ortalama: \`${avgAmount.toLocaleString('tr-TR')} OwO\``
                        ].join('\n'),
                        inline: true
                    },
                    {
                        name: '📜 Son Kodlar',
                        value: codeList,
                        inline: false
                    }
                );
            } else {
                embed.setDescription('❌ Kayıtlı kod bulunamadı!');
            }

            return embed;
        };

       
        const targetUser = interaction.options.getUser('kullanici') || interaction.user;
        const embed = await generateEmbed(targetUser);

        
        const row = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setCustomId('refresh_codes')
                .setLabel('Yenile')
                .setEmoji('🔄')
                .setStyle(Discord.ButtonStyle.Primary)
        );

        const message = await interaction.editReply({ 
            embeds: [embed], 
            components: [row],
            ephemeral: true 
        });

        
        const filter = i => i.customId === 'refresh_codes' && i.user.id === interaction.user.id;
        const collector = message.createMessageComponentCollector({ filter, time: 300000 });

        collector.on('collect', async i => {
            await i.deferUpdate();
            const newEmbed = await generateEmbed(targetUser);
            await i.editReply({ embeds: [newEmbed] });
        });

        collector.on('end', () => {
            message.edit({ components: [] }).catch(() => {});
        });
    }
}