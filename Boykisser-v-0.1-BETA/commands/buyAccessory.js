const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const accessoriesData = require('../objects/accessories.js');
const selectedAccessories = require('../objects/currentShopAccessories.js');
const User = require('../models/User.js'); // Sequelize User model

module.exports = {
  data: new SlashCommandBuilder()
    .setName('buyaccessory')
    .setDescription('Buy an accessory from the shop')
    .addStringOption(option =>
      option
        .setName('accessory')
        .setDescription(`Choose the accessory you'd like to buy!`)
        .setChoices(
          ...selectedAccessories.map(accessory => ({ name: accessory, value: accessory })) // Map to Discord.js format
        )
    ),

  run: async ({ interaction }) => {
    const selectedAccessory = interaction.options.getString('accessory');
    const userId = interaction.user.id; // Get the user ID from the interaction

    // Validate the selection
    if (!selectedAccessory) {
      return await interaction.reply({
        content: 'No accessory selected!',
        ephemeral: true,
      });
    }

    // Find the accessory details in accessoriesData
    const accessoryDetails = accessoriesData.find(a => a.name === selectedAccessory);

    // If the accessory isn't in the shop
    if (!accessoryDetails) {
      return await interaction.reply({
        content: `The accessory "${selectedAccessory}" is not available in the shop.`,
        ephemeral: true,
      });
    }

    // Retrieve user from database
    const user = await User.findOne({ where: { userId } });
    // If user doesn't exist in the database
    if (!user) {
      return await interaction.reply({
        content: `Could not find user data. Please try again later.`,
        ephemeral: true,
      });
    }

    // Check if the user has enough coins
    if (user.coinsInventory >= accessoryDetails.cost) {

      user.coinsInventory -= accessoryDetails.cost;
      user.collectedAccessories = [...user.collectedAccessories, accessoryDetails.name]; 
      await user.save();

      await interaction.reply(
        `You have purchased the **${accessoryDetails.name}** for **${accessoryDetails.cost} coins**!`
      );
    
    } else {
      // If the user doesn't have enough coins
      await interaction.reply(
        `You have **${user.coinsInventory} coins**, but the item costs **${accessoryDetails.cost} coins**!`
      );
    }
  },
};
