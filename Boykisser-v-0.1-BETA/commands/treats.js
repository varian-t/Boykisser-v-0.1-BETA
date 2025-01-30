const { SlashCommandBuilder } = require('discord.js');
const Users = require('../models/User'); // Path to your Sequelize user model
const { Op } = require('sequelize');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('treats')
    .setDescription('Resets your treats to 10 (can only be used every 5 minutes).'),
  
    run: async ({ interaction }) => {
    const userId = interaction.user.id;

    try {
      // Fetch user from the database or create one if it doesn't exist
      const user = await Users.findOrCreate({
        where: { userId },
        defaults: {
          treatsInventory: 10,
          lastTreatReset: null,
        },
      }).then(([user]) => user); // Extract user instance from array

      const now = new Date();
      const cooldownTime = 36000000; // hours * mins * secs * milliseconds

      // Check if user has used the command recently
      if (user.lastTreatReset && now - user.lastTreatReset < cooldownTime) {
        const remainingTime = Math.ceil((cooldownTime - (now - user.lastTreatReset)) / 1000);
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;

        return interaction.reply(
          `⏳ You can use this command again in ${minutes > 0 ? `${minutes}m` : ''}${seconds}s.`
        );
      }

      // Reset treats and update the timer
      user.treatsInventory = 10;
      user.lastTreatReset = now;
      await user.save();

      // Confirm the reset
      return interaction.reply(`🎉 Your treats have been reset to 10!`);
    } catch (error) {
      console.error('Error resetting treats:', error);
      return interaction.reply(
        `❌ An error occurred while resetting your treats. Please try again later.`
      );
    }
  },
};
