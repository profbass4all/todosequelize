const joi = require('joi');

const todoValidation = (data)=>{
    const schema = joi.object({
        todo_name: joi.string().required(),
        todo_description: joi.string().required()
    })

    return schema.validate(data)
}

const updateTodoValidation = (data)=>{
    const schema = joi.object({
        todo_name: joi.string(),
        todo_description: joi.string(),
        status: joi.string(),
    })

    return schema.validate(data)
}
module.exports = {todoValidation, updateTodoValidation};