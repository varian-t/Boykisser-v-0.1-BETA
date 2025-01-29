const { DataTypes } = require('sequelize');
const sequelize = require('../database.js');

const Soulmates = sequelize.define('Soulmates', {
  soulmate1: {
    type: DataTypes.JSON,  // Store the first soulmate as a JSON object
    allowNull: false,  // Ensuring soulmate1 data is provided
    
  },
  soulmate2: {
    type: DataTypes.JSON,  // Store the second soulmate as a JSON object
    allowNull: false,  // Ensuring soulmate2 data is provided
  },
});

module.exports = Soulmates;