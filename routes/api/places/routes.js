import express from 'express';
import { fetch_places_with_services , add_new_place, update_place,show_place_qrcode, delete_place } from '../../../controllers/api/places_api_controller.js';
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage(); 
const upload = multer({ storage });

// ================== Place Routes ==================

// Fetch all places with their services
router.get('/', fetch_places_with_services);

// Add a new place (with image upload)
router.post('/add/new/place', upload.single('image'), add_new_place );

// Update an existing place (with image upload)
router.post('/update/place/:placeId', upload.single('image'), update_place);

// Delete a place by ID
router.get('/delete/place/:placeId', delete_place);

// Show QR code for a place
router.get('/show/place/qrcode/:placeId', show_place_qrcode);

export default router;