const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/User.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listkissers')
    .setDescription('View all of your collected kissers!'),

  run: async ({ interaction }) => {
    const userId = interaction.user.id; // Get the user ID

    // Retrieve user from the database
    const user = await User.findOne({ where: { userId } });

    // Check if user exists
    if (!user) {
      return await interaction.reply({
        content: 'User not found!',
        ephemeral: true,
      });
    }

    // Check if collectedKissers exists and is not empty
    if (!user.collectedKissers || user.collectedKissers.length === 0) {
      return await interaction.reply({
        content: 'You have no kissers in your collection!',
        ephemeral: true,
      });
    }

    // Start with the first page (0 index)
    let pageIndex = 0;

    // Calculate total pages based on number of accessories (5 per page)
    const totalPages = Math.ceil(user.collectedKissers.length / 5);

    // Defer the reply so you can update it later
    await interaction.deferReply();

    // Display the first page of accessories
    await displayKissers();

    async function displayKissers() {
      // Get the accessories for the current page
      const start = pageIndex * 5;
      const end = start + 5;
      const accessoriesPage = user.collectedKissers.slice(start, end);

      console.log('Collected Kissers:', user.collectedKissers);  // Log to inspect structure
      console.log('Current Accessory1:', user.currentAccessory1);  // Log to inspect structure

      // Build the embed with the accessories for the current page
      const embed = new EmbedBuilder()
        .setTitle('Your Collected Kissers')
        .setDescription(
          accessoriesPage
            .map((kisser, index) => {
              // If collectedKissers contains a string, treat it as a simple name
              const kisserName = typeof kisser === 'string' ? kisser : kisser.name;
              const accessory1 = user.currentAccessory1 && user.currentAccessory1[kisserName] ? user.currentAccessory1[kisserName] : 'No accessory';
              const accessory2 = user.currentAccessory2 && user.currentAccessory2[kisserName] ? user.currentAccessory2[kisserName] : 'No accessory';
              const kisserXP = user.kisserXP && user.kisserXP[kisser] ? user.kisserXP[kisser] : 'No XP data';

              if (kisserName === user.favouriteKisser) {
                return `${start + index + 1}. ✨**${kisserName}** *XP: ${kisserXP}*\n  - Accessory 1: ${accessory1}\n  - Accessory 2: ${accessory2}`;
              }
              else {
                return `${start + index + 1}. **${kisserName}** *XP: ${kisserXP}*\n  - Accessory 1: ${accessory1}\n  - Accessory 2: ${accessory2}`;
            }
            })
            .join('\n')
        )
        .setColor('Random')
        .setFooter({
          text: `Page ${pageIndex + 1} of ${totalPages}`,
        });

      // Send the message with the embed
      const message = await interaction.editReply({
        embeds: [embed],
      });

      // Add the arrow emojis for pagination
      await message.react('⬅️');
      await message.react('➡️');

      // Set up the collector for handling reactions
      const filter = (reaction, user) => {
        return ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === interaction.user.id;
      };

      const collector = message.createReactionCollector({
        filter,
        time: 60000, // Collect for 1 minute
      });

      collector.on('collect', async (reaction) => {
        // Handle pagination
        if (reaction.emoji.name === '⬅️') {
          if (pageIndex > 0) {
            pageIndex--; // Go to previous page
          }
        } else if (reaction.emoji.name === '➡️') {
          if (pageIndex < totalPages - 1) {
            pageIndex++; // Go to next page
          }
        }

        // Remove the user's reaction to avoid infinite collecting
        await reaction.users.remove(interaction.user.id);

        // Update the message with the new page of accessories
        await displayKissers();
      });
    }
  },
};
