
import { Router } from 'express';
import {authenticateUser, authorizePermissions} from '../middleware/authentication.js'
import  {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} from "../controllers/userController.js";

const router = Router();

router.use(authenticateUser);
router
  .route("/")
  .get(authorizePermissions("admin"), getAllUsers);
router.route("/profile").get(showCurrentUser);
router.route("/updateUser").patch(updateUser);
router.route("/updateUserPassword").post(updateUserPassword);
router.route("/:id").get(getSingleUser);

export default router;
