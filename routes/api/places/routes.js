import express from 'express';
import { 
    fetch_places_with_services, 
    add_new_place, 
    update_place, 
    show_place_qrcode, 
    delete_place 
} from '../../../controllers/api/places_api_controller.js';
import multer from 'multer';
import { authenticateToken } from '../../../middlewares/authMiddleware.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ================== Place Routes ==================

/**
 * @route   GET /api/places/
 * @desc    Fetch all places with their services
 * @access  Protected
 */
router.get('/', fetch_places_with_services);

/**
 * @route   POST /api/places/add/new/place
 * @desc    Add a new place (with image upload)
 * @access  Public
 */
router.post('/add/new/place',authenticateToken, upload.single('image'), add_new_place);

/**
 * @route   POST /api/places/update/place/:placeId
 * @desc    Update an existing place (with image upload)
 * @access  Public
 */
router.post('/update/place/:placeId',authenticateToken, upload.single('image'), update_place);

/**
 * @route   GET /api/places/delete/place/:placeId
 * @desc    Delete a place by ID
 * @access  Public
 */
router.get('/delete/place/:placeId',authenticateToken, delete_place);

/**
 * @route   GET /api/places/show/place/qrcode/:placeId
 * @desc    Show QR code for a place
 * @access  Public
 */
router.get('/show/place/qrcode/:placeId', show_place_qrcode);

export default router;