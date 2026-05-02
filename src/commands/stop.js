const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop playback and clear the queue'),

    async execute(interaction, queues) {
        const queue = queues.get(interaction.guild.id);
        if (!queue || !queue.isPlaying) {
            return interaction.reply({ content: 'Hien tai khong co bai hat nao dang phat!', ephemeral: true });
        }

        queue.stop();
        return interaction.reply('Da dung phat nhac va xoa hang cho.');
    },
};
