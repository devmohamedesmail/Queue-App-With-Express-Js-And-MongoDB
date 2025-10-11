import express from 'express';
import { 
    book_new_queue,
    cancel_queue, 
    fetch_all_waiting_queues_in_service, 
    get_all_users_queues_today, 
    get_first_active_queue_in_service,  
    move_queue_to_back,
    get_all_user_queues_history,
    subscriber_active_queue

 } from '../../../controllers/api/queues_api_controller.js';
import { socketMiddleware } from '../../../middlewares/socketMiddleware.js';
const router = express.Router();


/* * Queue Routes
 * - Book a new queue
 * - Get all queues in a service
 * - Get last queue in a service
 * - Get first active queue in a service
 * - Cancel a queue
 * - Change queue to active
 * - Move my queue to back
 * - Get all user queues for today
 * - Get all user queues history
 */




/**
 * @route   POST /api/queues/book/new/queue/:userId/:placeId/:serviceId?
 * @desc    Book a new queue for a user at a place and service (serviceId optional)
 * @access  Public
 */
router.post('/book/new/queue/:userId/:placeId/:serviceId?', socketMiddleware, book_new_queue);

/**
 * @route   GET /api/queues/cancel/queue/:queueId
 * @desc    Cancel a queue by its ID
 * @access  Public
 */
router.get('/cancel/queue/:queueId', socketMiddleware, cancel_queue);

/**
 * @route   GET /api/queues/move/queue/:queueId
 * @desc    Move a user's queue to the back of the line
 * @access  Public
 */
router.get('/move/queue/:queueId', socketMiddleware, move_queue_to_back);


/**
 * @route   GET /api/queues/all/queue/:placeId/:serviceId?
 * @desc    Fetch all waiting queues for a specific place and service (serviceId optional)
 * @access  Public
 */
router.get('/all/queue/:placeId/:serviceId?', fetch_all_waiting_queues_in_service);



/**
 * @route   GET /api/queues/first/active/queue/:placeId/:serviceId?
 * @desc    Get the first active queue in a specific place and service (serviceId optional)
 * @access  Public
 */
router.get('/first/active/queue/:placeId/:serviceId?', get_first_active_queue_in_service);


/**
 * @route   GET /api/queues/user/queues/:userId
 * @desc    Get all queues for a user for today
 * @access  Public
 */
router.get('/user/queues/:userId', get_all_users_queues_today);

/**
 * @route   GET /api/queues/user/queues/history/:userId
 * @desc    Get all historical queues for a user
 * @access  Public
 */
router.get('/user/queues/history/:userId', get_all_user_queues_history);



/**
 * @route   GET /api/queues/active/queue/:queueId/:userId
 * @desc    Change the queue status to active for a user
 * @access  Public
 */
router.get('/active/queue/:queueId/:userId', socketMiddleware, subscriber_active_queue );













export default router;