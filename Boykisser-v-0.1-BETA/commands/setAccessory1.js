const { SlashCommandBuilder } = require('discord.js');
const User = require('../models/User.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setaccessory1')
    .setDescription('Assign an accessory to one of your kissers (if the slot is empty).')
    .addStringOption((option) =>
      option
        .setName('kisser')
        .setDescription('Choose the kisser to assign the accessory to.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('accessory')
        .setDescription('Choose the accessory to assign.')
        .setRequired(true)
    ),

  run: async ({ interaction }) => {
    const userId = interaction.user.id;
    const selectedKisser = interaction.options.getString('kisser');
    const selectedAccessory = interaction.options.getString('accessory');

    const user = await User.findOne({ where: { userId } });

    if (!user) {
      return await interaction.reply({
        content: "You don't have any data saved yet!",
        ephemeral: true,
      });
    }

    // Validate kisser
    if (!user.collectedKissers.includes(selectedKisser)) {
      return await interaction.reply({
        content: `The kisser **${selectedKisser}** is not in your collection.`,
        ephemeral: true,
      });
    }

    // Check if the slot is occupied
    if (user.currentAccessory1?.[selectedKisser]) {
      return await interaction.reply({
        content: `Accessory slot 1 for **${selectedKisser}** is already occupied. Use /removeaccessory1 to free the slot first.`,
        ephemeral: true,
      });
    }

    // Validate accessory
    const accessoryIndex = user.collectedAccessories.indexOf(selectedAccessory);
    if (accessoryIndex === -1) {
      return await interaction.reply({
        content: `The accessory **${selectedAccessory}** is not in your collection.`,
        ephemeral: true,
      });
    }

    // Assign accessory
    user.currentAccessory1 = {
      ...user.currentAccessory1,
      [selectedKisser]: selectedAccessory,
    };

    // Remove only the first instance of the accessory from collectedAccessories
    const updatedCollectedAccessories = [...user.collectedAccessories];
    updatedCollectedAccessories.splice(accessoryIndex, 1); // Remove the accessory at its first occurrence
    user.collectedAccessories = updatedCollectedAccessories;

    // Save changes
    await user.save();

    return await interaction.reply({
      content: `Accessory **${selectedAccessory}** has been assigned to **${selectedKisser}**!`,
      ephemeral: true,
    });
  },
};
