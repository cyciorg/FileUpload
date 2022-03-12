const {Intents} = require('discord.js');
const {User} = require('./db/connector.js');
const config = {

    ownerIDS: ["393996898945728523", "188712985475284996"],
  
    token: process.env.CLIENT_TOKEN,
    
    intents: [
      'GUILD_MESSAGES',
      'GUILD_MEMBERS',
      'GUILD_EMOJIS',
      'GUILD_INTEGRATIONS',
      'GUILDS',
      'GUILD_VOICE_STATES'
    ],

    permLevels: [
        { level: 0,
          name: "User", 
          check: () => true
        },
        { level: 1,
          name: "Premium",
            check: async (message) => {
                let premium = await User.findByEmailOrId2(message.author).then();
                if (premium.roles.includes(1)) {
                    return true;
                }
                    else return false;
                }
        },
        {
            level: 2,
            name: "Mods",
            check: async (message) => {
                let premium = await User.findByEmailOrId2(message.author).then();
                if (premium.roles.includes(2)) {
                    return true;
                }
                else return false;
            }
        },
        { level: 3,
          name: "Admin",
          check: async (message) => {
            let premium = await User.findByEmailOrId2(message.author).then();
                if (premium.roles.includes(3)) {
                    return true;
                }
                    else return false;
                }
        },
        { level: 10,
          name: "Owner", 
            check: async (message) => {
              let premium = await User.findByEmailOrId2(message.author).then();
                if (premium.roles.includes(4)) {
                    return true;
                }
                    else return false;
                }
          
        }
      ]
    };

module.exports = config;