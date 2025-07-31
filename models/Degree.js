const mongoose = require('mongoose');

const degreeSchema = new mongoose.Schema({
  name: String,
  course: String,
  university: String,
  graduationYear: Number,
  hash: String
});

module.exports = mongoose.model('Degree', degreeSchema);