const { SlashCommandBuilder } = require('discord.js');
const User = require('../models/User.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setstarkisser')
    .setDescription('Set one of your kissers as your starkisser.')
    .addStringOption((option) =>
      option
        .setName('starkisser') // Matches the name used in getString()
        .setDescription('Choose the kisser to set as your starkisser.')
        .setRequired(true)
    ),

  run: async ({ interaction }) => {
    const userId = interaction.user.id;
    const selectedKisser = interaction.options.getString('starkisser'); // Corrected to match option name

    const user = await User.findOne({ where: { userId } });

    if (!user) {
      return await interaction.reply({
        content: "You don't have any data saved yet!",
        ephemeral: true, // Keep this message private
      });
    }

    // Validate collectedKissers array and check for selectedKisser
    if (!Array.isArray(user.collectedKissers) || !user.collectedKissers.includes(selectedKisser)) {
      return await interaction.reply({
        content: `The kisser **${selectedKisser}** is not in your collection.`,
        ephemeral: true,
      });
    }

    // Set the selected kisser as the starkisser
    user.favouriteKisser = selectedKisser;

    // Save changes
    await user.save();

    // Success message
    return await interaction.reply({
      content: `**${selectedKisser}** has been set as your starkisser!`,
    });
  },
};
