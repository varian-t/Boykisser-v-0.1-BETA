const { SlashCommandBuilder, EmbedBuilder, codeBlock, bold } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('commandslist')
    .setDescription('Command list and basic info'),

  run: async ({ interaction }) => {
    const embed = new EmbedBuilder()
      .setTitle(bold('Commands list!'))
      .setDescription(
        `${bold('/buyaccessory')} - purchase one of the currently available accessories\n` +
        `${bold('/commandslist')} - view all commands - you're here, nya! :3\n` +
        `${bold('/datehelp')} - info on the dating system\n` +
        `${bold('/datekisser')} - send two of your kissers on a date\n` +
        `${bold('/datestar')} - send your starkisser and another user's starkisser on a date\n` +
        `${bold('/divorce')} - divorce one of your married kissers\n` +
        `${bold('/givecoins')} - give coins to another user\n` +
        `${bold('/help')} - an informative overview of the bot's functionality\n` +
        `${bold('/listaccessories')} - list accessories currently in your inventory\n` +
        `${bold('/listkisserimg')} - EXPERIMENTAL list your kisser alongside an image of them\n` +
        `${bold('/listkissers')} - list all of your kissers and their currently set accessories\n` +
        `${bold('/ping')} - pong!\n` +
        `${bold('/profile')} - display your current coins and treat inventory and chosen starkisser\n` +
        `${bold('/removeaccessory_')} - remove an accessory for a kisser from slot 1 or 2\n` +
        `${bold('/setaccessory_')} - set an accessory for a kisser from slot 1 or 2\n` +
        `${bold('/setstarkisser')} - set a starkisser to display on your profile and send on dates with other users\n` +
        `${bold('/shop')} - view the accessories currently available at the shop\n` +
        `${bold('/showkisser')} - show the profile of a specific kisser in your collection\n` +
        `${bold('/trade')} - trade an accessory with another kisser\n` +
        `${bold('/treats')} - claim your treats, reset every 10 hours\n` 
      )
      .setColor('Random');

    await interaction.reply({ embeds: [embed] });
  }
};
