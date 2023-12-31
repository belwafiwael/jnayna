import { StatusCodes } from 'http-status-codes';
import { v2 as cloudinary } from 'cloudinary';
import Product from '../models/Product.js';
import { NotFoundError, BadRequestError } from '../errors/customErrors.js';
import { unlinkSync } from 'fs';

export const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};
export const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ products, count: products.length });
};
export const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId }).populate('reviews');
  if (!product) throw new NotFoundError(`No product with id : ${productId}`);
  res.status(StatusCodes.OK).json({ product });
};
export const updateProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findByIdAndUpdate(
    { _id: productId },
    req.body,
    { new: true, runValidators: true },
  );
  if (!product) throw new NotFoundError(`No product with id : ${productId}`);
  res.status(StatusCodes.OK).json({ product });
};
export const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId });
  if (!product) {
    throw new NotFoundError(`No product with id : ${productId}`);
  }
  await Product.deleteOne();
  res.status(StatusCodes.OK).json({ msg: 'Success! Product removed.' });
};

export const uploadImage = async (req, res) => {
  if (!req.files || !req.files.image) {
    throw new BadRequestError('No File Uploaded');
  }
  const productImage = req.files.image;
  const maxSize = 1024 * 1024 * 10;
  if (!productImage.mimetype.startsWith('image')) {
    throw new BadRequestError('Please Upload Image');
  }
  if (productImage.size > maxSize) {
    throw new BadRequestError('Please upload image smaller than ' + maxSize);
  }
  const result = await cloudinary.uploader.upload(
    req.files.image.tempFilePath,
    { use_filename: true, folder: 'jnayna-upload-files' },
  );
  await unlinkSync(req.files.image.tempFilePath);
  return res.status(StatusCodes.OK).json({ image: { src: result.secure_url } });
};

// export const uploadImageLocal = async (req, res) => {
//   if (!req.files) {
//     throw new BadRequestError('No File Uploaded');
//   }
//   const productImage = req.files.image;
//   const maxSize = 1024 * 1024 * 10;
//   if (!productImage.mimetype.startsWith('image')) {
//     throw new BadRequestError('Please Upload Image');
//   }
//   if (productImage.size > maxSize) {
//     throw new BadRequestError('Please upload image smaller than ' + maxSize);
//   }
//   const __filename = fileURLToPath(import.meta.url);
//   const __dirname = dirname(__filename);
//   const imagePath = path.join(
//     __dirname,
//     '../public/uploads/' + `${productImage.name}`,
//   );
//   await productImage.mv(imagePath);
//   res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
// };
