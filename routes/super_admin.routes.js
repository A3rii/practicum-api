import express from 'express';
const router = express.Router();

import {
  registerSuperAdmin,
  loginSuperAdmin,
  superAdminProfile,
  updateModerator,
} from './../controllers/super_admin.controller.js';

import {
  registerValidation,
  loginValidation,
} from './../middleware/authValidation.middleware.js';

import verifyToken from './../middleware/auth.middleware.js';

router.post('/register', registerValidation, registerSuperAdmin);
router.post('/login', loginValidation, loginSuperAdmin);
router.put('/update', verifyToken, updateModerator);
router.get('/profile', verifyToken, superAdminProfile);

export default router;
