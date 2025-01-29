const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');
const User = require('../models/User.js');
const accessoriesData = require('../objects/accessories.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription("Displays your profile with your StarKisser and stats."),

  run: async ({ interaction }) => {
    const userId = interaction.user.id;
    const username = interaction.user.username;

    // Fetch user data
    const user = await User.findOne({ where: { userId } });

    if (!user) {
      return await interaction.reply({
        content: "You don't have a profile yet! Start playing to create one.",
        ephemeral: true,
      });
    }

    // Get user stats
    const coins = user.coinsInventory || 0;
    const treats = user.treatsInventory || 0;
    const favoriteKisser = user.favouriteKisser || 'None';
    const favoriteKisserXP = user.kisserXP[favoriteKisser] || 0;
    const startDate = user.createdAt ? new Date(user.createdAt).toDateString() : 'Unknown';

    // Check for StarKisser
    const starKisser = user.favouriteKisser;
    const hasStarKisser = Boolean(starKisser);

    let starKisserBuffer = null;
    let starKisserImagePath = null;

    if (hasStarKisser) {
      // Fetch accessories
      const currentAccessory1 = user.currentAccessory1 || {};
      const currentAccessory2 = user.currentAccessory2 || {};

      // Create canvas for StarKisser image
      const canvas = createCanvas(256, 256);
      const ctx = canvas.getContext('2d');

      // Load and draw StarKisser
      starKisserImagePath = path.join(__dirname, `../images/boykissers/${starKisser}Base.png`);
      const starKisserImage = await loadImage(starKisserImagePath);
      ctx.drawImage(starKisserImage, 0, 0, canvas.width, canvas.height);

      // Function to add accessories
      const addAccessory = async (accessoryName) => {
        if (!accessoryName) return;
        const accessoryData = accessoriesData.find(a => a.name === accessoryName);
        if (!accessoryData) return;
        const accessoryImagePath = path.join(__dirname, accessoryData.filepath);
        const accessoryImage = await loadImage(accessoryImagePath);
        ctx.drawImage(accessoryImage, 0, 0, canvas.width, canvas.height);
      };

      await addAccessory(currentAccessory1[starKisser]);
      await addAccessory(currentAccessory2[starKisser]);

      // Convert canvas to buffer
      starKisserBuffer = canvas.toBuffer('image/png');
      starKisserImageAttachment = new AttachmentBuilder(starKisserBuffer, { name: 'starkisser.png' });

      // Set image URL (this is a placeholder, Discord will replace it with a real one)
      starKisserURL = 'attachment://starkisser.png';
    }

    // Create embed
    const embed = new EmbedBuilder()
      .setTitle(`**${username}'s Profile**`)
      .setDescription(
        `**Coins:** ${coins} 🪙\n` +
        `**Treats:** ${treats} 🍬\n` +
        `**Starkisser:** ${favoriteKisser}\n` +
        `**Starkisser XP:** ${favoriteKisserXP} ⭐\n` +
        `**Started Playing:** ${startDate}`
      )
      .setColor('Random');

      if (starKisserURL) {
        embed.setThumbnail(starKisserURL); // Embed image inside the little square
      } else {
        embed.setFooter({ text: "Set a StarKisser to display its image and stats!" });
      }

    // Send the response
    const response = { embeds: [embed] };
    if (starKisserImageAttachment) {
      response.files = [starKisserImageAttachment]; // Attach the image to use its URL in the embed
    }


    await interaction.reply(response);
  },
};
