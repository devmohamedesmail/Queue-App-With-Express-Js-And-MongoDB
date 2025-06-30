import express from 'express';
import { fetch_place_services , get_last_queue } from '../../controllers/api/service_api_controller.js';

const router = express.Router();

router.get('/place/services/:placeId', fetch_place_services);
// get last queue in the service
router.get('/last/queue/:placeId/:serviceId?', get_last_queue);

export default router;