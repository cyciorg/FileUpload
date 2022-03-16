const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const {models} = require('../../db/connector');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('promote')
        .setDescription('Allows you to promote a user within the server.')
        .addUserOption(option => option.setName('target').setDescription('Select a user to promote'))
        .addIntegerOption(option => option.setName('num').setDescription('set the number of roles to promote')),
    extras: {
      permLevel: 3  
    },
    async run(interaction) {
        //console.log(interaction);
        //interaction.reply({ content: 'pong' });
        let account = await models.User.findByEmailOrId({ userid: interaction.member.user.id, email: null});
        if (!account) return interaction.reply({ content: 'You are not registered on the database! please sign up on the website!', ephemeral: true });
        //console.log(account);
        //console.log(account.roles.includes('4'));
        if (!account.roles.includes('3')) return interaction.reply({ content: 'You are not an admin!', ephemeral: true });
        let userToPromote = interaction.options.getUser('target');
        if (!userToPromote) return interaction.reply({ content: 'You need to select a user to promote!', ephemeral: true });
        let promotionId = interaction.options.getInteger('num');
        if (!promotionId) return interaction.reply({ content: 'You need to select a number out of the roles to promote! \`\`\`1: Premium, 2: Mod, 3: Admin', ephemeral: true });
        if (promotionId > 3 || promotionId < 1) return interaction.reply({ content: 'You need to select a number out of the roles to promote! \`\`\`1: Premium, 2: Mod, 3: Admin', ephemeral: true });
        let user = await models.User.findByEmailOrId({ userid: userToPromote.id, email: null });
        if (!user) return interaction.reply({ content: 'The user you selected is not registered on the database!', ephemeral: true });
        if (user.roles.includes(promotionId)) return interaction.reply({ content: 'The user you selected already has that role!', ephemeral: true });
        let roles = user.roles;
        roles.push(promotionId);
        user.roles = roles;
        user.save(function (err, result) {
            if (err) return interaction.reply({ content: 'An error occured while promoting the user!', ephemeral: true });
            interaction.reply({ content: 'The user has been promoted!', ephemeral: true });
        });

    }
};
