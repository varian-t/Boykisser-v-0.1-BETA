const { SlashCommandBuilder, EmbedBuilder, codeBlock, bold } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('datehelp')
    .setDescription('learn more about the dating system here!'),

  run: async ({ interaction }) => {
    const embed = new EmbedBuilder()
      .setTitle(bold('Dating!'))
      .setDescription(
        `So, you found a special purrson and wish to treat them to something special? - Invite them to a date!\n\n` +
        `${bold(`/stardate`)} allows you to invite another user's starkisser for a lovely date\n` +
        `${bold(`/kisserdate`)} allows you to prepare a date for two kissers that are in your collection.\n\n` +
        `Some date areas have special scenarios that can grant you special bonuses! So stay alert and respond to situations on time!\n` +
        `If both kissers have a lot of XP, you may trigger a very special ${bold(`wedding`)} event, allowing the two kissers to become soulmates!\n` +
        `Stardates give each kisser more XP than kisserdates! So go into channels, and chat with people to meet the purrfect soulamte :3\n\n` +
        `Hope you have fun going on dates and meeting other kissers~! uwu`
      )
      .setColor('Random');

    await interaction.reply({ embeds: [embed] });
  }
};
