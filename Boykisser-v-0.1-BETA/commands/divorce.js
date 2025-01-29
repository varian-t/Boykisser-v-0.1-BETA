const { SlashCommandBuilder } = require('discord.js');
const { Op } = require('sequelize');
const Soulmates = require('../models/Soulmates'); // Path to your Soulmates model
const User = require('../models/User.js'); // Path to your User model

module.exports = {
  data: new SlashCommandBuilder()
    .setName('divorce')
    .setDescription('Divorce a soulmate by name.')
    .addStringOption((option) =>
      option
        .setName('kissername')
        .setDescription('The name of the kisser you want to divorce.')
        .setRequired(true)
    ),

  run: async ({ interaction }) => {
    const userId = interaction.user.id; // User initiating the divorce
    const kisserName = interaction.options.getString('kissername'); // The kisser to be divorced

    // Fetch the user from the database
    const user = await User.findOne({ where: { userId } });

    if (!user) {
      return interaction.reply({
        content: 'User not found in the database.',
        ephemeral: true,
      });
    }

    // Check if the kisser exists in the user's relationships
    const relationship = await Soulmates.findOne({
      where: {
        [Op.or]: [
          { 'soulmate1.userId': userId, 'soulmate1.kisserName': kisserName },
          { 'soulmate2.userId': userId, 'soulmate2.kisserName': kisserName },
        ],
      },
    });

    if (!relationship) {
      return interaction.reply({
        content: `💔 No relationship found with the kisser "${kisserName}". Please check the name and try again!`,
      });
    }

    // Determine the other user in the relationship
    const otherSoulmate =
      relationship.soulmate1.userId === userId
        ? relationship.soulmate2
        : relationship.soulmate1;

    // Fetch the other user's information for tagging
    const otherUser = await User.findOne({ where: { userId: otherSoulmate.userId } });

    // Check if the user has enough coins
    if (user.CoinsInventory < 200) {
      return interaction.reply({
        content: `💸 You need 200 coins to file for a divorce, but you only have ${user.CoinsInventory} coins!`,
      });
    }

    // Tag both users and prompt confirmation
    await interaction.reply({
      content: `💔 <@${userId}> and <@${otherSoulmate.userId}>, divorcing "${kisserName}" will cost 200 coins. <@${userId}>, type 'confirm' to proceed. This request will timeout in 60 seconds.`,
    });

    const filter = (response) =>
      response.author.id === userId && response.content.toLowerCase() === 'confirm';

    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });

    collector.on('collect', async () => {
      // Deduct the divorce fee from user's CoinsInventory
      user.coinsInventory -= 200;
      await user.save();

      // Remove the relationship from the Soulmates database
      await Soulmates.destroy({
        where: {
          [Op.or]: [
            { 'soulmate1.userId': userId, 'soulmate1.kisserName': kisserName },
            { 'soulmate2.userId': userId, 'soulmate2.kisserName': kisserName },
          ],
        },
      });

      // Notify both users of the successful divorce
      await interaction.followUp({
        content: `💔 <@${userId}> and <@${otherSoulmate.userId}>, the relationship involving "${kisserName}" has been ended. You are no longer soulmates.`,
      });
    });

    collector.on('end', (collected) => {
      if (collected.size === 0) {
        interaction.followUp({
          content: `❌ The divorce was canceled. <@${userId}>, you did not confirm in time.`,
        });
      }
    });
  },
};
