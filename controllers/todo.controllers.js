const {todo} = require('../models/todo.model')
const {todoValidation, updateTodoValidation} = require('../validations/todo.validation')
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

//this functions create a new todo
const createTodo = async(req, res)=>{
    try {
        const {todo_name, todo_description } = req.body
        const {customer_id} = req.user

        //this function validates the todo details
        const {error} = todoValidation({todo_name, todo_description})

        //if any validation fails, throw an error with the validation error message
        if (error != undefined) throw new Error(error.details[0].error)
        

        //if validation passes, create a new todo in the database and return the success message and the new todo data
        const newTodo = await todo.create({todo_name, todo_id: uuidv4(), todo_description, customer_id})

        res.status(201).json({
            message: 'Todo created successfully',
            data: newTodo,
            status: true,
        })

    } catch (error) {
        res.status(500).send({
            message: error.message || 'An error occurred while creating the todo',
            status: false,
        })
    }
}

//this function gets all todos
const getTodos = async (req, res) => {
    try {
        const {customer_id} = req.user

        const {todo_name} = req.query
        
        const limit = 5 //max number of todos per page

        const page = req.query.page || 1 //page number

        const offset = (page - 1) * limit //calculate the offset for pagination based on page number and limit per page
        
        
        let todos;

        //if no todo_name is provided, fetch all todos for the customer
        if(todo_name === undefined){
            todos = await todo.findAndCountAll( { attributes:['todo_name', 'todo_description'],  where:{[Op.and]: [{customer_id: customer_id}, {is_deleted: false}]} , order:[['todo_name', 'ASC'] ], limit, offset  })

        //if todo_name is provided in req.query then this will search the database base on the todo_name field 
        }else{
            todos = await todo.findAndCountAll({   attributes:['todo_name', 'todo_description'], where:{[Op.and]: [{customer_id: customer_id}, {is_deleted: false}], todo_name: { [Op.regexp]: `^${todo_name}`}} })
        }
        
        res.status(200).json({
            message: 'Todos fetched successfully',
            data: todos.rows,
            count: todos.count,
            status: true,
        })
    } catch (error) {
        res.status(500).json({
            message: error.message || 'An error occurred while fetching todos',
            status: false,
        })
    }
}

//this function gets a single todo
const getTodo = async (req, res) => {
    try {
        const {todo_id} = req.params

        //this checks for a single todo that was created by the customer using the todo_id
        const singleTodo = await todo.findOne({where: {[Op.and]: [{customer_id: req.user.customer_id},{todo_id:todo_id} ]}   })

         //if singletodo is null then throw an error
        if(singleTodo == null) throw new Error ('todo is not available')

        //throw new Error if is_deleted is true
        if(singleTodo.dataValues.is_deleted == true) throw new Error ("Todo deleted", 403)

        res.status(200).json({
            message: 'success',
            data: singleTodo.dataValues
    })
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: false
        })
    }    
}

//this function updates a single todo
const editTodo = async (req, res) => {
    try {
        const {todo_id} = req.params

        // the function validates the input
        const validateTodo = updateTodoValidation(req.body)

        //check if error
        if (validateTodo.error!= undefined) throw new Error(validateTodo.error.details[0].message)
        
        // this updates the todo in the database if no error
        await todo.update(req.body, {where: {[Op.and]: [{customer_id: req.user.customer_id}, {todo_id: todo_id}  ]}})
                // console.log('i got her')

        //if no error, return success message
        res.status(200).json({
            message: 'Todo updated successfully',
            status: true,
        })
    } catch (error) {
        res.status(500).json({
            message: error.message || 'An error occurred while updating the todo',
            status: false,
        })
    }
}

//this function deletes a single todo
const deleteTodo = async (req, res) => {
    try {
        const {todo_id} = req.params
        
        // this query deletes the todo from the database if no error
        const isDelete = await todo.update({is_deleted: true}, {where: {[Op.and]:[{todo_id:todo_id}, {customer_id: req.user.customer_id}]}},)

        //if todo is not deleted
        if(isDelete[0]!= '1') throw new Error ("Todo not found or you are not authorized to delete this todo", 403)
            
        //if todo is deleted, return success message
        res.status(200).json({
            message: 'Todo deleted successfully',
            status: true,
        })
    } catch (error) {
        res.status(500).json({
            message: error.message || 'An error occurred while deleting the todo',
            status: false,
        })
    }
 
}

//this function fetches all deleted todos
const getDeletedTodos =async(req, res)=>{
    try {

        //this query will return all deleted todos
        const deletedTodos = await todo.findAll({where:{is_deleted: true}})
        res.status(200).json({
            message: 'Deleted todos fetched successfully',
            data: deletedTodos,
            status: true,
        })
    } catch (error) {
        res.status(500).json({
            message: error.message || 'An error occurred while fetching deleted todos',
            status: false,
        })
    }
}

//this function fetches all todos
const getAllTodos =async (req, res) => {
    try {

        //this query will return all todos
        const allTodos = await todo.findAll()
        res.status(200).json({
            message: 'All todos fetched successfully',
            data: allTodos,
            status: true,
        })
    } catch (error) {
        res.status(500).json({
            message: error.message || 'An error occurred while fetching all todos',
            status: false,
        })
    }
}

module.exports = {
    createTodo,
    getTodos,
    getTodo,
    deleteTodo,
    editTodo,
    getDeletedTodos,
    getAllTodos
}