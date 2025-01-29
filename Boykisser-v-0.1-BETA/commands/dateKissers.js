const { SlashCommandBuilder, EmbedBuilder, Message } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');
const User = require('../models/User.js');
const dateLocations = require('../objects/dateLocations.js');
const accessoriesData = require('../objects/accessories.js');
const dateScenarios = require('../objects/dateScenarios.js'); // Import scenarios
const wedding = require('../scenarios/wedding.js');
const { checkIfLevelUp }  = require('../utils/levelUp.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('datekisser')
    .setDescription('Send two of your kissers on a date.')
    .addStringOption((option) =>
      option
        .setName('kisser1')
        .setDescription('Select your first kisser.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('kisser2')
        .setDescription('Select your second kisser.')
        .setRequired(true)
    ),

  run: async ({ interaction }) => {

    const isDateKisser = true;
    console.log("isDateKisser:", isDateKisser);

    const userId = interaction.user.id; // The initiating user
    const kisser1 = interaction.options.getString('kisser1');
    const kisser2 = interaction.options.getString('kisser2');

    // Ensure the user doesn't select the same kisser twice
    if (kisser1 === kisser2) {
      return await interaction.reply({
        content: 'You cannot send the same kisser on a date with themselves!',
        ephemeral: true,
      });
    }

    // Fetch user data from the database
    const user = await User.findOne({ where: { userId } });
    if (!user) {
      return await interaction.reply({
        content: "You haven't set up your kissers yet! Use the appropriate command to get started.",
        ephemeral: true,
      });
    }

    // Check if the user owns both kissers
    const collectedKissers = user.collectedKissers || [];
    if (!collectedKissers.includes(kisser1) || !collectedKissers.includes(kisser2)) {
      return await interaction.reply({
        content: `One or both of the selected kissers are not in your collection!`,
        ephemeral: true,
      });
    }

    // Check if the user has enough coins
    if (user.coinsInventory < 50) {
      return await interaction.reply({
        content: "You don't have enough coins to send your kissers on a date! (50 coins required)",
        ephemeral: true,
      });
    }

    // Deduct 50 coins from the user
    user.coinsInventory -= 50;
    await user.save();

    // Calculate the lower XP between the two kissers
    const kisser1XP = user.kisserXP[kisser1] || 0;
    const kisser2XP = user.kisserXP[kisser2] || 0;
    const lowerXP = Math.min(kisser1XP, kisser2XP);

    // Find valid date locations based on XP
    const locationToRemove = 'Wedding'; // Replace with the value to remove

    const validLocations = dateLocations.filter((location) => {
      const minExp = location.minExp || 0; // Default to 0 if no minExp is specified
      return lowerXP >= minExp;
    });

    // Find the index of the location to remove
    const indexToRemove = validLocations.findIndex(location => location.name === locationToRemove);

    // If the location exists, remove it from the array
    if (indexToRemove !== -1) {
     validLocations.splice(indexToRemove, 1); // Remove 1 item at the found index
    }

    if (validLocations.length === 0) {
      return await interaction.reply({
        content: "No suitable date locations found for the XP level of your kissers.",
        ephemeral: true,
      });
    }

    // Select a random location
    const selectedLocation = validLocations[Math.floor(Math.random() * validLocations.length)];
    const backgroundPath = path.join(__dirname, selectedLocation.filepath);

    // Generate the date canvas
    const canvas = createCanvas(1000, 500);
    const ctx = canvas.getContext('2d');

    // Load and draw the background
    const backgroundImage = await loadImage(backgroundPath);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Draw kisser1 and accessories
    const kisser1Path = path.join(__dirname, `../images/boykissers/${kisser1}Base.png`);
    const kisser1Image = await loadImage(kisser1Path);
    ctx.save();
ctx.translate(250, 250); // Move to the center of the left side
ctx.scale(-1, 1); // Flip horizontally
ctx.drawImage(kisser1Image, -250, -250, 500, 500); // Draw flipped

    const kisser1Accessory1 = user.currentAccessory1?.[kisser1];
    if (kisser1Accessory1) {
      const accessoryData1 = accessoriesData.find((a) => a.name === kisser1Accessory1);
      if (accessoryData1) {
        const accessoryPath1 = path.join(__dirname, accessoryData1.filepath);
        const accessoryImage1 = await loadImage(accessoryPath1);
        ctx.drawImage(accessoryImage1, -250, -250, 500, 500);
      }
    }

    const kisser1Accessory2 = user.currentAccessory2?.[kisser1];
    if (kisser1Accessory2) {
      const accessoryData2 = accessoriesData.find((a) => a.name === kisser1Accessory2);
      if (accessoryData2) {
        const accessoryPath2 = path.join(__dirname, accessoryData2.filepath);
        const accessoryImage2 = await loadImage(accessoryPath2);
        ctx.drawImage(accessoryImage2, -250, -250, 500, 500);
      }
    }
    ctx.restore();
    // Draw kisser2 and accessories
    const kisser2Path = path.join(__dirname, `../images/boykissers/${kisser2}Base.png`);
    const kisser2Image = await loadImage(kisser2Path);
    ctx.save();
ctx.translate(750, 250); // Move to the center of the right side
ctx.drawImage(kisser2Image, -250, -250, 500, 500); // Draw flipped

    const kisser2Accessory1 = user.currentAccessory1?.[kisser2];
    if (kisser2Accessory1) {
      const accessoryData1 = accessoriesData.find((a) => a.name === kisser2Accessory1);
      if (accessoryData1) {
        const accessoryPath1 = path.join(__dirname, accessoryData1.filepath);
        const accessoryImage1 = await loadImage(accessoryPath1);
        ctx.drawImage(accessoryImage1,  -250, -250, 500, 500);
      }
    }

    const kisser2Accessory2 = user.currentAccessory2?.[kisser2];
    if (kisser2Accessory2) {
      const accessoryData2 = accessoriesData.find((a) => a.name === kisser2Accessory2);
      if (accessoryData2) {
        const accessoryPath2 = path.join(__dirname, accessoryData2.filepath);
        const accessoryImage2 = await loadImage(accessoryPath2);
        ctx.drawImage(accessoryImage2, -250, -250, 500, 500);
      }
    }
    ctx.restore();


    // Save the canvas as a buffer
    const buffer = canvas.toBuffer('image/png');

    // Send the date image
    await interaction.reply({
      content: `Your kissers visited **${selectedLocation.name}** and had an amazing time!`,
      files: [{ attachment: buffer, name: 'date.png' }],
    });


    // Add 20 XP to both kissers
    // Add XP to both kissers
const updatedXP = {
  ...user.kisserXP,
  [kisser1]: (user.kisserXP[kisser1] || 0) + 20,
  [kisser2]: (user.kisserXP[kisser2] || 0) + 20,
};

// Update the database with the new XP
await User.update({ kisserXP: updatedXP }, { where: { userId: user.userId } });

// Check for level up for both kissers
await checkIfLevelUp(userId, kisser1, interaction);
await checkIfLevelUp(userId, kisser2, interaction);


    // Trigger the scenario logic
    const selectedScenarioLogic = dateScenarios[selectedLocation.name];
    if (selectedScenarioLogic) {
      await selectedScenarioLogic(interaction, user, user, User, kisser1, kisser2, isDateKisser);
    } else {
      interaction.followUp("No additional scenarios are available for this location!");
    }
  },
};
