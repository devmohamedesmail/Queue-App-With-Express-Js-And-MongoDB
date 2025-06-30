
export const get_all_users_queues_today = async (req, res) => {
    try {
        await connectDB();
        const userId = req.params.userId;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
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
        const queuesData = [];
        for (let queue of userQueues) {
            const { placeId, serviceId } = queue;
            const place = await Place.findById(placeId);
            const service = await Service.findById(serviceId);
            const aheadOfYou = await Queue.countDocuments({
                placeId,
                serviceId,
                status: 'waiting',
                createdAt: { $gte: todayStart, $lte: todayEnd },
                createdAt: { $lt: queue.createdAt }
            });
            const nowServing = await Queue.findOne({
                placeId,
                serviceId,
                status: 'active',
                createdAt: { $gte: todayStart, $lte: todayEnd }
            }).sort({ queue: -1 });
            let estimatedTime;
            if (service && service.estimateTime) {
                estimatedTime = aheadOfYou * service.estimateTime;
            } else {
                estimatedTime = aheadOfYou * place.estimateTime;
            }
            queuesData.push({
                queue,
                aheadOfYou,
                nowServingQueue: nowServing ? nowServing.queue : null,
                estimatedTime
            });
        }
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






export const fetch_all_waiting_queues_in_service = async (req, res) => {
    try {
        await connectDB();
        const place = req.params.placeId;
        const service = req.params.serviceId;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const queue = await Queue.find({
            placeId: place,
            serviceId: service,
            status: 'waiting',
            createdAt: { $gte: todayStart, $lte: todayEnd }
        }).sort({ createdAt: -1 });
        await logEvent({ message: 'Fetched all waiting queues', level: 'info', meta: { place, service } });
        res.status(200).json(queue);
    } catch (error) {
        await logEvent({ message: 'Error fetching waiting queues', level: 'error', meta: { error: error.message } });
        handleError(res, error, 400, 'Failed to fetch waiting queues');
    }
};