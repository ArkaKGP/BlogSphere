const User = require('../models/usermodel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '3d' });


exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists by email
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    // Create the new user with username
    const user = await User.create({ username, email, password });

    // Generate JWT token
    const token = createToken(user._id);

    // Send response
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token
    });
  } catch (err) {
    console.error('Registration error:', err); 
    res.status(500).json({ error: err.message });
  }
};


exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = createToken(user._id);
    res.status(200).json({ _id: user._id, username: user.username, email: user.email, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Getting all users
exports.getTotalUsers = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json({ totalUsers: count });
  } catch (err) {
    console.error('Error fetching user count:', err);
    res.status(500).json({ error: 'Failed to fetch user count' });
  }
};
