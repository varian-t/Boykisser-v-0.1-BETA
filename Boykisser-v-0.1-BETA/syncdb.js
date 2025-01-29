const sequelize = require('./database.js');
const User = require('./models/User.js');
//const Guild = require('./models/guild.js');
const Soulmates = require('./models/Soulmates.js');

(async () => {
  await sequelize.sync({ force: true });
  console.log('Database synced!');
  process.exit();
})();