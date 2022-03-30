const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const {models} = require('../../db/connector');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('demote')
        .setDescription('Allows you to demote a user within the server.')
        .addUserOption(option => option.setName('target').setDescription('Select a user to demote'))
        .addIntegerOption(option => option.setName('num').setDescription('Select the role to remove from the user')),
    extras: {
        permLevel: 3
    },
    async run(interaction) {
        let account = await models.User.findByEmailOrId({ userid: interaction.member.user.id, email: null});
        if (!account) return interaction.reply({ content: 'You are not registered on the database! please sign up on the website!', ephemeral: true });
        if (!account.roles.includes('3')) return interaction.reply({ content: 'You are not an admin!', ephemeral: true });
        let userToDemote = interaction.options.getUser('target');
        if (!userToDemote) return interaction.reply({ content: 'You need to select a user to demote!', ephemeral: true });
        let demotionId = interaction.options.getInteger('num');
        if (!demotionId) return interaction.reply({ content: 'You need to select a number out of the roles to demote! \`\`\`1: Premium, 2: Mod, 3: Admin', ephemeral: true });
        if (demotionId > 3 || demotionId < 1) return interaction.reply({ content: 'You need to select a number out of the roles to demote! \`\`\`1: Premium, 2: Mod, 3: Admin', ephemeral: true });
        let user = await models.User.findByEmailOrId({ userid: userToDemote.id, email: null });
        if (!user) return interaction.reply({ content: 'The user you selected is not registered on the database!', ephemeral: true });
        if (!user.roles.includes(demotionId)) return interaction.reply({ content: 'The user you selected does not have that role!', ephemeral: true });
        let roles = user.roles;
        roles.splice(roles.indexOf(demotionId), 1);
        user.roles = roles;
        user.save(function (err, result) {
            if (err) return interaction.reply({ content: 'An error occured while demoting the user!', ephemeral: true });
            interaction.reply({ content: 'The user has been demoted!', ephemeral: true });
        });
    }
};