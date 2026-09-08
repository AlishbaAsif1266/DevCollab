import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, skills, bio } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email address');
    }

    // Process skills if provided as string or array
    let parsedSkills = [];
    if (skills) {
      if (Array.isArray(skills)) {
        parsedSkills = skills;
      } else if (typeof skills === 'string') {
        parsedSkills = skills.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    // Create user in MongoDB
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'developer',
      skills: parsedSkills,
      bio: bio || undefined,
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio,
          skills: user.skills,
          githubUrl: user.githubUrl,
          linkedinUrl: user.linkedinUrl,
          portfolioUrl: user.portfolioUrl,
          experienceLevel: user.experienceLevel,
          createdAt: user.createdAt,
        },
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data provided');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        message: 'Logged in successfully',
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio,
          skills: user.skills,
          githubUrl: user.githubUrl,
          linkedinUrl: user.linkedinUrl,
          portfolioUrl: user.portfolioUrl,
          experienceLevel: user.experienceLevel,
          createdAt: user.createdAt,
        },
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.name = req.body.name || user.name;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.avatar = req.body.avatar !== undefined ? req.body.avatar : user.avatar;
    user.githubUrl = req.body.githubUrl !== undefined ? req.body.githubUrl : user.githubUrl;
    user.linkedinUrl = req.body.linkedinUrl !== undefined ? req.body.linkedinUrl : user.linkedinUrl;
    user.portfolioUrl = req.body.portfolioUrl !== undefined ? req.body.portfolioUrl : user.portfolioUrl;
    user.experienceLevel = req.body.experienceLevel || user.experienceLevel;

    if (req.body.skills) {
      if (Array.isArray(req.body.skills)) {
        user.skills = req.body.skills;
      } else if (typeof req.body.skills === 'string') {
        user.skills = req.body.skills.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        skills: updatedUser.skills,
        githubUrl: updatedUser.githubUrl,
        linkedinUrl: updatedUser.linkedinUrl,
        portfolioUrl: updatedUser.portfolioUrl,
        experienceLevel: updatedUser.experienceLevel,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all developers / search developers
// @route   GET /api/auth/developers
// @access  Public
export const getDevelopers = async (req, res, next) => {
  try {
    const { search, skill } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
      ];
    }

    if (skill) {
      query.skills = { $regex: skill, $options: 'i' };
    }

    const developers = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: developers.length,
      developers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get developer profile by ID
// @route   GET /api/auth/developers/:id
// @access  Public
export const getDeveloperById = async (req, res, next) => {
  try {
    const developer = await User.findById(req.params.id).select('-password');
    if (!developer) {
      res.status(404);
      throw new Error('Developer profile not found');
    }
    res.json({
      success: true,
      developer,
    });
  } catch (error) {
    next(error);
  }
};
