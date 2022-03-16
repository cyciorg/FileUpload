require('dotenv').config()
const { log } = require('console');
const Discord = require("discord.js");
const {Intents} = require('discord.js');
const client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS] });
const { readdir } = require("fs/promises");
client.config = require("./config.js");
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
const {connectDb} = require("./db/connector.js");
client.cooldown = new Discord.Collection();
client.temporaryCommands = []
require('./commands/commandHandler')(client);
client.global = {};

async function init() {
    const cmds = await readdir("./src/commands/run/");
    //client.logger.log(`Loading a total of ${cmds.length} commands.`);
    cmds.forEach(f => {
        if (!f.endsWith(".js")) return;
        const response = client.loadSlashCommand(f);
        if (response) console.log(response);
    });
    const event = await readdir("./src/events/");
    //client.logger.log(`Loading a total of ${event.length} events.`);
    event.forEach(file => {
        const eventName = file.split(".")[0];
        const event = require(`./events/${file}`);
        client.on(eventName, event.bind(null, client));
    });
    
    client.levelCache = {};
    for (let i = 0; i < client.config.permLevels.length; i++) {
        const thisLevel = client.config.permLevels[i];
        client.levelCache[thisLevel.name] = thisLevel.level;
    }
    try {
        client.login(client.config.token);
    } catch (err) {
        client.logger.error(err);
        procces.exit(1);
    }
}
log(`Starting client...`);
connectDb().then(async (info) => {
    log(`Connected to MongoDB at ${info}`);
    init();
}).catch(errMongo => {
    console.log(errMongo);
});