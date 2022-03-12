module.exports = async (client) => {
	
	var cMembers = client.users.cache.size;
	var gCount = client.guilds.cache.size;
	console.log(`${client.user.username} is online!`);

};