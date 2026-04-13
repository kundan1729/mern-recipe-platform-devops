import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      isVerified: true, // For demo purposes, auto-verify
    });

    // Generate token
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        user_metadata: {
          full_name: user.fullName,
        },
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: error.message || 'Signup failed' });
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user and get password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate token
    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        user_metadata: {
          full_name: user.fullName,
        },
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ success: false, message: error.message || 'Signin failed' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        recipesSaved: user.recipesSaved,
        recipesGenerated: user.recipesGenerated,
        user_metadata: {
          full_name: user.fullName,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, email } = req.body;
    const updates = {};

    if (fullName) updates.fullName = fullName;
    if (email) updates.email = email;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        user_metadata: {
          full_name: user.fullName,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Profile update failed' });
  }
};
