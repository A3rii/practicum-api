import express from 'express';
const router = express.Router();

import { generateKhqrData } from '../service/khQr.js';
import {
  userPayments,
  getUserPayments,
  totalIcomeForLessor,
} from '../controllers/payment.controller.js';
import verifyToken from './../middleware/auth.middleware.js';
router.post('/', userPayments);
router.post('/generate-khqr', generateKhqrData);
router.get('/', verifyToken, getUserPayments);
router.get('/income', verifyToken, totalIcomeForLessor);

export default router;
