const { SlashCommandBuilder, EmbedBuilder, codeBlock, bold } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Introduction to the bot'),

  run: async ({ interaction }) => {
    const embed = new EmbedBuilder()
      .setTitle(bold('Welcome to the Boykisser bot help page!'))
      .setDescription(
        `Here, you'll find a short overview of the bot functionality. First, remember to collect your treats with the 🍬${bold('/treats')}🍬 command, nya!\n\n` +
        `To play, react to the emoji under the spawned Boykisser. That way, you give them a treat! \n` +
        `Treats help you gain a kisser's trust. Some kissers are a bit more shy, so be patient with them! qwq\n\n` +
        `If you gain a kisser's trust, they'll join your CollectedKissers, which you can view with the 🐾${bold('/listKissers')}🐾 command.\n` +
        `If you'd also like to view the images of them, use the 🐈${bold('/showkisser')}🐈 command paired with their index number in your collection.\n\n` +
        `Once they're part of your collection, you can still keep giving them treats! ^owo^ \n` +
        `Your kissers can earn XP for every treat. More XP means that you'll have more different date opportunities, and your kissers might start bringing you coins as a way to say thank you!\n\n` +
        `With coins, you can send your kissers on dates with other kissers you've collected or other users' starkissers. \n` +
        `Make sure to set your starkisser with the ⭐${bold('/setstarkisser')}⭐ command!\n\n` +
        `Kissers are very stylish kitties and love to accessorize, so make sure to check out the 🛍️${bold('/shop')}🛍️ to shop the coolest new accessories! >w<\n` +
        `You can toggle the accessories with ${bold('/setaccessory_')} and ${bold('/removeaccessory_')} in the respective slots.\n\n` +
        `There is more to each kisser than meets the eye, so remember to check ${bold('/quest')} to play through their story! Nya!\n\n` +
        `For more info on specific commands/functionalities please check out:\n` +
        `${codeBlock(`/commandslist`)}\n` +
        `${codeBlock(`/datehelp`)}\n\n` +
        `Thank you for playing the Boykisser bot!`
      )
      .setColor('Random');

    await interaction.reply({ embeds: [embed] });
  }
};
