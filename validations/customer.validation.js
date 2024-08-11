const joi = require('joi')

//this function is used to validate the input from the customer
const customerValidation = (data)=>{
    const schema = joi.object({
        firstName: joi.string().required().pattern(new RegExp('^[a-zA-Z]+[a-zA-Z]$')),
        lastName: joi.string().required().pattern(new RegExp('^[a-zA-Z]+[a-zA-Z]$')),
        email: joi.string().email().required(),
        password: joi.string().required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
        confirmedPassword: joi.ref('password')
    })

    return schema.validate(data)
}

const customerUpdateValidation = (data)=>{
    const schema = joi.object({
        firstName: joi.string().pattern(new RegExp('^[a-zA-Z]+[a-zA-Z]$')),
        lastName: joi.string().pattern(new RegExp('[A-Za-z]+[a-zA-Z]$')),
        email: joi.string().email()
    })

    return schema.validate(data)
}

module.exports = {
    customerValidation,
    customerUpdateValidation
}