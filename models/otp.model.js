const { Sequelize, DataTypes, Model } = require('sequelize');
const {sequelize} = require('../config/connection')


class otp extends Model {}

otp.init(
  {
    // Model attributes are defined here
    sn: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      references: {
        model: sequelize.models.Customer,
        key: 'email', // this is the key in the customer model that the otp will reference to. 'email' is the column name in the customer model.
        unique: true, // ensures that each otp is unique for each customer.
      }
      // allowNull defaults to true
    },
    otp:{
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    }
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'otp', // We need to choose the model name
  },
);

// the defined model is the class itself
// console.log(otp === sequelize.models.otp); // true

module.exports = {
    otp
}