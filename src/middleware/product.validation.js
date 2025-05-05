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

exports.validateCreateProduct = [
  body('productName')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 100 }).withMessage('Product name cannot exceed 100 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Product description is required')
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  
  body('supplier.name')
    .trim()
    .notEmpty().withMessage('Supplier name is required')
    .isLength({ max: 100 }).withMessage('Supplier name cannot exceed 100 characters'),
  
  body('supplier.code')
    .trim()
    .notEmpty().withMessage('Supplier code is required')
    .isLength({ max: 50 }).withMessage('Supplier code cannot exceed 50 characters')
    .matches(/^[A-Za-z0-9-]+$/).withMessage('Supplier code can only contain letters, numbers, and hyphens'),
  
  body('supplierPrice')
    .notEmpty().withMessage('Supplier price is required')
    .isFloat({ min: 0 }).withMessage('Supplier price must be a positive number')
    .custom((value) => {
      if (value > 1000000) {
        throw new Error('Supplier price cannot exceed 1,000,000');
      }
      return true;
    }),
  
  handleValidationErrors
];

exports.validateUpdateProduct = [
  param('productGUID')
    .trim()
    .notEmpty().withMessage('Product GUID is required')
    .isUUID(4).withMessage('Invalid product GUID format'),
  
  body('productName')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Product name cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  
  body('supplier.name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Supplier name cannot exceed 100 characters'),
  
  body('supplier.code')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Supplier code cannot exceed 50 characters')
    .matches(/^[A-Za-z0-9-]+$/).withMessage('Supplier code can only contain letters, numbers, and hyphens'),
  
  body('supplierPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Supplier price must be a positive number')
    .custom((value) => {
      if (value > 1000000) {
        throw new Error('Supplier price cannot exceed 1,000,000');
      }
      return true;
    }),
  
  handleValidationErrors
];

exports.validateProductGUID = [
  param('productGUID')
    .trim()
    .notEmpty().withMessage('Product GUID is required')
    .isUUID(4).withMessage('Invalid product GUID format'),
  
  handleValidationErrors
];
