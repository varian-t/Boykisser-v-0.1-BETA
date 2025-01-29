// updateCoins.js
const sequelize = require('../database.js');
const User = require('../models/User.js'); // Adjust the path to your User model

(async () => {
  try {
    // User input for the update
    const userId = '1332490899489296469'; // Replace with the user's ID
    const newCoins = 1000; // Replace with the new coin value

    // Find the user
    const user = await User.findOne({ where: { userId } });
    if (!user) {
      console.log(`User with ID ${userId} not found.`);
      process.exit(1);
    }

    // Update the coins and save
    //user.coinsInventory = newCoins;
    user.treatsGiven = {};
    await user.save();

    console.log(`Successfully updated coins for user ${userId} to ${newCoins}.`);
    process.exit(0); // Exit the script successfully
  } catch (error) {
    console.error('Error updating coins:', error.message);
    process.exit(1); // Exit with error
  }
})();
