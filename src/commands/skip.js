const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current song'),

    async execute(interaction, queues) {
        const queue = queues.get(interaction.guild.id);
        if (!queue || !queue.isPlaying) {
            return interaction.reply({ content: 'Hien tai khong co bai hat nao dang phat!', ephemeral: true });
        }

        const skipped = queue.getCurrentSong();
        queue.skip();
        return interaction.reply(`Da bo qua **${skipped.title}**`);
    },
};
