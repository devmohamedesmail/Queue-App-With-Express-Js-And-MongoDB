import connectDB from "../../config/db.js";
import Service from "../../models/Service.js";
import Queue from "../../models/Queue.js";
import { logEvent } from "../../utilites/logEvent.js";
import { handleError } from "../../utilites/handleError.js";

/**
 * Fetch all services for a specific place
 * @function fetch_place_services
 * @param {object} req - Express request object, expects placeId in params
 * @param {object} res - Express response object
 * @returns {object} JSON response with status, message, and array of services
 */

export const fetch_place_services = async (req, res) => {
    try {
        const placeId = req.params.placeId;
        await connectDB();
        const services = await Service.find({ placeId: placeId });
        // await logEvent({ message: 'Fetched services for place', level: 'info', meta: { placeId } });
        res.json({
            status: 200,
            services: services,
            message: 'Services fetched successfully'
        });
    } catch (error) {
        await logEvent({ message: 'Error fetching services', level: 'error', meta: { error: error.message } });
        handleError(res, error, 400, 'Error fetching services');
    }
};

/**
 * Get the last queue entry for a specific service in a place
 * @function get_last_queue
 * @param {object} req - Express request object, expects placeId in params and optional serviceId
 * @param {object} res - Express response object
 * @returns {object} JSON response with status, message, and last queue entry object
 */
export const get_last_queue = async (req, res) => {
    try {
        const place = req.params.placeId;
        const service = req.params.serviceId || null;
        await connectDB();
        const queue = await Queue.findOne({ placeId: place, serviceId: service }).sort({ createdAt: -1 });
        // await logEvent({ message: 'Fetched last queue for service', level: 'info', meta: { place, service } });
        res.json({
            status: 200,
            queue: queue,
            message: 'Queue fetched successfully'
        });
    } catch (error) {
        await logEvent({ message: 'Error fetching queue', level: 'error', meta: { error: error.message } });
        handleError(res, error, 400, 'Error fetching queue');
    }
};