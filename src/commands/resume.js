const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume the paused song'),

    async execute(interaction, queues) {
        const queue = queues.get(interaction.guild.id);
        if (!queue || !queue.isPlaying) {
            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
        }

        const success = queue.resume();
        return interaction.reply(success ? '▶️ Resumed.' : '❌ Not currently paused!');
    },
};
