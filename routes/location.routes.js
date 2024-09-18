import express from 'express';
const router = express.Router();
import {
  setLocationLessor,
  allSportCenterLocations,
  findNearestLocation,
} from './../controllers/location.controller.js';
import verifyToken from './../middleware/auth.middleware.js';

router.get('/sportcenters/destination', allSportCenterLocations);
router.get('/nearest/sportcenters', findNearestLocation);

router.use(verifyToken);
router.put('/update/coordinate', setLocationLessor);

export default router;
