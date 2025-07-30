import express from 'express';
import { book_new_queue,cancel_queue, fetch_all_waiting_queues_in_service, get_all_users_queues_today, get_first_active_queue_in_service,  
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

// book a new queue for the user

router.post('/book/new/queue/:userId/:placeId/:serviceId?', socketMiddleware, book_new_queue);
// cancel queue
router.get('/cancel/queue/:queueId', socketMiddleware, cancel_queue);
// move my queue to back 
router.get('/move/queue/:queueId', socketMiddleware, move_queue_to_back);

// get all queue in the service and place
router.get('/all/queue/:placeId/:serviceId?', fetch_all_waiting_queues_in_service);
// get first active queue in the service
router.get('/first/active/queue/:placeId/:serviceId?', get_first_active_queue_in_service);
// get all user queues according day
router.get('/user/queues/:userId', get_all_users_queues_today);

// get all queues of the user for history
router.get('/user/queues/history/:userId', get_all_user_queues_history);
// change the queue to active
router.get('/active/queue/:queueId/:userId', socketMiddleware, subscriber_active_queue );













export default router;