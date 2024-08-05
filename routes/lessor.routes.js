import express from 'express';
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
  showCourtsByFacility,
} from './../controllers/court.controller.js';
import verifyToken from './../middleware/auth.middleware.js';
import checkingAdminRole from './../middleware/checkRole.middleware.js';

const router = express.Router();

//*  Authentication
router.post('/auth/register', registerLessor);
router.post('/auth/login', loginLessor);
router.get('/auth/informations', getAllLessors); // for user's view

router.get('/auth/informations/:id', getLessorsById);

router.use(verifyToken);

//* Lessor Profile
router.get('/auth/profile', checkingAdminRole, lessorProfile);
router.route('/update').put(checkingAdminRole, editLessor);

//* Facility
router
  .route('/facility')
  .get(checkingAdminRole, showFacilities)
  .post(checkingAdminRole, createFacilities);
router
  .route('/facility/:id')
  .get(checkingAdminRole, showFacilitiesById)
  .put(checkingAdminRole, editFacility)
  .delete(checkingAdminRole, deleteFacility);

//* Court

router.route('/court').get(checkingAdminRole, showCourt);
router.route('/court/:id').post(checkingAdminRole, createCourt);
router
  .route('/facility/:facilityId/court/:courtId')
  .get(showCourtById)
  .put(editCourt)
  .delete(deleteCourt);

router.route('/facility/:facilityId/courts').get(showCourtsByFacility);

export default router;
