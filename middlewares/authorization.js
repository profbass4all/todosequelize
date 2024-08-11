const {Customer} = require('../models/customer.model')


const authorization = (arr)=>{
    return async (req, res, next) => {
        try {
        const {customer_id} = req.user

        if(!customer_id) throw new Error ('you must be authenticated', 401)
        
            //find the customer using the sutomer_id
        const user = await Customer.findOne({where: {customer_id: customer_id}})

        if(user == null) throw new Error ('user not found')
            //checking if the customer has the required role
        const authorized = arr.includes(user.dataValues.role)
        if(!authorized) throw new Error ('Unauthorized access', 403)
        next()
        } catch (error) {
            res.status(403).json({
                message: error.message,
                status: false,
            })
        }
    }
}

module.exports = {authorization};