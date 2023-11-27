import { Router } from 'express';
import {
  authenticateUser,
  authorizePermissions,
} from '../middleware/authentication.js';
import {
  getAllReviews,
  getSingleReview,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';

const router = Router();

router.route('/').post(authenticateUser, createReview).get(getAllReviews);
router
  .route('/:id')
  .get(getSingleReview)
  .patch(authenticateUser, updateReview)
  .delete(authenticateUser, deleteReview);

export default router;
