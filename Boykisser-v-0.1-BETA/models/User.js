const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database.js');

const User = sequelize.define('User', {
  userId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  collectedKissers: {
    type: DataTypes.JSON,
    defaultValue: [], // Array of objects (kissers)
  },
  
  // Use JSON type for collectedAccessories instead of an array
  collectedAccessories: {
    type: DataTypes.JSON, // Store it as a JSON array
    defaultValue: [], // Default to an empty array
  },

  favouriteKisser: DataTypes.STRING,

  currentAccessory1: {
    type: DataTypes.JSON,
    defaultValue: {}, // Make sure it's an empty object by default
  },

  currentAccessory2: {
    type: DataTypes.JSON,
    defaultValue: {},
  },

  treatsInventory: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lastTreatReset: {
    type: Sequelize.DATE,
    allowNull: true, // Default to null for users who haven't used it yet
  },
  
  kisserXP: {          //// represents XP
    type: DataTypes.JSON,
    defaultValue: {},
    allowNull: false,
  },
  treatsGiven: {          //// treats counter for each kisser
    type: DataTypes.JSON,
    defaultValue: {},
  },
  coinsInventory: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  tempKissers: {
    type: DataTypes.JSON,
    defaultValue: {}, // Object to track treats given to each cat
  },
  soulmates: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  
});

module.exports = User;
