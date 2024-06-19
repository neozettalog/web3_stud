const sequelize = require('../database/db.js');
const { DataTypes } = require('sequelize');

const Receipt = sequelize.define("receipt", {
    receipt_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    transaction_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    block_hash: {
        type: DataTypes.STRING(68), // VARCHAR
        allowNull: true
    },
    block_number: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
    },
    cumulative_gas_used: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
    },
    effective_gas_price: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
    },
    sender_address: {
        type: DataTypes.STRING(68), // VARCHAR
        allowNull: true
    },
    gas_used: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
    },
    logs: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    receiver_address: {
        type: DataTypes.STRING, // VARCHAR
        allowNull: true
    },
    transaction_hash: {
        type: DataTypes.STRING, // VARCHAR
        allowNull: true
    },
    transaction_index: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
    },
    type: {
        type: DataTypes.INTEGER, // INT
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
}, {
    timestamps: false  // Disable createdAt and updatedAt
});

module.exports = Receipt;