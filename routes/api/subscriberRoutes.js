import express from 'express';
import { get_Users_By_PlaceId ,add_new_user_to_place } from '../../controllers/api/Subscriber_api_controller.js';
const router = express.Router();

// get users by place
router.get('/users/:placeId', get_Users_By_PlaceId)

// add new user to place
router.post('/add/user/:placeId', add_new_user_to_place)





export default router;