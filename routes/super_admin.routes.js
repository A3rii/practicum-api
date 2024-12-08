import express from 'express';
const router = express.Router();

import {
  registerSuperAdmin,
  loginSuperAdmin,
  superAdminProfile,
  updateModerator,
} from './../controllers/super_admin.controller.js';

import { resetPassword } from './../controllers/resest_password.controller.js';
import {
  registerValidation,
  loginValidation,
} from './../middleware/authValidation.middleware.js';

import verifyToken from './../middleware/auth.middleware.js';

router.post('/register', registerValidation, registerSuperAdmin);
router.post('/login', loginValidation, loginSuperAdmin);

router.use(verifyToken);
router.put('/update', updateModerator);
router.get('/profile', superAdminProfile);
router.put('/reset-password/lessor/:lessorId', resetPassword);

export default router;
