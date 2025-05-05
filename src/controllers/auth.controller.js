const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const generateToken = (id) => {
  const expiresIn = process.env.NODE_ENV === 'test' ? '1h' : process.env.JWT_EXPIRE || '24h';
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    
    const token = generateToken(user._id);
    res.status(201).json({ token });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate email value entered' });
    }
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    res.json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
