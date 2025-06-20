const Todo = require('../models/todo');

exports.createTodo = async (req, res) => {
    try {
        const { title, description, priority, color, dueDate } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User ID is missing' });
        }

        if (!title || typeof title !== 'string' || title.trim() === '') {
            return res.status(400).json({ message: 'Invalid title: Title is required and must be a non-empty string' });
        }

        const newTodo = {
            title,
            description,
            priority: priority.toLowerCase(),
            color,
            dueDate,
        };

        const userTodo = await Todo.findOneAndUpdate(
            { userId },
            { $push: { todos: newTodo } },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(201).json(userTodo.todos);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

exports.getAllTodos = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User ID is missing' });
        }

        const userTodo = await Todo.findOne({ userId });

        if (!userTodo || userTodo.todos.length === 0) {
            return res.status(404).json({ message: 'No todos found' });
        }

        res.status(200).json(userTodo.todos);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

exports.updateTodo = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const updates = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User ID is missing' });
        }

        if (!id) {
            return res.status(400).json({ message: 'Todo ID is required' });
        }

        const userTodo = await Todo.findOne({ userId });

        if (!userTodo) {
            return res.status(404).json({ message: 'No todos found for the user' });
        }

        const todoIndex = userTodo.todos.findIndex(todo => todo._id.toString() === id);

        if (todoIndex === -1) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        if (updates.priority) {
            updates.priority = updates.priority.toLowerCase();
        }

        Object.assign(userTodo.todos[todoIndex], updates);

        await userTodo.save();

        res.status(200).json(userTodo.todos[todoIndex]);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

exports.deleteTodo = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User ID is missing' });
        }

        if (!id) {
            return res.status(400).json({ message: 'Todo ID is required' });
        }

        const userTodo = await Todo.findOne({ userId });

        if (!userTodo) {
            return res.status(404).json({ message: 'No todos found for the user' });
        }

        const todoIndex = userTodo.todos.findIndex(todo => todo._id.toString() === id);

        if (todoIndex === -1) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        userTodo.todos.splice(todoIndex, 1);

        await userTodo.save();

        res.status(200).json({ message: 'Todo deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};