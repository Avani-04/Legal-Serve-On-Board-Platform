const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  service: String,
  date: String,
  time: String
});

module.exports = mongoose.model('Appointment', appointmentSchema);
