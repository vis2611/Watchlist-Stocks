const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 1,
    maxlength: 5,
    uppercase: true,
    match: /^[A-Z]{1,5}$/
  }
});

module.exports = mongoose.model('Stock', stockSchema);
