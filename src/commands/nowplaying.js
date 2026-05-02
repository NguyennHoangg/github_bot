const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show the currently playing song'),

    async execute(interaction, queues) {
        const queue = queues.get(interaction.guild.id);
        const song = queue?.getCurrentSong();

        if (!song) {
            return interaction.reply({ content: 'Hien tai khong co bai hat nao dang phat!', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('Dang phat')
            .setDescription(`**[${song.title}](${song.url})**`)
            .addFields(
                { name: 'Thoi luong', value: song.duration, inline: true },
                { name: 'Nguoi yeu cau', value: song.requestedBy, inline: true }
            );
        if (song.thumbnail) embed.setThumbnail(song.thumbnail);

        return interaction.reply({ embeds: [embed] });
    },
};
