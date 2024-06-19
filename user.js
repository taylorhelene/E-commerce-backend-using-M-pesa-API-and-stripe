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
    type: Array,
  },
  orders: {
    type: Array,
  },
  cart: {
    type: Array,
  },
  favourite: {
    type: Array,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;