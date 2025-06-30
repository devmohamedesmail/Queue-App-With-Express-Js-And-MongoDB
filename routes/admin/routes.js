import express from 'express';
import {
    dashboard_index, dashboard_places,
    dashboard_users,
    dashboard_setting,
    add_new_place, edit_place_page,
    edit_place_confirm, 
    delete_place, 
    addNewService, 
    delete_service,
    edit_service,
    update_setting,
    edit_user,
    help_page,
    reply_help,
    create_new_page,
    store_page_content,
    show_pages,
    edit_page,
    update_page_confirm,
    delete_page
    } from '../../controllers/web/AdminController.js';
import { protect } from '../../middlewares/authMiddleware.js';
const router = express.Router();

import multer from 'multer';
import path from 'path'
import fs from 'fs';




// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Ensure the 'uploads' directory exists
const uploadDirectory = './public/uploads/';
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

const upload = multer({ storage: storage });





// ************************************************** Dashboard Routes ******************************************
// GET /dashboard/index
router.get('/index', dashboard_index)
// GET /dashboard/place
router.get('/places', dashboard_places)
// GET /dashboard/users
router.get('/users', protect, dashboard_users)
// GET /dashboard/setting
router.get('/setting', protect, dashboard_setting)
// GET /dashboard/setting







// ************************************************** Places Routes ******************************************

//************************* Add new Place *********************************
router.post('/add/new/place', upload.single('image'), add_new_place)
//************************* redirect Edit page *************************
router.get('/edit/place/:id', edit_place_page)
// ************************* Edit Place confimation *************************
router.post('/edit/place/confirm/:id', upload.single('image'), edit_place_confirm)
// ************************* Delete Place *************************
router.get('/delete/place/:id', delete_place)




// ************************************************* Services Routes *****************************************
// Add New Service
router.post('/add/new/service/:id', addNewService)
// Update Service
router.post('/edit/service/:place/:service', edit_service)
// Delete Existing Service
router.get('/delete/service/:place/:service', delete_service)




// ************************************************** Setting Routes ******************************************
router.post('/update',upload.single('image') ,update_setting);



// ************************************************** Edit users Routes ******************************************
router.post('/edit/user/:id', edit_user)






// ***********************************************************************************************************
// **************************************************** Help Routes ******************************************
// ***********************************************************************************************************
router.get('/help', help_page);

// reply help
router.post('/reply/help/:helpId', reply_help);




// ***********************************************************************************************************
// ************************************************** Create New Page ****************************************
// ***********************************************************************************************************
// redirect to create page
router.get('/create/page', create_new_page);
// store page content
router.post('/store/page/content', store_page_content);
// /show/pages
router.get('/show/pages', show_pages);

// /edit/page/
router.get('/edit/page/:pageId', edit_page);


// /update/page/content/confirm/
router.post('/update/page/content/confirm/:pageId', update_page_confirm);

///delete/page/
router.get('/delete/page/:pageId',delete_page);








export default router;
