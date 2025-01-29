const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Started deleting application (/) commands.');

    const commands = await rest.get(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
    );

    for (const command of commands) {
      await rest.delete(
        Routes.applicationGuildCommand(process.env.CLIENT_ID, process.env.GUILD_ID, command.id)
      );
      console.log(`Deleted command ${command.name}`);
    }

    console.log('Successfully deleted all application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();