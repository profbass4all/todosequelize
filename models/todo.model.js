const { Sequelize, DataTypes, Model } = require('sequelize');
const {sequelize} = require('../config/connection')

class todo extends Model {}

todo.init(
  {
    // Model attributes are defined here
    sn:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    todo_id:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    todo_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    todo_description: {
      type: DataTypes.TEXT,
      allowNull: false,
      // allowNull defaults to true
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed'),
        allowNull: false,
        defaultValue: 'pending',
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    customer_id: {
            type: DataTypes.STRING,
            allowNull: false,
            
            references:{
              model: sequelize.models.Customer,
              key: 'customer_id',
              
            }
        }
    
    // Other fields and options,
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'todo', // We need to choose the model name
  },
);

// the defined model is the class itself
// console.log(todo === sequelize.models.todo); // true


module.exports = {
    todo
}