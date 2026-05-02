const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show the current song queue'),

    async execute(interaction, queues) {
        const queue = queues.get(interaction.guild.id);
        if (!queue || queue.songs.length === 0) {
            return interaction.reply({ content: 'Hang cho trong!', ephemeral: true });
        }

        const current = queue.getCurrentSong();
        const upcoming = queue.getUpcoming();

        let description = `**Dang phat:**\n[${current.title}](${current.url}) | \`${current.duration}\`\n`;

        if (upcoming.length > 0) {
            description += `\n**Tiep theo:**\n`;
            const display = upcoming.slice(0, 10);
            description += display
                .map((s, i) => `\`${i + 1}.\` [${s.title}](${s.url}) | \`${s.duration}\``)
                .join('\n');
            if (upcoming.length > 10) {
                description += `\n\`...va ${upcoming.length - 10} bai nua\``;
            }
        }

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('Hang cho nhac')
            .setDescription(description)
            .setFooter({ text: `${queue.songs.length} bai trong hang cho` });

        return interaction.reply({ embeds: [embed] });
    },
};
