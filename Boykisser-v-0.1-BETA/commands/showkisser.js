const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');
const { Op } = require('sequelize'); // Import Op for database queries
const User = require('../models/User.js');
const Soulmates = require('../models/Soulmates.js');
const accessoriesData = require('../objects/accessories.js'); 
const dateLocations = require('../objects/dateLocations.js'); // Import date locations

module.exports = {
  data: new SlashCommandBuilder()
    .setName('showkisser')
    .setDescription('Display a specific kisser by index.')
    .addIntegerOption(option =>
      option
        .setName('index')
        .setDescription('The index of the kisser in your collection (starting from 1).')
        .setRequired(true)
    ),

  run: async ({ interaction }) => {
    const userId = interaction.user.id;
    const index = interaction.options.getInteger('index') - 1; // Convert to zero-based index

    // Fetch user data
    const user = await User.findOne({ where: { userId } });

    if (!user || !user.collectedKissers.length) {
      return await interaction.reply({
        content: 'You have no kissers to display!',
        ephemeral: true,
      });
    }

    // Validate the index
    if (index < 0 || index >= user.collectedKissers.length) {
      return await interaction.reply({
        content: `Invalid index! Choose a number between 1 and ${user.collectedKissers.length}.`,
        ephemeral: true,
      });
    }

    const kisser = user.collectedKissers[index];
    const currentAccessory1 = user.currentAccessory1 || {}; 
    const currentAccessory2 = user.currentAccessory2 || {}; 

    // Get XP for this kisser
    const kisserXP = user.kisserXP && user.kisserXP[kisser] ? user.kisserXP[kisser] : 0;

    // Find the wedding event from dateLocations
    const weddingEvent = dateLocations.find(event => event.name === 'Wedding');

    // Check if kisser can attend the wedding
    const canAttendWedding = weddingEvent ? kisserXP >= weddingEvent.minExp : false;

    // Search for soulmate in the database
    let soulmateInfo = 'No soulmate found.';
    const soulmateEntry = await Soulmates.findOne({
      where: {
        [Op.or]: [
          { 'soulmate1.userId': userId, 'soulmate1.kisserName': kisser },
          { 'soulmate2.userId': userId, 'soulmate2.kisserName': kisser }
        ],
      },
    });

    if (soulmateEntry) {
      let soulmate;
      if (soulmateEntry.soulmate1.userId === userId && soulmateEntry.soulmate1.kisserName === kisser) {
        soulmate = soulmateEntry.soulmate2;
      } else {
        soulmate = soulmateEntry.soulmate1;
      }

      soulmateInfo = `Soulmate: **${soulmate.kisserName}**, belonging to **${soulmate.userId}**`;
    }

    // Create the canvas
    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext('2d');

    // Load and draw the kisser image
    const kisserImagePath = path.join(__dirname, `../images/boykissers/${kisser}Base.png`);
    const kisserImage = await loadImage(kisserImagePath);
    ctx.drawImage(kisserImage, 0, 0, canvas.width, canvas.height);

    // Draw accessories if available
    const addAccessory = async (accessoryName) => {
      if (!accessoryName) return;
      const accessoryData = accessoriesData.find(a => a.name === accessoryName);
      if (!accessoryData) return;
      const accessoryImagePath = path.join(__dirname, accessoryData.filepath);
      const accessoryImage = await loadImage(accessoryImagePath);
      ctx.drawImage(accessoryImage, 0, 0, canvas.width, canvas.height);
    };

    await addAccessory(currentAccessory1[kisser]);
    await addAccessory(currentAccessory2[kisser]);

    // Convert canvas to buffer
    const buffer = canvas.toBuffer('image/png');

    // Check if this kisser is the favorite
    const isFavorite = kisser === user.favouriteKisser;
    const embedTitle = isFavorite ? `✨ **${kisser}** ✨` : `**${kisser}**`;

    // Create the embed
    const embed = new EmbedBuilder()
      .setTitle(embedTitle)
      .setDescription(
        `XP: **${kisserXP}**\n\n` +
        `Accessory 1: **${currentAccessory1[kisser] || 'None'}**\n` +
        `Accessory 2: **${currentAccessory2[kisser] || 'None'}**\n\n` +
        `${soulmateInfo}\n\n` 
      )
      .setColor('Random');

    // Send the response
    await interaction.reply({
      embeds: [embed],
      files: [{ attachment: buffer, name: `${kisser}.png` }],
    });
  },
};
