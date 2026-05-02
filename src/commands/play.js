const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const play = require('play-dl');
const { Song, MusicQueue } = require('../utils/MusicQueue');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song from YouTube')
        .addStringOption(o =>
            o.setName('query')
             .setDescription('Song name or YouTube URL')
             .setRequired(true)
        ),

    async execute(interaction, queues) {
        await interaction.deferReply();

        const query = interaction.options.getString('query');
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.editReply('Ban phai o trong mot kenh thoai truoc!');
        }

        const perms = voiceChannel.permissionsFor(interaction.client.user);
        if (!perms.has(PermissionFlagsBits.Connect) || !perms.has(PermissionFlagsBits.Speak)) {
            return interaction.editReply('Bot can quyen Ket Noi va Noi trong kenh thoai do!');
        }

        try {
            let url, details;

            if (play.yt_validate(query) === 'video') {
                url = query;
                const info = await play.video_info(url);
                details = info.video_details;
            } else {
                const results = await play.search(query, { limit: 1 });
                if (!results.length) return interaction.editReply('Khong tim thay ket qua nao!');
                details = results[0];
                url = details.url;
            }

            const song = new Song({
                title: details.title ?? 'Unknown Title',
                url,
                duration: details.durationRaw ?? 'Unknown',
                thumbnail: details.thumbnails?.[0]?.url ?? null,
                requestedBy: interaction.user.tag,
            });

            let queue = queues.get(interaction.guild.id);
            if (!queue) {
                queue = new MusicQueue(interaction.guild.id, queues);
                queue.textChannel = interaction.channel;
                queue.voiceChannel = voiceChannel;
                queues.set(interaction.guild.id, queue);
            }

            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            const wasEmpty = queue.songs.length === 0;
            await queue.enqueue(song, connection);

            if (!wasEmpty) {
                const embed = new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setTitle('Da them vao hang cho')
                    .setDescription(`**[${song.title}](${song.url})**`)
                    .addFields(
                        { name: 'Thoi luong', value: song.duration, inline: true },
                        { name: 'Vi tri', value: `#${queue.songs.length}`, inline: true }
                    );
                if (song.thumbnail) embed.setThumbnail(song.thumbnail);
                return interaction.editReply({ embeds: [embed] });
            }

            return interaction.editReply(`Dang tai **${song.title}**...`);
        } catch (err) {
            console.error('[play]', err);
            return interaction.editReply('Khong the phat bai hat. Vui long thu bai khac hoac URL khac.');
        }
    },
};
