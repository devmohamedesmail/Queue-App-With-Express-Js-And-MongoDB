import express from 'express';
import { fetch_place_services, get_last_queue } from '../../../controllers/api/service_api_controller.js';

const router = express.Router();

/**
 * @route   GET /api/services/place/services/:placeId
 * @desc    Fetch all services for a specific place
 * @access  Public
 */
router.get('/place/services/:placeId', fetch_place_services);


/**
 * @route   GET /api/services/last/queue/:placeId/:serviceId?
 * @desc    Get the last queue entry for a service in a place (serviceId is optional)
 * @access  Public
 */
router.get('/last/queue/:placeId/:serviceId?', get_last_queue);

export default router;