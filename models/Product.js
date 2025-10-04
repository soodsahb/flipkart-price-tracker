import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  flipkartUrl: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    default: 'Unknown Product',
  },
  productImage: String,
  currentPrice: {
    type: Number,
    required: true,
  },
  initialPrice: {
    type: Number,
    required: true,
  },
  lastChecked: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);
