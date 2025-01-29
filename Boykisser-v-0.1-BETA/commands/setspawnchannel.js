const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const Guild = require('../models/guild.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-spawn-channel')
        .setDescription('Set the channel where spawns will be sent.')
        .addChannelOption(option => 
            option
                .setName('channel')
                .setDescription('Channel to send the spawn messages in.')
                .addChannelTypes(ChannelType.GuildText)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    run: async ({ interaction }) => {
        await interaction.deferReply({ ephemeral: true });

        const { options, member } = interaction;

        // Ensure only the server owner can use the command
        if (interaction.guild.ownerId !== member.id) {
            return interaction.editReply('Only the server owner can use this command.');
        }

        const channel = options.getChannel('channel');
        const guildId = interaction.guild.id; // Server ID

        try {
            if (!channel) {
                // Clear the spawnChannelId by updating or creating the row
                await Guild.upsert({
                    id: guildId,
                    spawnChannelId: null, // Clear the spawnChannelId
                });
                return interaction.editReply('Spawn channel has been cleared.');
            }

            // Update or create the row with the new spawnChannelId
            await Guild.upsert({
                id: guildId,
                spawnChannelId: channel.id,
            });

            interaction.editReply(`Set the channel for spawn messages to ${channel.toString()}`);
        } catch (error) {
            console.error('Error setting spawn channel:', error);
            interaction.editReply('An error occurred while setting the spawn channel.');
        }
    },
};
