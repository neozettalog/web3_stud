const moment = require("moment/moment");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(
 'web3_test_db',
 'root',
 '12345',
  {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
  },
);

const Transaction = sequelize.define("transaction", {
  id: {
    type: Sequelize.DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  transaction_hash: {
    type: Sequelize.DataTypes.STRING, // VARCHAR
    allowNull: true
  },
  contract_address: {
    type: Sequelize.DataTypes.STRING, // VARCHAR
    allowNull: false
  },
  transfer_from_address: {
    type: Sequelize.DataTypes.STRING, // VARCHAR
    allowNull: false
  },
  transfer_address: {
    type: Sequelize.DataTypes.STRING, // VARCHAR
    allowNull: false
  },
  amount: {
    type: Sequelize.DataTypes.DOUBLE,
    allowNull: false
  },
  status: {
    type: Sequelize.DataTypes.STRING, // VARCHAR
    allowNull: false
  },
  created_at: {
    type: Sequelize.DataTypes.INTEGER, // INT
    allowNull: false
  },
  updated_at: {
    type: Sequelize.DataTypes.INTEGER, // INT
    allowNull: false
  },
  is_delete: {
    type: Sequelize.DataTypes.TINYINT,
    allowNull: false
  }
}, {
  timestamps: false  // Disable createdAt and updatedAt
});

sequelize.authenticate()
    .then(() => console.log('Successfully connected to `web3_test_db` in test app!'))
    .catch((error) => console.log('Failed to connect `web3_test_db` in test app:', error))

    var count = 3
    var booleanRotate = false
    
    setInterval(async () => { 
        sequelize.sync().then(async () => {
            var epochtime = Math.floor(new Date().getTime() / 1000)
            count++

            await Transaction.create({ 
                contract_address: `0xcontract1`,
                transfer_from_address: `0xfrom${count}`,
                transfer_address: `0xto${count}`,
                status: `${booleanRotate ? "PROCESSING" : "COMPLETED"}`,
                created_at: epochtime,
                updated_at: epochtime,
                is_delete: 0,
            });
        }).catch((error) => {
            console.error('Unable to create table : ', error);
        });
      }, 5000); 