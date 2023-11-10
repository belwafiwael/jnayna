import { Router } from 'express';
import {
  authenticateUser,
  authorizePermissions,
} from '../middleware/authentication.js';
import {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} from '../controllers/productController.js';

const router = Router();
router
  .route('/')
  .post([authenticateUser, authorizePermissions('admin')], createProduct)
  .get(getAllProducts);

router
  .route('/uploadImage')
  .post([authenticateUser, authorizePermissions('admin')], uploadImage);
router
  .route('/:id')
  .get(getSingleProduct)
  .patch([authenticateUser, authorizePermissions('admin')], updateProduct)
  .delete([authenticateUser, authorizePermissions('admin')], deleteProduct);

export default router;
