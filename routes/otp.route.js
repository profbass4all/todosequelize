const express = require('express');
const router = express.Router();
const {verifyCustomer} = require('../controllers/customer.controllers')

//this route is used to verify the customer
router.post('/verifyCustomer', verifyCustomer)

module.exports = router;


