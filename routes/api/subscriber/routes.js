import express from 'express';
import {
    get_Users_By_PlaceId,
    add_new_user_to_place,
    delete_user_by_id_subscriber,
    toggle_deactive_user_by_id_subscriber,
    active_queue_by_employee,
    cancel_queue_by_employee,
    fetch_queues_for_place,
    fetch_queues_for_employee
} from '../../../controllers/api/subscriber_controller.js';
const router = express.Router();

/**
 * @route   GET /api/subscriber/users/:placeId
 * @desc    Get all users for a specific place
 * @access  Public
 */
router.get('/users/:placeId', get_Users_By_PlaceId)

/**
 * @route   POST /api/subscriber/add/user/:placeId
 * @desc    Add a new user to a specific place
 * @access  Public
 */
router.post('/add/user/:placeId', add_new_user_to_place)
/**
 * @route   GET /api/subscriber/delete/user/subscriber/:userId
 * @desc    Delete a subscriber user by user ID
 * @access  Public
 */
router.get('/delete/user/subscriber/:userId', delete_user_by_id_subscriber);
/**
 * @route   GET /api/subscriber/toggle/deactive/user/subscriber/:userId
 * @desc    Toggle the active/deactive status of a subscriber user by user ID
 * @access  Public
 */
router.get('/toggle/deactive/user/subscriber/:userId', toggle_deactive_user_by_id_subscriber)
/**
 * @route   GET /api/subscriber/active/queue/:queueId/:userId
 * @desc    Activate a queue for a user by employee
 * @access  Public
 */
router.get('/active/queue/:queueId/:userId', active_queue_by_employee);
/**
 * @route   GET /api/subscriber/cancel/queue/:queueId/:userId
 * @desc    Cancel a queue for a user by employee
 * @access  Public
 */
router.get('/cancel/queue/:queueId/:userId', cancel_queue_by_employee);






// fetch_queues_for_place
router.get('/fetch/queues/place/:placeId', fetch_queues_for_place);

// fetch the queues which the emplyee do it 
router.get('/fetch/queues/employee/:employeeId', fetch_queues_for_employee)

export default router;