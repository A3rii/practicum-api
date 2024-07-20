import express from 'express';
const router = express.Router();

import {
  registerLessor,
  loginLessor,
  lessorProfile,
  getAllLessors,
  getLessorsById,
  editLessor,
} from './../controllers/lessor.controller.js';

import {
  showFacilities,
  createFacilities,
  editFacility,
  deleteFacility,
  showFacilitiesById,
} from './../controllers/facility.controller.js';

import {
  showCourt,
  createCourt,
  editCourt,
  showCourtById,
  deleteCourt,
} from './../controllers/court.controller.js';
import verifyToken from './../middleware/auth.middleware.js';

//*  Authentication
router.post('/auth/register', registerLessor);
router.post('/auth/login', loginLessor);
router.get('/auth/users', getAllLessors);

router.get('/auth/users/:id', getLessorsById);

router.route('/facility').post(createFacilities);

router.use(verifyToken);
router.get('/auth/profile', lessorProfile);

//* Facility

router.route('/facility').get(showFacilities).post(createFacilities);
router
  .route('/facility/:id')
  .get(showFacilitiesById)
  .put(editFacility)
  .delete(deleteFacility);

//* Court

router.route('/court').get(showCourt);
router.route('/court/:id').post(createCourt);
router
  .route('/facility/:facilityId/court/:courtId')
  .get(showCourtById)
  .put(editCourt)
  .delete(deleteCourt);

router.route('/update').put(editLessor);

export default router;
