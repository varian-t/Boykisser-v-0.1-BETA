const { Op } = require('sequelize');
const Soulmates = require('../models/Soulmates'); // Path to your Soulmates model


module.exports = async (interaction, user, target) => {

  // Fetch the favorite kissers for both users
  const userKisser = user.favouriteKisser;
  const targetKisser = target?.favouriteKisser;

  // Debugging: Log favorite kisser details
  console.log("User Kisser Info:", userKisser, "User ID:", user.userId);
  console.log("Target Kisser Info:", targetKisser, "Target ID:", target?.userId);


  // Check if `favouriteKisser` exists for both users
  if (!userKisser) {
    return interaction.reply(`${interaction.user.username}, you need to set a favorite kisser before you can get married! 💔`);
  }
  if (!targetKisser) {
    return interaction.reply(`${target?.username || "The target user"} does not have a favorite kisser set! 💔`);
  }
  // Validate if either kisser is already in a relationship
const existingSoulmate = await Soulmates.findOne({
  where: {
    [Op.or]: [
      { 'soulmate1.userId': user.userId, 'soulmate1.kisserName': user.favouriteKisser },
      { 'soulmate2.userId': user.userId, 'soulmate2.kisserName': user.favouriteKisser },
      { 'soulmate1.userId': target.userId, 'soulmate1.kisserName': target.favouriteKisser },
      { 'soulmate2.userId': target.userId, 'soulmate2.kisserName': target.favouriteKisser },
    ],
  },
});



  if (existingSoulmate) {
    return interaction.channel.send("One of the kissers is already married! 💔");
  }
  // Prompt both users for confirmation
  await interaction.channel.send(
    `💍 ${interaction.user.username}, do you want to marry your **${userKisser}** to the other user's **${targetKisser}**? Both must type 'yes' to confirm!`
  );

  const filter = (response) =>
    [user.userId, target.userId].includes(response.author.id) &&
    response.content.toLowerCase() === 'yes';
  const collector = interaction.channel.createMessageCollector({ filter, max: 2, time: 60000 });
  let confirmations = 0;
  collector.on('collect', async (response) => {
    confirmations += 1;

    await interaction.channel.send(`${response.author.username} has confirmed!`);
    if (confirmations === 2) {
      // Store the new soulmate pair in the database
      await Soulmates.create({
        soulmate1: {
          userId: user.userId,
          kisserName: userKisser,
        },
        soulmate2: {
          userId: target.userId,
          kisserName: targetKisser,
        },
      });

      await interaction.channel.send(
        `🎉 Congratulations! **${userKisser}** and **${targetKisser}** are now soulmates! ❤️`
      );
    }
  });

  collector.on('end', (collected) => {
    if (confirmations < 2) {
      interaction.channel.send("The wedding didn't go through. Both parties must agree!");
    }
  });
};