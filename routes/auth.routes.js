import express from 'express';
const router = express.Router();

//Imporing the authvalidation functions for login and register
import {
  registerValidation,
  loginValidation,
} from './../middleware/authValidation.middleware.js';
import {
  login,
  register,
  userProfile,
  users,
} from './../controllers/auth.controller.js';

//Importing the JWT verifyer from auth middleware
import verifyToken from './../middleware/auth.middleware.js';

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', verifyToken, userProfile);
router.get('/users', users);

export default router;
