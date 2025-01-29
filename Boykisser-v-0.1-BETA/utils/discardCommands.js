const { REST, Routes } = require('discord.js');
require('dotenv').config();
const path = require('path');

const rest = new REST().setToken(process.env.TOKEN);

// ...

// for guild-based commands
rest.delete(Routes.applicationGuildCommand(process.env.CLIENT_ID, process.env.GUILD_ID, '1333365476503457813'))
	.then(() => console.log('Successfully deleted guild command'))
	.catch(console.error);

// for global commands
rest.delete(Routes.applicationCommand(process.env.CLIENT_ID, '1333365476503457813'))
	.then(() => console.log('Successfully deleted application command'))
	.catch(console.error);