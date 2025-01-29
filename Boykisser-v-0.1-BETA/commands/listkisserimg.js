const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');
const User = require('../models/User.js');
const accessoriesData = require('../objects/accessories.js'); // Your accessories data

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listkissersimg')
    .setDescription('Display all your kissers with their accessories.'),

  run: async ({ interaction }) => {
    const userId = interaction.user.id;

    // Fetch user data
    const user = await User.findOne({ where: { userId } });

    if (!user || !user.collectedKissers.length) {
      return await interaction.reply({
        content: 'You have no kissers to display!',
        ephemeral: true,
      });
    }

    const kissers = user.collectedKissers;
    const currentAccessory1 = user.currentAccessory1 || {}; // Accessory 1 data
    const currentAccessory2 = user.currentAccessory2 || {}; // Accessory 2 data
    const images = [];
    let pageIndex = 0;

    // Generate image data for all kissers
    for (const kisser of kissers) {
      const canvas = createCanvas(512, 512);
      const ctx = canvas.getContext('2d');

      // Load kisser image
      const kisserImagePath = path.join(__dirname, `../images/boykissers/${kisser}Base.png`);
      const kisserImage = await loadImage(kisserImagePath);

      ctx.drawImage(kisserImage, 0, 0, canvas.width, canvas.height);

      // Add accessory 1 if available
      const accessoryName1 = currentAccessory1[kisser];
      if (accessoryName1) {
        const accessoryData1 = accessoriesData.find((a) => a.name === accessoryName1);
        if (accessoryData1) {
          const accessoryImagePath1 = path.join(__dirname, accessoryData1.filepath);
          const accessoryImage1 = await loadImage(accessoryImagePath1);

          // Draw accessory 1 on the canvas
          ctx.drawImage(accessoryImage1, 0, 0, canvas.width, canvas.height);
        }
      }

      // Add accessory 2 if available
      const accessoryName2 = currentAccessory2[kisser];
      if (accessoryName2) {
        const accessoryData2 = accessoriesData.find((a) => a.name === accessoryName2);
        if (accessoryData2) {
          const accessoryImagePath2 = path.join(__dirname, accessoryData2.filepath);
          const accessoryImage2 = await loadImage(accessoryImagePath2);

          // Draw accessory 2 on the canvas
          ctx.drawImage(accessoryImage2, 0, 0, canvas.width, canvas.height);
        }
      }

      // Convert canvas to buffer and store
      const buffer = canvas.toBuffer('image/png');
      images.push({ kisser, buffer });
    }

    const totalPages = images.length;

    // Defer the reply so you can update it later
    await interaction.deferReply();

    // Function to display current kisser image
    const displayKisser = async () => {
      const { kisser, buffer } = images[pageIndex];

      // Fetch the XP data for the current kisser
      const kisserXP = user.kisserXP && user.kisserXP[kisser] ? user.kisserXP[kisser] : 'No XP data';

      // Check if the kisser is the starkisser
      let setTitleString = '';
      if (kisser === user.favouriteKisser) {
        setTitleString = `Displaying Kisser: ✨**${kisser}**✨`;
      } else {
        setTitleString = `Displaying Kisser: **${kisser}**`;
      }

      // Create embed for the kisser
      const embed = new EmbedBuilder()
        .setTitle(setTitleString)
        .setDescription(
          `XP: **${kisserXP}**\n\n` + // Display XP under the kisser name
          `Accessory 1: **${currentAccessory1[kisser] || 'None'}**\n` + // Accessory 1 name
          `Accessory 2: **${currentAccessory2[kisser] || 'None'}**\n\n` + // Accessory 2 name
          `Page ${pageIndex + 1} of ${totalPages}`
        )
        .setColor('Random');

      // Send the embed with the image
      const message = await interaction.editReply({
        embeds: [embed],
        files: [{ attachment: buffer, name: `${kisser}.png` }],
      });

      // Add reactions for pagination
      await message.react('⬅️');
      await message.react('➡️');

      // Set up the reaction collector for pagination
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

        // Update the message with the new kisser image
        await displayKisser();
      });
    };

    // Display the first page of the kissers
    displayKisser();
  },
};
