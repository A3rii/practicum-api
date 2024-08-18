import express from 'express';
const router = express.Router();
import {
  moderatorLessors,
  updateLessorStatus,
  lessorForSuperAdmin,
  deleteLessor,
  allUsers,
  totalUsersByMonth,
} from '../controllers/lessor_moderator.controller.js';

import verifyToken from '../middleware/auth.middleware.js';

router.use(verifyToken);
router
  .get('/find/lessors', moderatorLessors)
  .get('/find/lessors/ratings', lessorForSuperAdmin)
  .get('/list/users', allUsers)
  .get('/users/statistic', totalUsersByMonth);
router.put('/update/lessors/:lessorId', updateLessorStatus);
router.delete('/delete/lessors/:lessorId', deleteLessor);

export default router;
