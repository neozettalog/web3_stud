const {Sequelize, DataTypes} = require("sequelize");
const sequelize = new Sequelize(
 'web3_test_db',
 'root',
 '12345',
  {
    host: 'localhost',
    dialect: 'mysql'
  }
);

sequelize.authenticate().then(() => {
   console.log('Connection has been established successfully.');
}).catch((error) => {
   console.error('Unable to connect to the database: ', error);
});

const Transaction = sequelize.define("transaction", {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      transaction_hash: {
        type: DataTypes.STRING, // VARCHAR
        allowNull: true
      },
      contract_address: {
        type: DataTypes.STRING, // VARCHAR
        allowNull: false
      },
      transfer_from_address: {
        type: DataTypes.STRING, // VARCHAR
        allowNull: false
      },
      transfer_address: {
        type: DataTypes.STRING, // VARCHAR
        allowNull: false
      },
      amount: {
        type: DataTypes.DOUBLE,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING, // VARCHAR
        allowNull: false
      },
      created_at: {
        type: DataTypes.INTEGER, // INT
        allowNull: false
      },
      updated_at: {
        type: DataTypes.INTEGER, // INT
        allowNull: false
      },
      is_delete: {
        type: DataTypes.TINYINT,
        allowNull: false
      }
    });

sequelize.sync().then(() => {
   console.log('Transaction table created successfully!');
}).catch((error) => {
   console.error('Unable to create table : ', error);
});
