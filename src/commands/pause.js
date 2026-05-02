const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the current song'),

    async execute(interaction, queues) {
        const queue = queues.get(interaction.guild.id);
        if (!queue || !queue.isPlaying) {
            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
        }

        const success = queue.pause();
        return interaction.reply(success ? '⏸ Paused.' : '❌ Already paused!');
    },
};
