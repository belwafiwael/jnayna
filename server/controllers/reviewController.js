import { StatusCodes } from 'http-status-codes';
import { NotFoundError, BadRequestError } from '../errors/customErrors.js';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { checkPermissions } from '../utils/tokenUtils.js';
export const createReview = async (req, res) => {
  const { product: productId } = req.body;
  const isValidProduct = await Product.findOne({ _id: productId });
  if (!isValidProduct) {
    throw new NotFoundError(`No product with id: ${productId}`);
  }
  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });
  if (alreadySubmitted) {
    throw new BadRequestError('Already submitted review for this product');
  }

  req.body.user = req.user.userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

export const getAllReviews = async (req, res) => {
  const reviews = await Review.find({})
    .populate({
      path: 'product',
      select: 'name pricePerKg image',
    })
    .populate({ path: 'user', select: 'name' });

  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};
export const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new NotFoundError(`No review with id: ${reviewId}`);
  }
  res.status(StatusCodes.OK).json({ review });
};
export const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { rating, comment, title } = req.body;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new NotFoundError(`No review with id: ${reviewId}`);
  }
  checkPermissions(req.user, review.user);
  review.rating = rating;
  review.title = title;
  review.comment = comment;
  await review.save();
  res.status(StatusCodes.OK).json({ review });
};
export const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new NotFoundError(`No review with id: ${reviewId}`);
  }
  checkPermissions(req.user, review.user);
  await Review.deleteOne();
  res.status(StatusCodes.OK).json({ msg: 'Success! review removed' });
};
export const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params;
  const reviews = await Review.find({ product: productId });
  const count = reviews.length;
  res.status(StatusCodes.OK).json({ reviews, count });
};
