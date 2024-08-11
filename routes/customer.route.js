const express = require('express')
const router = express.Router()
const {createCustomer, login, updateUserAccount, getCustomers} = require('../controllers/customer.controllers')
const {isAuthenticated} = require ('../middlewares/authentication')

const {authorization} = require ('../middlewares/authorization')


// this route is used to register customers
router.post('/customer', createCustomer)

// this route is used to login customers and generate JWT token for them
router.post('/login', login)

// this route is used to update customer account details.. this route requires authentication and authorization
router.patch('/update/customer', isAuthenticated, authorization(['customer', 'admin']), updateUserAccount)

// this route is used to get all customers.. it's available to only authenticated admins
router.get('/customers', isAuthenticated, authorization(['admin']), getCustomers)

module.exports = router