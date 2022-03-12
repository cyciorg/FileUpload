module.exports = (client) => {

client.loadCommand = (commandName) => {
    try {
        const props = require(`./run/${commandName}`);
        if (props.init) {
            props.init(client);
        }
        client.commands.set(props.help.name, props);
        props.conf.aliases.forEach(alias => {
            client.aliases.set(alias, props.help.name);
        });
        return false;
    } catch (e) {
        return `Unable to load command ${commandName}: ${e}`;
    }
};

client.unloadCommand = async (commandName) => {
    let command;
    if (client.commands.has(commandName)) {
        command = client.commands.get(commandName);
    } else if (client.aliases.has(commandName)) {
        command = client.commands.get(client.aliases.get(commandName));
    }
    if (!command) return `The command \`${commandName}\` doesn"t seem to exist, nor is it an alias. Try again!`;
    if (command.shutdown) {
        await command.shutdown(client);
    }
    const mod = require.cache[require.resolve(`./run/${commandName}`)];
    client.commands.delete(commandName);
    for (let i = 0; i < mod.parent.children.length; i++) {
        if (mod.parent.children[i] === mod) {
          mod.parent.children.splice(i, 1);
          break;
        }
      }
      return false;
};
};