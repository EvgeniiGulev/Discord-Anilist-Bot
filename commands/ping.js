const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Shows the API\'s current latency.'),
	async execute(interaction) {
		const botLatency = (`Latency is ${Date.now() - interaction.createdTimestamp}ms.`);

		await interaction.reply(botLatency);
	},
};