const {
    REST
} = require('@discordjs/rest');
const {
    Routes
} = require('discord-api-types/v9');

module.exports = async (client) => {
	const TEST_GUILD_ID = process.env['TEST_GUILD_ID'];

	var cMembers = client.users.cache.size;
	var gCount = client.guilds.cache.size;
	console.log(`${client.user.username} is online!`);

	const CLIENT_ID = client.user.id;
    const rest = new REST({
        version: '9'
    }).setToken(process.env.CLIENT_TOKEN);
    (async () => {
        try {
            if (!TEST_GUILD_ID) {
                await rest.put(
                    Routes.applicationCommands(CLIENT_ID), {
                        body: client.temporaryCommands
                    },
                );
                console.log('Successfully registered application commands globally');
            } else {
                await rest.put(
                    Routes.applicationGuildCommands(CLIENT_ID, TEST_GUILD_ID), {
                        body: client.temporaryCommands
                    },
                );
                console.log('Successfully registered application commands for development guild');
            }
        } catch (error) {
            if (error) console.error(error);
        } finally {
            console.log(`Registered ${client.temporaryCommands.length} commands`);
            client.temporaryCommands.splice(0, client.temporaryCommands.length);
        }
    })();

};