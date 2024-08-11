const {Customer} = require('../models/customer.model')
const {otp} = require('../models/otp.model')
const {generateOtp, hashPassword, comparePassword, expiryTime} = require('../utils')    
const {customerValidation, customerUpdateValidation} = require('../validations/customer.validation')
const { v4: uuidv4 } = require('uuid');
const {sendEmail} = require('../services/email')
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const {sequelize} = require('../config/connection')



// this function is used to create a new customer
const createCustomer = async (req, res)=>{
    try {
        const {firstName, lastName, email, password} = req.body

        //validatecustomer information
        const {error} = customerValidation(req.body)
        
        //if error is not undefined throw new error
        if(error != undefined) throw new Error(error.details[0].message || error)
            
        // this function hash the password and return salt and hash password
        const [hash, salt] = await hashPassword(password)
        // console.log('hash', hash)

        //insert the customer information into the database
        await Customer.create({customer_id: uuidv4(),firstName, lastName, email, hash, salt})

        //this function generates otp
        const otpCode = generateOtp()

        //insert the otp and email into the database
        await otp.create({email, otp: otpCode})

        //send otp to customer's email address
        sendEmail(email, `verify your email with this otp code ${otpCode}`, 'Email verification')

        
        res.status(200).send({
            message: 'Customer created successfully',
            status: true,
        })
    } catch (error) {
        res.status(500).send({
            message: error.message || 'An error occurred while creating the customer',
            status: false,
        })
    }
}

// this function is used to verify customer's email address
const verifyCustomer = async(req, res) => {  
    try {

        //the customer's email address and otp are destructured
        const {email, otpcode} = req.body

        //this function find the otp in the database based on customer's email address and otp code
        const isOtpValid = await otp.findOne({where: {email: email, otp: otpcode}})

        //this checks if the otp does not exist in the database and throw error
        if(isOtpValid === null) throw new Error('invalid or expired otp code')
        
        //this function get the time when the otp was created in the database
        const otpTime = isOtpValid.dataValues.createdAt.getTime()

        //this function checks if the otp is expired or not
        const isExpired = expiryTime(otpTime)

        //if otp is expired throw new error
        if(isExpired == true) throw new Error('invalid or expired otp code')
        
        //this function send the verification email to the customer's email address
        sendEmail(email, `Your email address has been verified`, 'Verification Success')

        //this function destroys the otp from the database
        await otp.destroy({where: {email: email}})

        //this function updates the customer's is_email_verified  in the database to true
        await Customer.update({is_email_verified: true},{where: {email: email}})

        res.status(200).json({
            message: 'Email verified successfully',
            status: true,
        })
    } catch (error) {
        res.status(500).json({
            message: error.message || 'An error occurred while verifying the email',
            status: false,
        })
    }
}

// this function is used to login a customer
const login =async (req, res)=>{
    try {
    
    // the email and password are been destructured from the request body
    const {email, password} = req.body
    
    // this function find the customer in the database based on customer's email address
    const customerFound = await Customer.findOne({where: {email: email}})
    // console.log('say', customerFound)

    // if customer not found throw new error
    if(customerFound == null) throw new Error( 'invalid email or password' )
    
    //this checks if the customer's email has been verified and returns a boolean value
    if(customerFound.dataValues.is_email_verified == false){
        //we are here because the customer's email is not verified

        //let's get the customer otp from the database
        const getOtp = await otp.findOne({ where: {email: email}})
        // console.log('get the otp', getOtp)

        //this gets the time the otp was created
        const otpTime = getOtp.dataValues.createdAt.getTime()

        //this checks if the otp is expired or not
        const isExpired = expiryTime(otpTime)

        //lets check if the otp is expired
        if(isExpired == true){

            //we are here becuase the otp has expired
            //first thing first!! delete the expired otp
            await otp.destroy({where: {email}})

            //generate a new otp 
            const otpCode = generateOtp()

            //insert the new otp into the database
            await otp.create({email, otp: otpCode})

            //send the otp to the customer's email address
            sendEmail(email, `verify your email with this otp code ${otpCode}`, 'Email verification')

            res.status(200).json({
            message: 'verify your email with this otp code and login!!',
            status: 'success',
            })
        }else{

            //we are here because the otp is not expired

            //send the otp to the customer's email address again
            sendEmail(email, `verify your email with this otp code ${getOtp.dataValues.otp}`, 'Email verification')

            res.status(200).json({
            message: 'verify your email with this otp code and login!!!',
            status: 'success',
            })
        }  
    }else{
        // you're here because the customer's email is already verified

        //this gets the hash from the database
        const db_hash = customerFound.toJSON().hash

        //this gets the salt from the database
        const db_salt = customerFound.toJSON().salt

        //this function compare the entered password with the hashed password in the database
        const hash = await comparePassword(password, db_salt)

        //if the entered password does not match with the hashed password in the database throw new error
        if(db_hash !== hash) throw new Error ('invalid email or password!!!')
        
        //generate a jwt token for the customer and save the the customer's id in the payload object
        const token = jwt.sign({customer_id: customerFound.toJSON().customer_id}, process.env.SECRET_KEY, {expiresIn: process.env.EXPIRES_IN , subject: 'todoApp'})

        res.status(200).json({
            message: 'login successful',
            status: 'success',
            data: customerFound.toJSON(),
            token
        })
    }} catch (error) {
        res.status(500).json({
            message: error.message,
            status: false,
        })
    }

}

//this function updates the customer's account
const updateUserAccount = async (req, res) => {
    try {
        //this will destructure the customer_id from the req.user.. this req.user was created during authentication
        const {customer_id} = req.user

        //this function check for errors in the customer's inputted value  
        const {error} = customerUpdateValidation(req.body)

        //if error is not undefined throw new error 
        if(error != undefined) throw new Error(error.details[0].message)

        //this function updates the customer's account in the database based on the customer_id and the new data in the request body.
        await Customer.update(req.body, {where: {customer_id}})
        
        //this function sends a success message to the customer
        res.status(200).json({
            message: 'User account updated successfully',
            status: true,
        })
    } catch (error) {
        res.status(500).json({
            message: error.message || 'An error occurred while updating the user account',
            status: false,
        })
    }
}

//this function retrieves all customers from the database
const getCustomers =async (req, res) => {
    try {
        
        //this sets the page number
        const page = req.query.page || 1

        //this sets the number of customers displayed per page
        const limit = 3
        
        //this check the database and retrieve the customers base on the page number, limit and search query
        const customers = req.query.firstName == undefined ? await Customer.findAndCountAll({attributes: ['firstName', 'lastName', 'email', 'role'],order: [['firstName']], limit, offset: (page - 1) * limit      }) : await Customer.findAndCountAll({  attributes:['firstName', 'lastName', 'email', 'role'],  where: {firstName: {[Op.regexp]:`^${req.query.firstName}`}  }  , order: [['firstName']], limit, offset: (page - 1) * limit       })
        

        //this check the database and group the customers into two groups..those that have verfied and others that have not
        const groupBaseOnVerification = await sequelize.query('SELECT is_email_verified, count(is_email_verified) as Stats from Customers group by is_email_verified')
        
        res.status(200).json({
            message: 'Customers retrieved successfully',
            status: true,
            data: customers.rows,
            count: customers.count,
            group: groupBaseOnVerification[0]
        })
    } catch (error) {
        res.status(500).json({
            message: error.message || 'An error occurred while retrieving customers',
            status: false,
        })
    }
}






module.exports = {
    createCustomer,
    verifyCustomer,
    login,
    updateUserAccount,
    getCustomers
}