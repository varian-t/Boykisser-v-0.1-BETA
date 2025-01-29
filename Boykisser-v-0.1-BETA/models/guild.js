const { Sequelize } = require('sequelize');
const sequelize = require('../database.js'); 

const Guild = sequelize.define('Guild', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    spawnChannelId: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    welcomeRoleId: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    minInterval: {
      type: Sequelize.INTEGER,
      allowNull: false, // Ensure a value is always present
        defaultValue: 30000, // 1 minute
    },
    maxInterval: {
      type: Sequelize.INTEGER,
      allowNull: false, 
        defaultValue: 60000, 
    },    
});

module.exports = Guild;