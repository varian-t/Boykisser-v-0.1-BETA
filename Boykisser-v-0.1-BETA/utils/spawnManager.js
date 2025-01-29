// spawnManager.js
const { EmbedBuilder } = require('discord.js');

// Array of spawn types
const spawnTypes = [
    'Boykisser', 
    'Girlkisser',
    'Carminekisser',
    'Cirruskisser',
    'Cloudkisser',
    'Fluffykisser',
    'Glovekisser',
    'Scarnkisser',
    'Fieldkisser'
];

// Function to randomly choose a spawn type
function getRandomSpawn() {
    const randomIndex = Math.floor(Math.random() * spawnTypes.length);
    return spawnTypes[randomIndex];
}

// Function to get details based on the selected spawn type
function getSpawnDetails(spawnType) {
    switch (spawnType) {
        case 'Boykisser':
            return {
                filepath: '../images/boykissers/BoykisserBase.png',
                description: 'ooooh a kissy boy',
                color: '#30ffc1',
                treatsNeeded: 1
            };
        case 'Girlkisser':
            return {
                filepath: '../images/boykissers/GirlkisserBase.png',
                description: 'oooh a kissy girl',
                color: '#740fd9',
                treatsNeeded: 1
            };
        case 'Carminekisser':
              return {
                  filepath: '../images/boykissers/CarminekisserBase.png',
                  description: 'a kiss with a carmine shade :3',
                  color: '#740fd9',
                  treatsNeeded: 1
              };    
        case 'Cirruskisser':
              return {
                  filepath: '../images/boykissers/CirruskisserBase.png',
                  description: 'ooh a very hot kisser :3',
                  color: '#740fd9',
                  treatsNeeded: 1
              };
        case 'Cloudkisser':
              return {
                  filepath: '../images/boykissers/CloudkisserBase.png',
                  description: 'kissing among cozy clouds uwu',
                  color: '#740fd9',
                  treatsNeeded: 1
              };
        case 'Fluffykisser':
              return {
                  filepath: '../images/boykissers/FluffykisserBase.png',
                  description: 'oooh big fluffy kisses!',
                  color: '#740fd9',
                  treatsNeeded: 1
              };
        case 'Gingerkisser':
              return {
                  filepath: '../images/boykissers/GingerkisserBase.png',
                  description: 'this kisser has a pink motorbike',
                  color: '#740fd9',
                  treatsNeeded: 1
              };    
        case 'Glovekisser':
              return {
                  filepath: '../images/boykissers/GlovekisserBase.png',
                  description: `oooh who's that? a kissy girl, that's who :3`,
                  color: '#740fd9',
                  treatsNeeded: 1
              };    
        case 'Scarnkisser':
              return {
                  filepath: '../images/boykissers/ScarnkisserBase.png',
                  description: `ooh this kisser's kisses are on fire!`,
                  color: '#740fd9',
                  treatsNeeded: 1
              };    
        case 'Fieldkisser':
              return {
                  filepath: '../images/boykissers/FieldkisserBase.png',
                  description: `He is a stinker`,
                  color: '#740fd9',
                  treatsNeeded: 1
              };    
            }     
}

module.exports = {
    getRandomSpawn,
    getSpawnDetails
};
