import express from 'express';
const router = express.Router();
import {
  moderatorLessors,
  updateLessorStatus,
} from '../controllers/lessor_moderator.controller.js';

import verifyToken from '../middleware/auth.middleware.js';

router.use(verifyToken);
router.get('/find/lessors', moderatorLessors);
router.put('/update/lessors/:lessorId', updateLessorStatus);

export default router;
