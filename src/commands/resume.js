const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume the paused song'),

    async execute(interaction, queues) {
        const queue = queues.get(interaction.guild.id);
        if (!queue || !queue.isPlaying) {
            return interaction.reply({ content: 'Hien tai khong co bai hat nao dang phat!', ephemeral: true });
        }

        const success = queue.resume();
        return interaction.reply(success ? 'Da tiep tuc phat nhac.' : 'Bai hat dang phat, khong o trang thai tam dung!');
    },
};
