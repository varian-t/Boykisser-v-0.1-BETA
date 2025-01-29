const { randomSpawn } = require('../../utils/randomSpawn.js');
const { EmbedBuilder } = require('discord.js');
const Guild = require('../../models/guild.js');
const { Sequelize, Op } = require('sequelize'); // Import Sequelize and Op

module.exports = (client) => {
  console.log(`${client.user.tag} is ready bbygrl`);

  // Log the number of guilds the bot is connected to
  console.log(`Bot is connected to ${client.guilds.cache.size} guild(s)`);

  // Start the spawn logic
  console.log('Starting randomSpawn function');
  randomSpawn(client);
};