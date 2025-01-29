const { SlashCommandBuilder } = require('discord.js');
const User = require('../models/User.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removeaccessory1')
    .setDescription('Remove the accessory from slot 1 for one of your kissers.')
    .addStringOption((option) =>
      option
        .setName('kisser')
        .setDescription('Choose the kisser to remove the accessory from.')
        .setRequired(true)
    ),

  run: async ({ interaction }) => {
    const userId = interaction.user.id;
    const selectedKisser = interaction.options.getString('kisser');

    // Fetch the user's data
    const user = await User.findOne({ where: { userId } });

    if (!user) {
      return await interaction.reply({
        content: "You don't have any data saved yet!",
        ephemeral: true,
      });
    }

    // Validate selected kisser
    if (!user.collectedKissers.includes(selectedKisser)) {
      return await interaction.reply({
        content: `The kisser **${selectedKisser}** is not in your collection.`,
        ephemeral: true,
      });
    }

    // Check if there is an accessory to remove
    const removedAccessory = user.currentAccessory1?.[selectedKisser];
    if (!removedAccessory) {
      return await interaction.reply({
        content: `No accessory is currently assigned to **${selectedKisser}**.`,
        ephemeral: true,
      });
    }

    // Create a new object for currentAccessory1, excluding the selected kisser
    const updatedCurrentAccessory1 = { ...user.currentAccessory1 };
    delete updatedCurrentAccessory1[selectedKisser];

    // Update the database with the modified object
    user.currentAccessory1 = updatedCurrentAccessory1;

    // Add the removed accessory back to the collection
    user.collectedAccessories = [...user.collectedAccessories, removedAccessory];

    // Save changes to the database
    await user.save();

    return await interaction.reply({
      content: `Accessory **${removedAccessory}** has been removed from **${selectedKisser}** and added back to your collection.`,
      ephemeral: true,
    });
  },
};
