const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    min: 8,
  },
  address: {
    type: [Map],
  },
  orders: {
    type: [Map],
  },
  cart: {
    type: [Map],
  },
  favourite: {
    type: [Map],
  },
});

const User = mongoose.model('user', userSchema);

module.exports = User;