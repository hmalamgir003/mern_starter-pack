const express = require('express');
const mongoose = require('mongoose');

const app = express();

//Connect DB
mongoose.connect(
  'mongodb://127.0.0.1:27017/mern_todo',
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  },
  () => console.log('DB connected....')
);

//Init middleware
app.use(express.json({ extended: false }));

//Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/todos', require('./routes/api/todos'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port${PORT}`));
