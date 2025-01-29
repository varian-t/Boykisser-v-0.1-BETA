const User = require('../models/User.js');

/**
 * Checks if a user levels up based on their XP and provides appropriate rewards.
 * @param {string} userId The user's ID.
 * @param {string} spawnType The type of kisser (or XP source).
 * @param {object} message The message object for sending responses.
 */
async function checkIfLevelUp(userId, spawnType, message) {
  try {
    // Validate the message object
    if (!message || typeof message.reply !== 'function') {
      console.error('Invalid message object passed to checkIfLevelUp');
      return;
    }

    const user = await User.findOne({ where: { userId: userId } });
    if (!user) {
      console.error(`User with ID ${userId} not found.`);
      return;
    }

    // Ensure default values for user's inventory
    user.coinsInventory = user.coinsInventory || 0;

    const xp = user.kisserXP[spawnType];

    if (!xp) {
      // No XP for the given spawnType
      if (user.collectedKissers.includes(spawnType)) {
        await message.reply(`<@${user.userId}>, give more treats to earn more XP!`);
      }
      return;
    }

    // Reward logic based on XP thresholds
    if (xp >= 200) {
      await message.channel.send(`<@${user.userId}>, you have earned 20 coins!`);
      user.coinsInventory += 20;

    } else if (xp >= 100) {
      await message.channel.send(`<@${user.userId}>, you have earned 10 coins!`);
      user.coinsInventory += 10;

    } else if (xp >= 50) {
      await message.channel.send(`<@${user.userId}>, you have earned 5 coins!`);
      user.coinsInventory += 5;

    } else {
      await message.channel.send(`<@${user.userId}>, go on dates and give kissers treats to level up!`);
    }

    // Save updated user data
    await user.save();
  } catch (error) {
    console.error(`Error in checkIfLevelUp for user ${userId}:`, error.message);
  }
}

module.exports = {
  checkIfLevelUp,
};
