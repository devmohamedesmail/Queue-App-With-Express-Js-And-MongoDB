import express from 'express'
import { 
    fetch_pages , 
    update_page , 
    delete_page, 
    add_new_page 
} from '../../../controllers/api/pages_controller.js';
const router = express.Router();




/**
 * @route   POST /api/pages/add/new/page
 * @desc    Add a new page
 * @access  Public
 */
router.post('/add/new/page', add_new_page);

/**
 * @route   GET /api/pages/
 * @desc    Fetch all pages
 * @access  Public
 */
router.get('/', fetch_pages);

/**
 * @route   POST /api/pages/update/page/:pageId
 * @desc    Update a page by its ID
 * @access  Public
 */
router.post('/update/page/:pageId', update_page);

/**
 * @route   GET /api/pages/delete/page/:pageId
 * @desc    Delete a page by its ID
 * @access  Public
 */
router.get('/delete/page/:pageId', delete_page);




export default router