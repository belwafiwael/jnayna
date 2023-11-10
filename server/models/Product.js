import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide name'],
      maxLength: [100, 'Name can not be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      maxLength: [1000, 'Name can not be more than 1000 characters'],
    },
    image: { type: String, default: '/upload/example.jpg' },
    pricePerPiece: { type: Number, default: 0 },
    pricePerKg: {
      type: Number,
      required: [true, 'Please provide product price'],
    },
    category: {
      type: String,
      required: [true, 'Please provide product category'],
      enum: {
        values: ['amande', 'pistache', 'noisette', 'miniardise', 'others'],
        message: '{VALUE} is not supported',
      },
    },
    featured: { type: Boolean, default: false },
    freeShipping: { type: Boolean, default: true },
    inventory: { type: Number, required: true, default: 10 },
    averageRating: { type: Number, default: 0 },
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

export default mongoose.model('Product', ProductSchema);
