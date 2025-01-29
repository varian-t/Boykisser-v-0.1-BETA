const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/User.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listaccessories')
    .setDescription('View all of your collected accessories!'),

  run: async ({ interaction }) => {
    const userId = interaction.user.id; // Get the user ID

    // Retrieve user from the database
    const user = await User.findOne({ where: { userId } });

    // If the user doesn't exist or has no accessories
    if (!user || !user.collectedAccessories.length) {
      return await interaction.reply({
        content: 'You have no accessories yet!',
        ephemeral: true,
      });
    }

    // Start with the first page (0 index)
    let pageIndex = 0;

    // Calculate total pages based on number of accessories (5 per page)
    const totalPages = Math.ceil(user.collectedAccessories.length / 5);

    // Defer the reply so you can update it later
    await interaction.deferReply();

    // Display the first page of accessories
    await displayAccessories();

    async function displayAccessories() {
      // Get the accessories for the current page
      const start = pageIndex * 5;
      const end = start + 5;
      const accessoriesPage = user.collectedAccessories.slice(start, end);

      // Build the embed with the accessories for the current page
      const embed = new EmbedBuilder()
        .setTitle('Your Collected Accessories')
        .setDescription(
          accessoriesPage
            .map((accessory, index) => `${start + index + 1}. **${accessory}**`)
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
        await displayAccessories();
      });
    }
  },
};
