const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const productSchema = new mongoose.Schema({
  productGUID: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxLength: [100, 'Product name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxLength: [1000, 'Description cannot be more than 1000 characters']
  },
  supplier: {
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Supplier code is required'],
      trim: true
    }
  },
  supplierPrice: {
    type: Number,
    required: [true, 'Supplier price is required'],
    min: [0, 'Price cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
