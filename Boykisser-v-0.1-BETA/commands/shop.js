const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');
const accessoriesData = require('../objects/accessories.js'); // Import the accessories file
const  selectedAccessories = require('../objects/currentShopAccessories.js');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Check out the shop!'),
    
  run: async ({ interaction }) => {
    await interaction.reply('Loading the shop...');

    // Create a single canvas
    const canvas = createCanvas(1000, 400);
    const ctx = canvas.getContext('2d');

    // Draw the shopkeeper and accessories
    await drawShopkeeper(ctx);
    let movingAccessories = 0;
    await drawAccessories(ctx);
    // Convert the final canvas to a buffer
    const buffer = canvas.toBuffer('image/png');
    const attachment = new AttachmentBuilder(buffer, { name: 'shop-image.png' });

    // Send the shop as an embed
    const embed = new EmbedBuilder()
      .setTitle('Welcome to the Accessory Shop!')
      .setDescription('How may I kiss ya??~ :3')
      .setColor('Random')
      .setImage('attachment://shop-image.png');

    await interaction.editReply({
      embeds: [embed],
      files: [attachment],
    });


 



    // Function to draw the shopkeeper
    async function drawShopkeeper(ctx) {
      const shopkeeperPath = path.join(__dirname, '../images/shop/shopkeeper.png');
      const shopkeeperImage = await loadImage(shopkeeperPath);
      ctx.drawImage(shopkeeperImage, 0, 0, 1000, 400); // Adjust size and position
    }

    // Function to draw accessories
    async function drawAccessories(ctx) {
      
    
      const accessoriesToDraw = accessoriesData.filter(accessory =>
        selectedAccessories.includes(accessory.name)
      );

  
    
      for (const accessory of accessoriesToDraw) {
        try {
          const accessoryPath = path.join(__dirname, accessory.shopfilepath);
          console.log('Loading accessory from:', accessoryPath); // Debugging
          const accessoryImage = await loadImage(accessoryPath);
          ctx.drawImage(accessoryImage, movingAccessories, 0, 1000, 400); // Adjust size and position as needed

          movingAccessories += 260;
        } catch (error) {
          console.error(`Failed to load accessory ${accessory.name}:`, error.message);
        }
      }
    }
    
  },
};
