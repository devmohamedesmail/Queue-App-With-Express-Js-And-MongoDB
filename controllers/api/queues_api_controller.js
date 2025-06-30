import connectDB from "../../config/db.js";
import Queue from "../../models/Queue.js";
import Place from "../../models/Place.js";
import Service from "../../models/Service.js";
import User from "../../models/User.js";
import { emitQueueUpdate, emitNewQueueEntry, emitQueueStatusChange } from "../../utilites/socketUtils.js";
import { handleError } from "../../utilites/handleError.js";
import { logEvent } from "../../utilites/logEvent.js";

/**
 * Book a new queue for a user in a place/service
 * - Creates a new queue entry
 * - Emits real-time updates
 * - Logs the event
 */
export const book_new_queue = async (req, res) => {
    try {
        await connectDB();
        const userId = req.params.userId;
        const placeId = req.params.placeId;
        const serviceId = req.params.serviceId || null;
        const place = await Place.findById(placeId);
        const newQueue = new Queue();
        newQueue.userId = userId;
        newQueue.placeId = placeId;
        newQueue.serviceId = serviceId;
        newQueue.place = place;
        await newQueue.save();
        // Emit real-time update for new queue entry
        const io = req.app.get('io');
        if (io) {
            const roomId = `place_${placeId}_service_${serviceId}`;
            emitNewQueueEntry(io, roomId, {
                queue: newQueue,
                message: 'New user joined the queue'
            });
            emitQueueUpdate(io, `place_${placeId}`, {
                type: 'new_entry',
                serviceId,
                queue: newQueue
            });
        }
        await logEvent({ user: userId, message: 'Booked new queue', level: 'info', meta: { placeId, serviceId } });
        res.status(201).json(newQueue);
    } catch (error) {
        await logEvent({ message: 'Error booking new queue', level: 'error', meta: { error: error.message } });
        handleError(res, error, 400, 'Failed to book new queue');
    }
};

/**
 * Fetch all waiting queues in a service/place for today
 */
// export const fetch_all_waiting_queues_in_service = async (req, res) => {
//     try {
//         await connectDB();
//         const place = req.params.placeId;
//         const service = req.params.serviceId;
//         const todayStart = new Date();
//         todayStart.setHours(0, 0, 0, 0);
//         const todayEnd = new Date();
//         todayEnd.setHours(23, 59, 59, 999);
//         const queue = await Queue.find({
//             placeId: place,
//             serviceId: service,
//             status: 'waiting',
//             createdAt: { $gte: todayStart, $lte: todayEnd }
//         }).sort({ createdAt: -1 });
//         await logEvent({ message: 'Fetched all waiting queues', level: 'info', meta: { place, service } });
//         res.status(200).json(queue);
//     } catch (error) {
//         await logEvent({ message: 'Error fetching waiting queues', level: 'error', meta: { error: error.message } });
//         handleError(res, error, 400, 'Failed to fetch waiting queues');
//     }
// };




/**
 * Fetch all waiting queues in a service/place for today,
 * and calculate estimated time for the last waiting queue.
 * - If serviceId is provided, use service.estimateTime
 * - If not, use place.estimateTime
 * - estimatedTime = waitingQueue.length * estimateTime
 * - Also return the last waiting queue (if any)
 */
export const fetch_all_waiting_queues_in_service = async (req, res) => {
    try {
        await connectDB();
        const placeId = req.params.placeId;
        const serviceId = req.params.serviceId || null;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // Find all waiting queues for today
        const waitingQueues = await Queue.find({
            placeId: placeId,
            serviceId: serviceId,
            status: 'waiting',
            createdAt: { $gte: todayStart, $lte: todayEnd }
        }).sort({ createdAt: -1 });

        // Get estimateTime from service or place
        let estimateTime = 0;
        if (serviceId) {
            const service = await Service.findById(serviceId);
            if (service && service.estimateTime) {
                estimateTime = service.estimateTime;
            }
        }
        if (!estimateTime) {
            const place = await Place.findById(placeId);
            if (place && place.estimateTime) {
                estimateTime = place.estimateTime;
            }
        }

        // Calculate estimated time for the last waiting queue
        let estimatedTime = 0;
        if (waitingQueues.length > 0) {
            if (serviceId && estimateTime) {
                // If service exists and has estimateTime, use it
                estimatedTime = waitingQueues.length * estimateTime;
            } else if (!serviceId && estimateTime) {
                // If no service, use place estimateTime
                estimatedTime = waitingQueues.length * estimateTime;
            }
        }
        const estimatedTimeStr = `${Math.floor(estimatedTime / 60)}h ${estimatedTime % 60}m`;
        // Get the last waiting queue (if any)
        const lastWaitingQueue = waitingQueues.length > 0 ? waitingQueues[0].queue : null;

        await logEvent({
            message: 'Fetched all waiting queues with estimated time',
            level: 'info',
            meta: { placeId, serviceId, estimatedTime }
        });

        res.json({
            message: 'Fetched all waiting queues with estimated time',
            status: 200,
            waitingQueues,
            estimatedTime,
            estimatedTimeStr,
            lastWaitingQueue
        });
    } catch (error) {
        await logEvent({ message: 'Error fetching waiting queues', level: 'error', meta: { error: error.message } });
        handleError(res, error, 400, 'Failed to fetch waiting queues');
    }
};


/**
 * Get the first active queue in a service/place
 */
export const get_first_active_queue_in_service = async (req, res) => {
    try {
        await connectDB();
        const placeId = req.params.placeId;
        const serviceId = req.params.serviceId || null;
        // Get today's date range
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        // Find the first active queue for today
        const queue = await Queue.findOne({
            placeId: placeId,
            serviceId: serviceId,
            status: 'active',
            createdAt: { $gte: todayStart, $lte: todayEnd }
        }).sort({ createdAt: 1 });
        await logEvent({ message: 'Fetched first active queue for today', level: 'info', meta: { placeId, serviceId } });
        res.status(200).json(queue);
    } catch (error) {
        await logEvent({ message: 'Error fetching first active queue for today', level: 'error', meta: { error: error.message } });
        handleError(res, error, 400, 'Failed to fetch first active queue for today');
    }
};


/**
 * Get all user queues for today
 */
export const get_all_users_queues_today = async (req, res) => {
    try {
        await connectDB();
        const userId = req.params.userId;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // Find all waiting queues for the user today
        const userQueues = await Queue.find({
            userId: userId,
            status: 'waiting',
            createdAt: { $gte: todayStart, $lte: todayEnd }
        }).sort({ createdAt: 1 });

        if (userQueues.length === 0) {
            await logEvent({ user: userId, message: 'No queues found for user today', level: 'info' });
            return res.status(200).json({
                status: 200,
                message: "No queues found for this user today",
                queues: [],
            });
        }

        // Prepare queue data in parallel for performance
        const queuesData = await Promise.all(userQueues.map(async (queue) => {
            const { placeId, serviceId, createdAt } = queue;

            // Fetch place and service in parallel
            const [place, service] = await Promise.all([
                Place.findById(placeId),
                Service.findById(serviceId)
            ]);

            // Count how many are ahead in the queue
            const aheadOfYou = await Queue.countDocuments({
                placeId,
                serviceId,
                status: 'waiting',
                createdAt: { $gte: todayStart, $lte: todayEnd, $lt: createdAt }
            });

            // Find the currently served queue
            const nowServing = await Queue.findOne({
                placeId,
                serviceId,
                status: 'active',
                createdAt: { $gte: todayStart, $lte: todayEnd }
            }).sort({ queue: -1 });

            // Estimate time
            let estimatedTime = null;
            if (service && service.estimateTime) {
                estimatedTime = aheadOfYou * service.estimateTime;
            } else if (place && place.estimateTime) {
                estimatedTime = aheadOfYou * place.estimateTime;
            }

            return {
                queue,
                aheadOfYou,
                nowServingQueue: nowServing ? nowServing.queue : null,
                estimatedTime,
                place: place ? { id: place._id, nameEn: place.nameEn, nameAr: place.nameAr } : null,
                service: service ? { id: service._id, nameEn: service.nameEn, nameAr: service.nameAr } : null
            };
        }));

        await logEvent({ user: userId, message: 'Fetched all user queues for today', level: 'info' });
        res.status(200).json({
            status: 200,
            message: "Queues retrieved successfully",
            queues: queuesData
        });
    } catch (error) {
        await logEvent({ message: 'Error fetching user queues for today', level: 'error', meta: { error: error.message } });
        handleError(res, error, 500, 'An error occurred while retrieving the user\'s queues');
    }
};



/**
 * Cancel a queue
 * - Updates queue status to cancelled
 * - Emits real-time updates
 */
export const cancel_queue = async (req, res) => {
    try {
        await connectDB();
        const queueId = req.params.queueId;
        const queue = await Queue.findById(queueId);
        queue.status = 'cancelled';
        await queue.save();
        // Emit real-time update for queue cancellation
        const io = req.app.get('io');
        if (io) {
            const roomId = `place_${queue.placeId}_service_${queue.serviceId}`;
            emitQueueStatusChange(io, roomId, {
                queueId: queue._id,
                status: 'cancelled',
                message: 'Queue has been cancelled'
            });

            emitQueueStatusChange(io, `user_${queue.userId}`, {
                queueId: queue._id,
                status: 'cancelled',
                message: 'Your queue has been cancelled'
            });

        }
        await logEvent({ user: queue.userId, message: 'Queue cancelled', level: 'info', meta: { queueId: queue._id } });
        res.status(200).json(queue);
    } catch (error) {
        await logEvent({ message: 'Error cancelling queue', level: 'error', meta: { error: error.message } });
        handleError(res, error, 400, 'Failed to cancel queue');
    }
};



/**
 * Move a queue to the back
 * - Cancels old queue, creates new one
 * - Emits real-time updates
 */
export const move_queue_to_back = async (req, res) => {
    try {
        await connectDB();
        const { queueId } = req.params;
        const old_queue = await Queue.findById(queueId);
        if (!old_queue) {
            await logEvent({ message: 'Move to back failed: queue not found', level: 'warn', meta: { queueId } });
            return res.status(404).json({ message: " Queue Not Found " });
        }
        old_queue.status = "cancelled";
        await old_queue.save();
        const new_queue = new Queue();
        new_queue.userId = old_queue.userId;
        new_queue.placeId = old_queue.placeId;
        if (old_queue.serviceId) {
            new_queue.serviceId = old_queue.serviceId;
        }
        new_queue.place = old_queue.place;
        await new_queue.save();
        // Emit real-time updates for queue movement
        const io = req.app.get('io');
        if (io) {
            const roomId = `place_${old_queue.placeId}_service_${old_queue.serviceId}`;
            emitQueueStatusChange(io, roomId, {
                queueId: old_queue._id,
                status: 'cancelled',
                message: 'Queue moved to back'
            });
            emitNewQueueEntry(io, roomId, {
                queue: new_queue,
                message: 'Queue moved to back of line'
            });
            emitQueueStatusChange(io, `user_${old_queue.userId}`, {
                oldQueueId: old_queue._id,
                newQueueId: new_queue._id,
                status: 'moved_to_back',
                message: 'Your queue has been moved to the back'
            });
        }
        await logEvent({ user: old_queue.userId, message: 'Queue moved to back', level: 'info', meta: { oldQueueId: old_queue._id, newQueueId: new_queue._id } });
        res.json({
            status: 200,
            message: "Queue Moved Successfully",
            queue: new_queue
        });
    } catch (error) {
        await logEvent({ message: 'Error moving queue to back', level: 'error', meta: { error: error.message } });
        handleError(res, error, 400, 'Failed to move queue to back');
    }
};


/**
 * Get all queues of the user for history
 */
export const get_all_user_queues_history = async (req, res) => {
    try {
        await connectDB();
        const userId = req.params.userId;
        const queues = await Queue.find({ userId: userId }).sort({ createdAt: -1 });
        await logEvent({ userId, message: 'Fetched user queue history', level: 'info' });
        res.json({
            status: 200,
            message: "User queue history retrieved successfully",
            queues: queues
        });
    } catch (error) {
        await logEvent({ message: 'Error fetching user queue history', level: 'error', meta: { error: error.message } });
        handleError(res, error, 400, 'Failed to fetch user queue history');
    }
};



















/**
 * Activate a queue for a subscriber
 * - Sets queue status to active
 * - Emits real-time updates
 */
export const subscriber_active_queue = async (req, res) => {
    try {
        await connectDB();
        const queueId = req.params.queueId;
        const userId = req.params.userId;
        const queue = await Queue.findById(queueId);
        if (!queue) {
            await logEvent({ message: 'Activate queue failed: queue not found', level: 'warn', meta: { queueId } });
            return res.status(404).json({ message: "Queue not found" });
        }
        const employee = await User.findById(userId);
        queue.status = "active";
        queue.employee = employee;
        const queue_updated = await queue.save();
        // Emit real-time update for queue activation
        const io = req.app.get('io');
        if (io) {
            const roomId = `place_${queue.placeId}_service_${queue.serviceId}`;
            emitQueueStatusChange(io, roomId, {
                queueId: queue._id,
                status: 'active',
                employee: employee,
                message: 'Queue is now being served'
            });
            emitQueueStatusChange(io, `user_${queue.userId}`, {
                queueId: queue._id,
                status: 'active',
                employee: employee,
                message: 'Your turn! Please proceed to the service counter'
            });
            emitQueueUpdate(io, roomId, {
                type: 'position_update',
                message: 'Queue positions updated'
            });
        }
        await logEvent({ user: queue.userId, message: 'Queue activated for subscriber', level: 'info', meta: { queueId: queue._id } });
        res.json({
            status: 200,
            data: queue_updated,
        });
    } catch (error) {
        await logEvent({ message: 'Error activating queue for subscriber', level: 'error', meta: { error: error.message } });
        handleError(res, error, 400, 'Failed to activate queue');
    }
};









