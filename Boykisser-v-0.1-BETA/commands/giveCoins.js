const { SlashCommandBuilder } = require('discord.js');
const User = require('../models/User.js'); // Path to your User model

module.exports = {
  data: new SlashCommandBuilder()
    .setName('givecoins')
    .setDescription('Give coins to another user.')
    .addUserOption((option) =>
      option.setName('user').setDescription('The user to give coins to').setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName('amount').setDescription('The amount of coins to give').setRequired(true)
    ),

  run: async ({ interaction }) => {
    const giverId = interaction.user.id; // The user who is giving coins
    const recipient = interaction.options.getUser('user'); // The user receiving coins
    const amount = interaction.options.getInteger('amount'); // The amount of coins to transfer

    // Fetch the giver's data from the database
    const giver = await User.findOne({ where: { userId: giverId } });

    // Fetch the recipient's data from the database
    const recipientData = await User.findOne({ where: { userId: recipient.id } });

    // Check if both users exist in the database
    if (!giver || !recipientData) {
      return interaction.reply({
        content: 'One of the users is not found in the database.',
        ephemeral: true,
      });
    }

    // Check if the giver has enough coins
    if (giver.coinsInventory < amount) {
      return interaction.reply({
        content: `💸 You don't have enough coins! You only have ${giver.coinsInventory} coins.`,
        ephemeral: true,
      });
    }

    // Deduct the coins from the giver's inventory
    giver.coinsInventory -= amount;
    await giver.save();

    // Add the coins to the recipient's inventory
    recipientData.coinsInventory += amount;
    await recipientData.save();

    // Send confirmation message
    await interaction.reply({
      content: `🎉 <@${giverId}> has given ${amount} coins to ${recipient}!`,
    });
  },
};
