const { getSpawnDetails } = require('./spawnManager'); // Adjust the path if needed
const User = require('../models/User.js');
const { checkIfLevelUp }  = require('../utils/levelUp.js');

async function reactionHandler(userId, spawnType, message, channel) {
  try {
    let user = await User.findOne({ where: { userId: userId } });

    if (!user) {
      console.log(`User with ID ${userId} not found. Creating a new user.`);
      user = await User.create({
        userId: userId,
        collectedKissers: [],
        collectedAccessories: [],
        favouriteKisser: null,
        currentAccessory1: null,
        currentAccessory2: null,
        treatsInventory: 0,
        kisserXP: {},
        treatsGiven: {},
        coinsInventory: 0,
        tempKissers: {},
      });
    }

    if (user.treatsInventory <= 0) {
      await message.reply(`You do not have enough treats! Use /treats to claim treats.`);
      return;
    }

    else {
      user.treatsInventory = user.treatsInventory-1;
      await user.save();
      message.channel.send(`<@${userId}>, you have given ${spawnType} a treat!`);
      
    

    const spawnDetails = getSpawnDetails(spawnType);

    user.tempKissers = user.tempKissers || {};
    user.treatsGiven = user.treatsGiven || {};
    user.kisserXP = user.kisserXP || {};
    user.collectedKissers = user.collectedKissers || [];

    if (user.collectedKissers.includes(spawnType)) {
      console.log(`if here`);
      console.log(`User ${userId} already collected ${spawnType}, adding 10 XP.`);
    
      // Direct update for kisserXP in the database
      await User.update(
        { kisserXP: { ...user.kisserXP, [spawnType]: (user.kisserXP[spawnType] || 0) + 10 } },
        { where: { userId: userId } }
      );

      checkIfLevelUp(userId, spawnType, message);
    
      // Optional: Refresh the user object if needed
      user = await User.findOne({ where: { userId: userId } });
      console.log(`Updated kisserXP for ${spawnType}:`, user.kisserXP);
    }
     else {

     // console.log(`else here`);

    await User.update(
      { tempKissers: { ...user.tempKissers, [spawnType]: (user.tempKissers[spawnType] || 0) + 1 } },
      { where: { userId: userId } }
    );
    await User.update(
      { treatsGiven: { ...user.treatsGiven, [spawnType]: (user.treatsGiven[spawnType] || 0) + 1 } },
      { where: { userId: userId } }
    );


      console.log(`User has given ${user.treatsGiven[spawnType]} treats to ${spawnType}.`);
      console.log(`treats given: ${user.treatsGiven[spawnType]} treats needed: ${spawnDetails.treatsNeeded}.`);

      

      if ((user.treatsGiven[spawnType]) >= (spawnDetails.treatsNeeded)) {
        await message.channel.send(`You have now collected this kisser!`);
       /* if (!user.collectedKissers.includes(spawnType)) {
          user.collectedKissers.push(spawnType);
        }*/
          user.collectedKissers = [...user.collectedKissers, spawnType];
          const updatedTempKissers = { ...user.tempKissers };
          delete updatedTempKissers[spawnType];
          user.tempKissers = updatedTempKissers;

       // delete user.tempKissers[spawnType];
      }
    }

    console.log(`Saving user data for ${userId}...`);
    await user.save();
    checkIfLevelUp(userId, spawnType);
    await user.save();

    const refreshedUser = await User.findOne({ where: { userId: user.userId } });
    console.log(`User data after save:`, refreshedUser.toJSON());
  } 
  }
  catch (error) {
    console.error(`Error in reactionHandler for user ${userId}:`, error.message);
}
}

module.exports = { reactionHandler };
