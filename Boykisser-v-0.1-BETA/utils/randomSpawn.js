const Guild = require('../models/guild.js'); // Adjust the path if needed
const { Op } = require('sequelize');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { getRandomSpawn, getSpawnDetails } = require('./spawnManager');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');
const { reactionHandler } = require('./reactionHandler');

const guildIntervals = {}; // Store intervals for each guild

function getRandomInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Waits for users to react and immediately provides feedback in the same channel.
 * @param {Message} message The bot's sent message.
 * @param {string[]} validReactions Array of valid reaction emojis.
 * @param {number} timeLimit Time limit in milliseconds.
 */
async function waitForReactionsWithImmediateFeedback(message, validReactions, spawnType, timeLimit = 120000) {
  const reactedUsers = new Set(); // Track users who already reacted

  const collector = message.createReactionCollector({
    filter: (reaction, user) => validReactions.includes(reaction.emoji.name) && !user.bot,
    time: timeLimit,
  });

  collector.on('collect', async (reaction, user) => {
    if (reactedUsers.has(user.id)) return; // Ignore if the user already reacted
    reactedUsers.add(user.id); // Track this user as reacted

    try {
     
      // Call the reactionHandler to handle the user and spawnType updates
      await reactionHandler(user.id, spawnType, message);

      // Provide immediate feedback in the channel
      
    } catch (error) {
      console.error(`Failed to handle reaction for user ${user.tag}:`, error.message);
    }
  });

  collector.on('end', () => {
    console.log('Reaction collection ended.');
  });
}


async function setupGuildSpawn(client, guildConfig) {
  const { id, spawnChannelId } = guildConfig;

  // Clear existing interval if it exists
  if (guildIntervals[id]) {
    clearInterval(guildIntervals[id]);
  }

  // Assign a new randomized interval for the guild
  guildIntervals[id] = setInterval(async () => {
    const guild = client.guilds.cache.get(id);
    if (!guild) return;

    const channel = guild.channels.cache.get(spawnChannelId);
    if (!channel) return;

    const spawnType = getRandomSpawn();
    const spawnDetails = getSpawnDetails(spawnType);
    const fileLocation = path.resolve(__dirname, spawnDetails.filepath);

    // Create the base canvas
    const baseCanvas = createCanvas(400, 400); // Adjust size as needed
    const baseCtx = baseCanvas.getContext('2d');
    const image = await loadImage(fileLocation); // Load image from resolved path
    baseCtx.drawImage(image, 0, 0, 400, 400); // Draw image on canvas

    const buffer = baseCanvas.toBuffer('image/png');
    const attachment = new AttachmentBuilder(buffer, { name: 'local-image-canvas.png' });

    const embed = new EmbedBuilder()
      .setTitle(`A wild ${spawnType} appeared!`)
      .setDescription(spawnDetails.description)
      .setColor('Random')
      .setImage('attachment://local-image-canvas.png');

    const sentMessage = await channel.send({
      embeds: [embed],
      files: [attachment],
    });

    // Add reaction for users to interact with
    const emoji = '✨'; // Replace with any emoji you prefer
    await sentMessage.react(emoji);

    // Wait for reactions and provide immediate feedback
    await waitForReactionsWithImmediateFeedback(sentMessage, [emoji], spawnType, 5000);
  }, getRandomInterval(1800000, 3600000)); // Random interval between 1 and 5 minutes
}

exports.randomSpawn = async function (client) {
  try {
    // Initial setup
    const guilds = await Guild.findAll({ where: { spawnChannelId: { [Op.not]: null } } });

    for (const guildConfig of guilds) {
      await setupGuildSpawn(client, guildConfig);
    }

    // Periodically check for updates in the database
    setInterval(async () => {
      const updatedGuilds = await Guild.findAll({ where: { spawnChannelId: { [Op.not]: null } } });

      const existingGuildIds = Object.keys(guildIntervals);
      const updatedGuildIds = updatedGuilds.map((guild) => guild.id);

      // Add new guilds or update spawn channels
      for (const guildConfig of updatedGuilds) {
        if (!guildIntervals[guildConfig.id]) {
          console.log(`New guild detected: ${guildConfig.id}, setting up spawn.`);
          await setupGuildSpawn(client, guildConfig);
        } else {
          const currentChannelId = guildConfig.spawnChannelId;
          const existingGuildConfig = await Guild.findByPk(guildConfig.id);

          if (existingGuildConfig.spawnChannelId !== currentChannelId) {
            console.log(`Guild spawn channel changed for guild ${guildConfig.id}, resetting spawn setup.`);
            clearInterval(guildIntervals[guildConfig.id]); // Clear old interval
            delete guildIntervals[guildConfig.id]; // Remove from tracking
            await setupGuildSpawn(client, guildConfig); // Set up the new spawn with updated channel
          }
        }
      }

      // Remove guilds no longer in the database
      for (const guildId of existingGuildIds) {
        if (!updatedGuildIds.includes(guildId)) {
          console.log(`Guild removed: ${guildId}, clearing interval.`);
          clearInterval(guildIntervals[guildId]);
          delete guildIntervals[guildId];
        }
      }
    }, 30000); // Refresh every 30 secs
  } catch (error) {
    console.error('Error in randomSpawn:', error);
  }
};
