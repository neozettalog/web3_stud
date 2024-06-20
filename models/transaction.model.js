const sequelize = require('../database/db.js');
const { DataTypes } = require('sequelize');

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
  },
  user_telegram_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  }
}, {
  timestamps: false,  // Disable createdAt and updatedAt
});

module.exports = Transaction;