const { Sequelize } = require("sequelize");
const config = require('../configs/config');

const sequelize = new Sequelize(
  config.database.database_name,
  config.database.username,
  config.database.password,
  {
    host: config.database.host,
    dialect: 'mysql',
    logging: false,
  },
);

async function dbConnection() {
  sequelize.authenticate().then(() => {
    console.log('DB Connection established.');
  }).catch((error) => {
    console.error('Unable to connect DB: ', error);
  });
}

dbConnection();

module.exports = sequelize;

// sequelize.sync().then(() => {
//    console.log('Transaction table created successfully!');
// }).catch((error) => {
//    console.error('Unable to create table : ', error);
// });
