const Discord = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Discord API gecikmesini gösterir.',
    dm_permission: true,
    run: async (bot, interaction, args, config) => {
        const embed = new Discord.EmbedBuilder()
        .setTitle('`🪄` ▸ Bot Gecikmesi')
        .setDescription(`> *Discord Api: \`${bot.ws.ping}\` ms.*`)
        .setFooter({text: interaction.user.username, iconURL: interaction.user.displayAvatarURL()})
        .setColor(config.color)
        .setTimestamp();
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
}