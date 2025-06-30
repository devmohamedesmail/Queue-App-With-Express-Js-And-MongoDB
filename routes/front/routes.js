import express from 'express';
import { 
     home_page,
     show_waiting_list,
     Book_my_turn,
     redirect_to_register_page ,
     show_user_queues,
     contact_page,
     show_page_content
    } from '../../controllers/web/FrontController.js';
const router = express.Router();


router.get('' , home_page);

router.get('/register', redirect_to_register_page)

router.get('/book/queue/:placeId/:serviceId', show_waiting_list)


router.post('/book/my/turn/:place/:service?', Book_my_turn);

router.get('/show/user/queues/:userId', show_user_queues);



// redirect to contact page
router.get('/contact/page', contact_page);
// /page/content/
router.get('/page/content/:pageId/:title', show_page_content);



export default router;