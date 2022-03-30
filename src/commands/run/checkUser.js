const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const {models} = require('../../db/connector');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkuser')
        .setDescription('Allows you to promote a user within the server.')
        .addUserOption(option => option.setName('target').setDescription('Select a user to check the info of')),
    extras: {
        permLevel: 2
    },
    async run(interaction) {
        let account = await models.User.findByEmailOrId({ userid: interaction.member.user.id, email: null});
        if (!account) return interaction.reply({ content: 'You are not registered on the database! please sign up on the website!', ephemeral: true });
        if (!account.roles.includes('2')) return interaction.reply({ content: 'You are not a moderator!', ephemeral: true });
        let userToCheck = interaction.options.getUser('target');
        if (!userToCheck) return interaction.reply({ content: 'You need to select a user to check the info of!', ephemeral: true });
        let user = await models.User.findByEmailOrId({ userid: userToCheck.id, email: null });
        if (!user) return interaction.reply({ content: 'The user you selected is not registered on the database!', ephemeral: true });
        let embed = new MessageEmbed()
            .setTitle(`${user.username}'s info`)
            .setColor('#0099ff')
            .setThumbnail(userToCheck.avatarURL({ format: 'gif', dynamic: true, size: 1024 }))
            .addField('Username', user.username, true)
            .addField('Email', user.email, true)
            .addField('Roles', user.roles.join(', '), true)
            .addField('Files', user.data.length, true)
            .addField('Created at', user.createdAt, true)
            .setFooter('Copyright of Cyci Org 2022');
        interaction.reply({ embed });
    }
};