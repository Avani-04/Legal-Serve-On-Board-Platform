// Backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const User = require('./models/User');
const Appointment = require('./models/Appointment');

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static('../FrontEnd')); // serve frontend files if needed

// ✅ MongoDB Connection (only once)
mongoose.connect('mongodb://127.0.0.1:27017/legalserve', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ✅ Signup Route
app.post('/signup', async (req, res) => {
  const { fullname, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ fullname, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Signup successful' });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ Signin Route
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid password' });

    res.status(200).json({ message: 'Signin successful', user });
  } catch (error) {
    console.error("Signin error:", error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Appointment Routes
app.post('/book', async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.json({ message: 'Appointment booked successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Start Server (only once)
app.listen(5000, () => console.log('Server running on http://localhost:5000'));
