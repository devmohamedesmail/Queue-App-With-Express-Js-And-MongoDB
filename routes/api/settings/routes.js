import express from 'express';
import { fetch_setting, update_settings } from '../../../controllers/api/settings_api_controller.js';
import multer from 'multer';
import path from 'path'
import fs from 'fs';


const router = express.Router();


const storage = multer.memoryStorage(); // store file in memory buffer
const upload = multer({ storage });

/**
 * @route   GET /api/settings/
 * @desc    Fetch application settings
 * @access  Public
 */
router.get('/', fetch_setting);



/**
 * @route   POST /api/settings/update/settings
 * @desc    Update application settings (supports logo upload)
 * @access  Public
 */
router.post('/update/settings', upload.single('logo'), update_settings );




export default router;