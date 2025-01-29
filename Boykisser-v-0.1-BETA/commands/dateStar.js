const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');
const User = require('../models/User.js');
const dateLocations = require('../objects/dateLocations.js'); // Import your date locations
const accessoriesData = require('../objects/accessories.js'); // Import accessories data
const dateScenarios = require('../objects/dateScenarios.js'); // Import scenarios data
const wedding = require('../scenarios/wedding.js');
const { checkIfLevelUp }  = require('../utils/levelUp.js');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('datestar')
    .setDescription(`Send your kisser on a date with another user's kisser.`)
    .addUserOption((option) =>
      option
        .setName('target')
        .setDescription('Tag the user to send a date request.')
        .setRequired(true)
    ),

  run: async ({ interaction }) => {
      // Set isDateKisser flag to false
      const isDateKisser = false;
      console.log("isDateKisser:", isDateKisser);

    const userId = interaction.user.id; // Initiating user's ID
    const targetUser = interaction.options.getUser('target'); // Tagged user
    const targetUserId = targetUser.id;

    // Check if the user selected themselves
    if (userId === targetUserId) {
      return await interaction.reply({
        content: "You can't send your starkisser on a date with yourself!",
        ephemeral: true, // Makes the reply private
      });
    }

    // Fetch users from the database
    const user = await User.findOne({ where: { userId } });
    const target = await User.findOne({ where: { userId: targetUserId } });

    // Check if both users exist and have a starkisser
    if (!user || !user.favouriteKisser) {
      return await interaction.reply({
        content: 'You have not set a starkisser yet!',
      });
    }
    if (!target || !target.favouriteKisser) {
      return await interaction.reply({
        content: `${targetUser.username} has not set a starkisser yet!`,
      });
    }

    const userKisser = user.favouriteKisser;
    const targetKisser = target.favouriteKisser;

    // Ask the target user for confirmation
    const message = await interaction.reply({
      content: `<@${targetUserId}>, <@${userId}> wants to send their starkisser (${userKisser}) on a date with your starkisser (${targetKisser}). Do you accept? Reply "yes" to confirm.`,
      fetchReply: true,
    });

    const filter = (response) =>
      response.author.id === targetUserId && response.content.toLowerCase() === 'yes';
    const collector = message.channel.createMessageCollector({ filter, time: 60000 });

    collector.on('collect', async () => {
      collector.stop(); // Stop the collector after the reply

      // Check if the initiating user has enough coins
      if (user.coinsInventory < 50) {
        return await interaction.followUp({
          content: "You don't have enough coins to send your starkisser on a date! (50 coins required)",
        });
      }

    

      // Get XP for both starkissers
      const userKisserXP = user.kisserXP[userKisser] || 0;
      const targetKisserXP = target.kisserXP[targetKisser] || 0;

      // Use the lower XP value
      const lowerXP = Math.min(userKisserXP, targetKisserXP);

      const locationToRemove = 'KisserWedding'; // Replace with the value to remove

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
        return await interaction.followUp({
          content: 'No suitable date locations found for the XP level of your starkissers.',
        });
      }

        // Deduct 50 coins from the initiating user
        user.coinsInventory -= 50;
        await user.save();

      // Choose a random valid location
      const selectedLocation = validLocations[Math.floor(Math.random() * validLocations.length)];
      const backgroundPath = path.join(__dirname, selectedLocation.filepath);

      // Create the date canvas
      const canvas = createCanvas(1000, 500);
      const ctx = canvas.getContext('2d');

      // Load the background image
      const backgroundImage = await loadImage(backgroundPath);
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

      // Draw the initiating user's starkisser and accessories
const userKisserPath = path.join(__dirname, `../images/boykissers/${userKisser}Base.png`);
const userKisserImage = await loadImage(userKisserPath);

ctx.save();
ctx.translate(250, 250); // Move to the center of the left side
ctx.scale(-1, 1); // Flip horizontally
ctx.drawImage(userKisserImage, -250, -250, 500, 500); // Draw flipped

// Draw accessories for the initiating user's starkisser
const userAccessory1 = user.currentAccessory1?.[userKisser];
if (userAccessory1) {
  const accessoryData1 = accessoriesData.find((a) => a.name === userAccessory1);
  if (accessoryData1) {
    const accessoryPath1 = path.join(__dirname, accessoryData1.filepath);
    const accessoryImage1 = await loadImage(accessoryPath1);
    ctx.drawImage(accessoryImage1, -250, -250, 500, 500); // Draw accessory aligned with kisser
  }
}

const userAccessory2 = user.currentAccessory2?.[userKisser];
if (userAccessory2) {
  const accessoryData2 = accessoriesData.find((a) => a.name === userAccessory2);
  if (accessoryData2) {
    const accessoryPath2 = path.join(__dirname, accessoryData2.filepath);
    const accessoryImage2 = await loadImage(accessoryPath2);
    ctx.drawImage(accessoryImage2, -250, -250, 500, 500); // Draw accessory aligned with kisser
  }
}
ctx.restore();

// Draw the target user's starkisser and accessories
const targetKisserPath = path.join(__dirname, `../images/boykissers/${targetKisser}Base.png`);
const targetKisserImage = await loadImage(targetKisserPath);

ctx.save();
ctx.translate(750, 250); // Move to the center of the right side
ctx.drawImage(targetKisserImage, -250, -250, 500, 500); // Draw flipped

// Draw accessories for the target user's starkisser
const targetAccessory1 = target.currentAccessory1?.[targetKisser];
if (targetAccessory1) {
  const accessoryData1 = accessoriesData.find((a) => a.name === targetAccessory1);
  if (accessoryData1) {
    const accessoryPath1 = path.join(__dirname, accessoryData1.filepath);
    const accessoryImage1 = await loadImage(accessoryPath1);
    ctx.drawImage(accessoryImage1, -250, -250, 500, 500); // Draw accessory aligned with kisser
  }
}

const targetAccessory2 = target.currentAccessory2?.[targetKisser];
if (targetAccessory2) {
  const accessoryData2 = accessoriesData.find((a) => a.name === targetAccessory2);
  if (accessoryData2) {
    const accessoryPath2 = path.join(__dirname, accessoryData2.filepath);
    const accessoryImage2 = await loadImage(accessoryPath2);
    ctx.drawImage(accessoryImage2, -250, -250, 500, 500); // Draw accessory aligned with kisser
  }
}
ctx.restore();

      // Save the canvas as a buffer
      const buffer = canvas.toBuffer('image/png');

      // Send the final result
      await interaction.followUp({
        content: `The date was a success! Your starkissers visited **${selectedLocation.name}** and had a great time!`,
        files: [{ attachment: buffer, name: 'date.png' }],
      });

      // Add 30 XP to both starkissers
      await User.update(
        { kisserXP: { ...user.kisserXP, [userKisser]: (user.kisserXP[userKisser] || 0) + 30 } },
        { where: { userId: user.userId } }
      );
    
      await User.update(
        { kisserXP: { ...target.kisserXP, [targetKisser]: (target.kisserXP[targetKisser] || 0) + 30 } },
        { where: { userId: target.userId } }
      );

      // Save both users
      await user.save();
      await target.save();

      checkIfLevelUp(userId, userKisser, message);
      checkIfLevelUp(targetUserId, targetKisser, message);

      
 // Trigger scenario logic if it exists
 const selectedScenarioLogic = dateScenarios[selectedLocation.name]; 
 if (selectedScenarioLogic) {
   await selectedScenarioLogic(interaction, user, target, User, isDateKisser);
 } else {
   interaction.followUp("No additional scenarios are available for this location!");
 }


    });

    collector.on('end', (collected) => {
      if (collected.size === 0) {
        interaction.followUp({
          content: `${targetUser.username} did not respond in time. The date request has been canceled.`,
        });
      }
    });
  },
};
