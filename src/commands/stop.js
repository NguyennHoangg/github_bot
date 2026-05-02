const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop playback and clear the queue'),

    async execute(interaction, queues) {
        const queue = queues.get(interaction.guild.id);
        if (!queue || !queue.isPlaying) {
            return interaction.reply({ content: '❌ Nothing is playing!', ephemeral: true });
        }

        queue.stop();
        return interaction.reply('⏹ Stopped playback and cleared the queue.');
    },
};
