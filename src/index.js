require('dotenv').config();
const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
    ],
});

client.commands = new Collection();
const queues = new Map(); // guildId -> MusicQueue

// Load all slash commands from src/commands/
const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
    const command = require(path.join(commandsPath, file));
    if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
    }
}

client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`📋 Loaded ${client.commands.size} commands`);
    client.user.setActivity('🎵 /play', { type: ActivityType.Listening });
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, queues);
    } catch (error) {
        console.error(`[Command Error: ${interaction.commandName}]`, error);
        const msg = { content: '❌ An error occurred!', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply(msg).catch(() => {});
        } else {
            await interaction.reply(msg).catch(() => {});
        }
    }
});

// Auto-disconnect when bot is left alone in a voice channel
client.on('voiceStateUpdate', (oldState) => {
    const botChannel = oldState.guild.members.me?.voice.channel;
    if (!botChannel) return;

    const humans = botChannel.members.filter(m => !m.user.bot);
    if (humans.size === 0) {
        const queue = queues.get(oldState.guild.id);
        if (queue) {
            queue.textChannel?.send('👋 Everyone left, disconnecting!');
            queue.stop();
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
