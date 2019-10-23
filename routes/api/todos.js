const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Todo = require('../../models/Todo');

//@route       POST api/todos
//@desc        Add a todo
//@access      Private
router.post(
  '/',
  [
    auth,
    check('todo', 'Add Todo')
      .not()
      .isEmpty()
  ],

  async (req, res) => {
    //check errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { todo } = req.body;

    try {
      const newTodo = new Todo({
        todo,
        user: req.user.id
      });

      await newTodo.save();

      res.json(newTodo);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

//@route       GET api/todos
//@desc        Get all todos
//@access      Private
router.get('/', auth, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user.id }).sort({
      date: -1
    });
    res.json(todos);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

//@route       GET api/todos/id
//@desc        Get single todo
//@access      Private
router.get('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) return res.status(404).json({ msg: 'Todo not found' });

    res.json(todo);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

//@route       PATCH api/todos/id
//@desc        Update todo
//@access      Private
router.put('/:id', auth, async (req, res) => {
  //check errors
  const errors = validationResult(req);

  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { todo } = req.body;

  // Build todo object
  const updatedTodo = {};
  if (todo) updatedTodo.todo = todo;

  try {
    let todo = await Todo.findById(req.params.id);

    if (!todo) return res.status(404).json({ msg: 'Todo not found' });

    // Make sure user owns todo
    if (todo.user.toString() !== req.user.id)
      return res.status(401).json({ msg: 'Not authorized' });

    todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { $set: updatedTodo },
      { new: true }
    );

    res.json(todo);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

// @route    DELETE api/todos/:id
// @desc     Delete todo
// @access   Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) return res.status(404).json({ msg: 'Todo not found' });

    // Make sure user owns todo
    if (todo.user.toString() !== req.user.id)
      return res.status(401).json({ msg: 'Not authorized' });

    await Todo.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Todo removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
