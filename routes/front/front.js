import express from 'express';
import { fetch_place_service_for_user, redirect_login_page } from '../../controllers/web/FrontController.js';

const router = express.Router();


// redirect to login page
router.get('/login/page', redirect_login_page )


// 
router.get('/fetch/place/service/:placeId', fetch_place_service_for_user)




export default router;