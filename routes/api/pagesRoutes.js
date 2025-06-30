import express from 'express'
import { fetch_pages , update_page , delete_page, add_new_page } from '../../controllers/api/Pages_api_controller.js';
const router = express.Router();





router.post('/add/new/page', add_new_page)
// ******** fetch all pages
router.get('/' , fetch_pages)
// edit Page
router.post('/update/page/:pageId', update_page);
// ********* delete page
router.get('/delete/page/:pageId', delete_page);



export default router