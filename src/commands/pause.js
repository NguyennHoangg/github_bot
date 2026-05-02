const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the current song'),

    async execute(interaction, queues) {
        const queue = queues.get(interaction.guild.id);
        if (!queue || !queue.isPlaying) {
            return interaction.reply({ content: 'Hien tai khong co bai hat nao dang phat!', ephemeral: true });
        }

        const success = queue.pause();
        return interaction.reply(success ? 'Da tam dung.' : 'Bai hat da duoc tam dung roi!');
    },
};
