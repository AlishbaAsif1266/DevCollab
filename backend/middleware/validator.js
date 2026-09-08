import { body, validationResult } from 'express-validator';

// Middleware to handle express-validator errors centrally
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => err.msg);
    res.status(400);
    return next(new Error(extractedErrors.join('. ')));
  }
  next();
};

// Auth Validation Rules
export const registerValidationRules = () => [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['developer', 'project_owner', 'admin'])
    .withMessage('Invalid role specified'),
  body('experienceLevel')
    .optional()
    .isIn(['Junior', 'Mid-Level', 'Senior', 'Lead'])
    .withMessage('Invalid experience level'),
];

export const loginValidationRules = () => [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const updateProfileValidationRules = () => [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('githubUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Please enter a valid GitHub URL'),
  body('linkedinUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Please enter a valid LinkedIn URL'),
  body('portfolioUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Please enter a valid Portfolio URL'),
];

// Project Validation Rules
export const createProjectValidationRules = () => [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Project title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Project title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Project description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be at least 10 characters long'),
  body('category')
    .optional()
    .isIn(['Web Development', 'Mobile App', 'AI / ML', 'DevOps', 'Cloud & Infra', 'Open Source', 'Other'])
    .withMessage('Invalid category'),
  body('status')
    .optional()
    .isIn(['Planning', 'Active', 'Completed', 'On Hold'])
    .withMessage('Invalid status'),
  body('repositoryUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Please enter a valid Repository URL'),
  body('demoUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Please enter a valid Live Demo URL'),
];

export const addMemberValidationRules = () => [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Developer email is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('role')
    .optional()
    .isIn(['Owner', 'Lead', 'Developer', 'Viewer'])
    .withMessage('Invalid team role'),
];
