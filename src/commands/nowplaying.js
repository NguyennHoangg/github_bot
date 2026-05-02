const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show the currently playing song'),

    async execute(interaction, queues) {
        const queue = queues.get(interaction.guild.id);
        const song = queue?.getCurrentSong();

        if (!song) {
            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('🎵 Now Playing')
            .setDescription(`**[${song.title}](${song.url})**`)
            .addFields(
                { name: '⏱ Duration', value: song.duration, inline: true },
                { name: '👤 Requested by', value: song.requestedBy, inline: true }
            );
        if (song.thumbnail) embed.setThumbnail(song.thumbnail);

        return interaction.reply({ embeds: [embed] });
    },
};
