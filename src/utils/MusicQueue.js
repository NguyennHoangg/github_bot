const {
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
} = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');

class Song {
    constructor({ title, url, duration, thumbnail, requestedBy }) {
        this.title = title;
        this.url = url;
        this.duration = duration || 'Unknown';
        this.thumbnail = thumbnail || null;
        this.requestedBy = requestedBy;
    }
}

class MusicQueue {
    constructor(guildId, queues) {
        this.guildId = guildId;
        this.queues = queues; // Reference to outer Map for self-cleanup
        this.songs = [];
        this.connection = null;
        this.player = createAudioPlayer();
        this.isPlaying = false;
        this.textChannel = null;
        this.voiceChannel = null;

        this.player.on(AudioPlayerStatus.Idle, () => {
            this.songs.shift();
            if (this.songs.length > 0) {
                this._startPlaying();
            } else {
                this.isPlaying = false;
                this.textChannel?.send('Het hang cho. Bot da ngat ket noi.');
                this._cleanup();
            }
        });

        this.player.on('error', (error) => {
            console.error('[Player Error]:', error.message);
            const failed = this.songs[0];
            this.songs.shift();
            this.textChannel?.send(`Loi khi phat **${failed?.title ?? 'Khong ro ten'}**. Dang bo qua...`);
            if (this.songs.length > 0) {
                this._startPlaying();
            } else {
                this.isPlaying = false;
                this._cleanup();
            }
        });
    }

    async _startPlaying() {
        const play = require('play-dl');
        const song = this.songs[0];
        try {
            const stream = await play.stream(song.url);
            const resource = createAudioResource(stream.stream, { inputType: stream.type });
            this.player.play(resource);
            this.isPlaying = true;

            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('Dang phat')
                .setDescription(`**[${song.title}](${song.url})**`)
                .addFields(
                    { name: 'Thoi luong', value: song.duration, inline: true },
                    { name: 'Nguoi yeu cau', value: song.requestedBy, inline: true }
                );
            if (song.thumbnail) embed.setThumbnail(song.thumbnail);
            this.textChannel?.send({ embeds: [embed] });
        } catch (error) {
            console.error('[Stream Error]:', error.message);
            this.textChannel?.send(`Khong the phat **${song.title}**. Dang bo qua...`);
            this.songs.shift();
            if (this.songs.length > 0) {
                await this._startPlaying();
            } else {
                this.isPlaying = false;
                this._cleanup();
            }
        }
    }

    async enqueue(song, connection) {
        const wasEmpty = this.songs.length === 0;
        this.songs.push(song);
        this.connection = connection;
        if (wasEmpty) {
            connection.subscribe(this.player);
            await this._startPlaying();
        }
    }

    skip() {
        // Stopping triggers AudioPlayerStatus.Idle → auto-plays next song
        this.player.stop();
    }

    stop() {
        this.songs = [];
        this.player.stop(true); // force=true prevents Idle event
        this._cleanup();
    }

    pause() {
        return this.player.pause();
    }

    resume() {
        return this.player.unpause();
    }

    getCurrentSong() {
        return this.songs[0] ?? null;
    }

    getUpcoming() {
        return this.songs.slice(1);
    }

    _cleanup() {
        try { this.connection?.destroy(); } catch {}
        this.connection = null;
        this.isPlaying = false;
        this.queues?.delete(this.guildId);
    }
}

module.exports = { Song, MusicQueue };
