const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = require('../config');
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
    const { data } = require(path.join(commandsPath, file));
    if (data) commands.push(data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
    try {
        console.log(`Deploying ${commands.length} command(s)...`);

        if (GUILD_ID) {
            // Guild commands update instantly — use during development
            await rest.put(
                Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
                { body: commands }
            );
            console.log(`Deployed ${commands.length} guild command(s) to guild ${GUILD_ID}`);
        } else {
            // Global commands can take up to 1 hour to propagate
            await rest.put(
                Routes.applicationCommands(CLIENT_ID),
                { body: commands }
            );
            console.log(`Deployed ${commands.length} global command(s)`);
        }
    } catch (err) {
        console.error('Failed to deploy commands:', err);
    }
})();
