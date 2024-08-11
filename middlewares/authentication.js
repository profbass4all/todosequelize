const jwt = require('jsonwebtoken');

const isAuthenticated = (req, res, next) => {
    try {
        //getting the token from the header
    const token  = req.headers.authorization;

    // if no token then throw an error
    if(!token) throw new Error ('Please login!!', 401)

    //if token is available, verify it and return its payload
    const decoded = jwt.verify(token, process.env.SECRET_KEY)
    
    if(!decoded) throw new Error ('Invalid or expired token!!', 403)

    //save the customer_id from the payload to req.user
    req.user = {customer_id: decoded.customer_id}
    // console.log('obj', req.user)
    next()
    } catch (error) {
        if(error instanceof jwt.JsonWebTokenError) {
            res.status(403).json({
            message: 'Invalid token!!',
            status: false,
        })
    }else if(error instanceof jwt.TokenExpiredError){
        res.status(403).json({
            message: 'Token expired!!',
            status: false,
        })
    }else{
        res.status(500).json({
            message: error.message || 'An error occurred while authenticating',
            status: false,
        })
    }
        
    }
}

module.exports = {isAuthenticated};