require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
const { CommandHandler } = require('djs-commander');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const path = require('path');
const mongoose = require('mongoose');
const Guild = require('./models/guild');
const buyAccessoryCommand = require('../Boykisser-v-0.1-BETA/commands/buyAccessory'); // Adjust the path if needed

//const { clientId, guildId, token } = require('./config.json');

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent, IntentsBitField.Flags.GuildMessageReactions]
});

new CommandHandler({
  client, // Discord.js client object
  commandsPath: path.join(__dirname, 'commands'), // Path to your commands directory
  eventsPath: path.join(__dirname, 'events'), // Path to your events directory
  validationsPath: path.join(__dirname, 'validations'), // Path to your validations directory (optional)
  modelsPath: path.join(__dirname, 'models'),
  utilsPath: path.join(__dirname, 'utils')
  //testServer: '1326634766354747393' // ID of your test server (optional)
});

client.login(process.env.TOKEN);

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

/*(async () => {
  try {
    console.log('Refreshing /buyaccessory command...');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID), // Updates ONLY global commands
      { body: [buyAccessoryCommand.data.toJSON()] } // Replace existing commands with just /buyaccessory
    );

    console.log('Successfully updated /buyaccessory!');
  } catch (error) {
    console.error('Error updating /buyaccessory:', error);
  }
})();*/

const { exec } = require('child_process');


//deleting duplicate slash commands
/*exec('node utils/deleteCommands.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Output: ${stdout}`);
});*/