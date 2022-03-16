module.exports = (client) => {
    client.loadSlashCommand = async (commandName) => {
        try {
        const props = require(`./run/${commandName}`);
        if (props.init) {
            props.init(client);
            }
        client.temporaryCommands.push(props.data.toJSON());
        client.commands.set(props.data.name, props);
        return false;
    } catch (e) {
        return `Unable to load command ${commandName}: ${e}`;
    }
    };
};