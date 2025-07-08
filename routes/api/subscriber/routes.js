import express from 'express';
// import { get_Users_By_PlaceId ,add_new_user_to_place } from '../../../controllers/api/subscriber_api_controller.js';
import { get_Users_By_PlaceId, add_new_user_to_place , delete_user_by_id_subscriber , toggle_deactive_user_by_id_subscriber , active_queue_by_employee ,cancel_queue_by_employee } from '../../../controllers/api/subscriber_controller.js';
const router = express.Router();

// // get users by place
router.get('/users/:placeId', get_Users_By_PlaceId)

// // add new user to place
router.post('/add/user/:placeId', add_new_user_to_place)



// delete_user_by_id_subscriber
router.get('/delete/user/subscriber/:userId'  , delete_user_by_id_subscriber);


// deactive_user_by_id_subscriber
router.get('/toggle/deactive/user/subscriber/:userId', toggle_deactive_user_by_id_subscriber)









////             queues 
router.get('/active/queue/:queueId/:userId' , active_queue_by_employee );

router.get('/cancel/queue/:queueId/:userId' , cancel_queue_by_employee );
export default router;