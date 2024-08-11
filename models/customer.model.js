const { Sequelize, DataTypes, Model } = require('sequelize');
const {sequelize} = require('../config/connection')

class Customer extends Model {}

Customer.init(
  {
    // Model attributes are defined here
    sn:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    customer_id:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      // allowNull defaults to true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    role: {
        type: DataTypes.ENUM('customer', 'admin'),
        allowNull: false,
        defaultValue: 'customer'
    },
    is_email_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    hash: {
        type: DataTypes.TEXT,
        allowNull: false,
        
    },
    salt: {
        type: DataTypes.TEXT,
        allowNull: false,
    }
    // Other fields and options,
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'Customer', // We need to choose the model name
  },
);

// the defined model is the class itself
// console.log(Customer === sequelize.models.Customer); // true


module.exports = {
    Customer
}