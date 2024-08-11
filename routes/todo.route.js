const express = require('express');
const router = express.Router();
const {createTodo, getTodos, getTodo,getAllTodos, editTodo, deleteTodo, getDeletedTodos} = require('../controllers/todo.controllers')
const {isAuthenticated} = require ('../middlewares/authentication')
const {authorization} = require ('../middlewares/authorization')



router.post('/createTodo', isAuthenticated, authorization(['customer', 'admin']), createTodo)

router.get('/todos', isAuthenticated, authorization(['customer', 'admin']), getTodos)

router.get('/getTodo/:todo_id', isAuthenticated, authorization(['customer', 'admin']), getTodo)

router.patch('/todo/:todo_id', isAuthenticated, authorization(['customer', 'admin']), editTodo)

router.patch('/deleteTodo/:todo_id', isAuthenticated, authorization(['customer', 'admin']), deleteTodo)

router.get('/getDeletedTodos', isAuthenticated, authorization(['admin']), getDeletedTodos)

router.get('/getAllTodos', isAuthenticated, authorization(['admin']), getAllTodos)

module.exports = router