require('dotenv').config()
const express = require('express')
const app = express()
const {sequelize} = require('./config/connection')
const bodyParser = require('body-parser')
const customerRouter = require('./routes/customer.route')
const otpRouter = require('./routes/otp.route')
const todoRouter = require('./routes/todo.route')

app.use(bodyParser.urlencoded({extended: false}))
app.use(customerRouter)
app.use(otpRouter)
app.use(todoRouter)

try {
    (async()=>{
        await sequelize.authenticate();
       
        await sequelize.sync();
        console.log('Connection has been established successfully.');
        app.listen(process.env.APP_PORT, () => {
            console.log(`Nihmat is running on port ${process.env.APP_PORT}`)
        });
    })(); 
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

app.get('/', (req, res)=>{
    console.log('Nihmat is running')
})