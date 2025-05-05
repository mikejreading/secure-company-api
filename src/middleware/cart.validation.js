const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation error',
      errors: errors.array().map(err => err.msg)
    });
  }
  next();
};

exports.validateAddItem = [
  body('productGUID')
    .trim()
    .notEmpty().withMessage('Product GUID is required')
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/)
    .withMessage('Invalid product GUID format'),
  
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1, max: 100 }).withMessage('Quantity must be between 1 and 100'),
  
  handleValidationErrors
];

exports.validateUpdateItem = [
  param('productGUID')
    .trim()
    .notEmpty().withMessage('Product GUID is required')
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/)
    .withMessage('Invalid product GUID format'),
  
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 0, max: 100 }).withMessage('Quantity must be between 0 and 100')
    .custom((value) => {
      // Allow 0 for removal, but not negative numbers
      if (value < 0) {
        throw new Error('Quantity cannot be negative');
      }
      return true;
    }),
  
  handleValidationErrors
];

exports.validateRemoveItem = [
  param('productGUID')
    .trim()
    .notEmpty().withMessage('Product GUID is required')
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/)
    .withMessage('Invalid product GUID format'),
  
  handleValidationErrors
];
