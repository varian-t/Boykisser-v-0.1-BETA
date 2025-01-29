const { SlashCommandBuilder } = require('discord.js');
const User = require('../models/User.js'); // Assuming you have a User model where the collectedAccessories are stored

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trade')
    .setDescription('Trade accessories with another user')
    .addUserOption(option => option.setName('target').setDescription('The user to trade with').setRequired(true))
    .addStringOption(option => option.setName('accessory').setDescription('The accessory you want to trade').setRequired(true))
    .addStringOption(option => option.setName('targetaccessory').setDescription('The accessory the other user wants to trade').setRequired(true)),

  run: async ({ interaction }) => {
    const target = interaction.options.getUser('target');
    const accessoryToTrade = interaction.options.getString('accessory');
    const targetAccessory = interaction.options.getString('targetaccessory');
    
    // Fetch both users' data
    const user = await User.findOne({ where: { userId: interaction.user.id } });
    const targetUser = await User.findOne({ where: { userId: target.id } });

    // Check if the user has the accessory they want to trade
    if (!user.collectedAccessories.includes(accessoryToTrade)) {
      return interaction.reply("You don't have that accessory to trade! 💔");
    }

    // Check if the target user has the accessory they want to trade
    if (!targetUser.collectedAccessories.includes(targetAccessory)) {
      return interaction.reply(`${target.username} doesn't have that accessory to trade! 💔`);
    }

    // Ask the target user if they want to confirm the trade
    await interaction.reply(`${target}, do you want to trade **${accessoryToTrade}** for **${targetAccessory}**? Type "yes" to confirm!`);

    const filter = (response) => response.author.id === target.id && response.content.toLowerCase() === 'yes';
    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 30000 });

    collector.on('collect', async () => {
      // If target confirms the trade
      await interaction.followUp(`${target.username} has confirmed the trade!`);

      // Now ask the original user for confirmation
      await interaction.followUp(`**${interaction.user.username}**, do you agree with this trade? Type "yes" to confirm!`);

      const filterUser = (response) => response.author.id === interaction.user.id && response.content.toLowerCase() === 'yes';
      const collectorUser = interaction.channel.createMessageCollector({ filter: filterUser, max: 1, time: 30000 });

      collectorUser.on('collect', async () => {
        // If both users confirm the trade, proceed with the logic

        // Function to remove the first instance of the accessory from the collectedAccessories
        const removeAccessory = (user, accessory) => {
          const accessoryIndex = user.collectedAccessories.indexOf(accessory);
          if (accessoryIndex !== -1) {
            const updatedCollectedAccessories = [...user.collectedAccessories];
            updatedCollectedAccessories.splice(accessoryIndex, 1); // Remove the accessory at its first occurrence
            user.collectedAccessories = updatedCollectedAccessories;
          }
        };

        // Assign accessories to the users based on their chosen trade items
        user.currentAccessory1 = {
          ...user.currentAccessory1,
          [target.username]: targetAccessory, // Assume `selectedKisser` is the target user's username
        };

        targetUser.currentAccessory1 = {
          ...targetUser.currentAccessory1,
          [interaction.user.username]: accessoryToTrade, // Assume `selectedKisser` is the original user's username
        };

        // Remove the accessories from both users' inventories
        removeAccessory(user, accessoryToTrade);
        removeAccessory(targetUser, targetAccessory);

        // Add the traded accessories to each user's inventory
        user.collectedAccessories.push(targetAccessory);
        targetUser.collectedAccessories.push(accessoryToTrade);

        // Save the changes to the users
        await user.save();
        await targetUser.save();

        // Send confirmation message
        await interaction.followUp(`🎉 The trade is complete! **${interaction.user.username}** now has **${targetAccessory}**, and **${target.username}** now has **${accessoryToTrade}**!`);
      });

      collectorUser.on('end', async (collected, reason) => {
        if (reason === 'time') {
          await interaction.followUp("The trade was not confirmed in time. The trade has been cancelled.");
        }
      });
    });

    collector.on('end', async (collected, reason) => {
      if (reason === 'time') {
        await interaction.followUp(`${target.username} did not respond in time. The trade has been cancelled.`);
      }
    });
  }
};
