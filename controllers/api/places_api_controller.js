import connectDB from "../../config/db.js";
import Place from "../../models/Place.js";
import Service from "../../models/Service.js"
import QRCode from 'qrcode';
import { v2 as cloudinary } from 'cloudinary';
import { handleError } from "../../utilites/handleError.js";
import { logEvent } from "../../utilites/logEvent.js";

/**
 * Fetch all places with their services
 * - Uses MongoDB aggregation to join places and services
 * - Returns a list of places with their services
 */
export const fetch_places_with_services = async (req, res) => {
    try {
        await connectDB();
        const places = await Place.aggregate([
            {
                $lookup: {
                    from: "services",
                    localField: "_id",
                    foreignField: "placeId",
                    as: "services"
                }
            }
        ]);
        await logEvent({ message: 'Fetched places with services', level: 'info' });
        res.json({
            status: 200,
            data: places,
            message: 'Places retrieved successfully'
        });
    } catch (error) {
        await logEvent({ message: 'Error fetching places', level: 'error', meta: { error: error.message } });
        handleError(res, error, 404, 'Failed to fetch places');
    }
};

/**
 * Add a new place
 * - Handles image upload (Cloudinary)
 * - Parses and saves services
 * - Saves place to DB
 */
export const add_new_place = async (req, res) => {
    try {
        await connectDB();
        const newPlace = new Place();
        newPlace.nameEn = req.body.nameEn;
        newPlace.nameAr = req.body.nameAr;
        newPlace.addressEn = req.body.addressEn;
        newPlace.addressAr = req.body.addressAr;
        newPlace.description = req.body.description;
        if (req.file) {
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'places' },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
            newPlace.image = uploadResult.secure_url;
        }
        newPlace.location = {
            lat: req.body.lat,
            lng: req.body.lng
        };
        newPlace.locationlink = req.body.locationlink;
        newPlace.timeStart = req.body.timeStart;
        newPlace.timeClosed = req.body.timeClosed;
        newPlace.moveTurn = req.body.moveTurn === 'true';
        newPlace.estimateTime = req.body.estimateTime;
        // Parse daysOfWork if it's a string
        try {
            newPlace.daysOfWork = JSON.parse(req.body.daysOfWork || '[]');
        } catch (err) {
            await logEvent({ message: 'Invalid daysOfWork JSON', level: 'warn', meta: { error: err.message } });
            return res.status(400).json({ status: 400, message: 'Invalid daysOfWork JSON' });
        }
        await newPlace.save();
        // Parse and save services if provided
        let servicesArray = [];
        try {
            servicesArray = JSON.parse(req.body.services || '[]');
        } catch (err) {
            await logEvent({ message: 'Invalid services JSON', level: 'warn', meta: { error: err.message } });
            return res.status(400).json({ status: 400, message: 'Invalid services JSON' });
        }
        if (Array.isArray(servicesArray) && servicesArray.length > 0) {
            const servicesToInsert = servicesArray.map(service => ({
                placeId: newPlace._id,
                nameAr: service.titleAr,
                nameEn: service.titleEn,
                estimateTime: service.estimatedTime || 0
            }));
            await Service.insertMany(servicesToInsert);
        }
        await logEvent({ message: 'Place added successfully', level: 'info', meta: { placeId: newPlace._id } });
        res.json({
            status: 200,
            message: 'Place added successfully',
            data: newPlace
        });
    } catch (error) {
        await logEvent({ message: 'Error adding place', level: 'error', meta: { error: error.message } });
        handleError(res, error, 500, 'Internal server error');
    }
};

/**
 * Update an existing place
 * - Updates place fields and image
 * - Updates daysOfWork and services
 */
export const update_place = async (req, res) => {
    try {
        await connectDB();
        const placeId = req.params.placeId;
        const place = await Place.findById(placeId);
        if (!place) {
            await logEvent({ message: 'Update failed: place not found', level: 'warn', meta: { placeId } });
            return res.status(404).json({ status: 404, message: 'Place not found' });
        }
        // Update place fields
        place.nameEn = req.body.nameEn || place.nameEn;
        place.nameAr = req.body.nameAr || place.nameAr;
        place.addressEn = req.body.addressEn || place.addressEn;
        place.addressAr = req.body.addressAr || place.addressAr;
        place.description = req.body.description || place.description;
        if (req.file) {
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'places' },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
            place.image = uploadResult.secure_url;
        }
        place.location = {
            lat: req.body.lat || place.location.lat,
            lng: req.body.lng || place.location.lng
        };
        place.locationlink = req.body.locationlink || place.locationlink;
        place.timeStart = req.body.timeStart || place.timeStart;
        place.timeClosed = req.body.timeClosed || place.timeClosed;
        place.moveTurn = req.body.moveTurn !== undefined ? req.body.moveTurn === 'true' : place.moveTurn;
        place.estimateTime = req.body.estimateTime || place.estimateTime;
        // Update daysOfWork
        if (req.body.daysOfWork) {
            try {
                place.daysOfWork = JSON.parse(req.body.daysOfWork);
            } catch (err) {
                await logEvent({ message: 'Invalid daysOfWork JSON', level: 'warn', meta: { error: err.message } });
                return res.status(400).json({ status: 400, message: 'Invalid daysOfWork JSON' });
            }
        }
        await place.save();
        // Update services
        if (req.body.services) {
            let servicesArray = [];
            try {
                servicesArray = JSON.parse(req.body.services);
            } catch (err) {
                await logEvent({ message: 'Invalid services JSON', level: 'warn', meta: { error: err.message } });
                return res.status(400).json({ status: 400, message: 'Invalid services JSON' });
            }
            // Delete old services
            await Service.deleteMany({ placeId: place._id });
            // Add new services
            if (Array.isArray(servicesArray) && servicesArray.length > 0) {
                const servicesToInsert = servicesArray.map(service => ({
                    placeId: place._id,
                    nameAr: service.titleAr,
                    nameEn: service.titleEn,
                    estimateTime: service.estimatedTime || 0
                }));
                await Service.insertMany(servicesToInsert);
            }
        }
        await logEvent({ message: 'Place updated successfully', level: 'info', meta: { placeId: place._id } });
        res.json({
            status: 200,
            message: 'Place updated successfully',
            data: place
        });
    } catch (error) {
        await logEvent({ message: 'Error updating place', level: 'error', meta: { error: error.message } });
        handleError(res, error, 500, 'Internal server error');
    }
};

/**
 * Delete a place and its services
 * - Deletes place by ID
 * - Deletes all related services
 */
export const delete_place = async (req, res) => {
    try {
        await connectDB();
        const placeId = req.params.placeId;
        const place = await Place.findByIdAndDelete(placeId);
        await Service.deleteMany({ placeId: place._id });
        await logEvent({ message: 'Place deleted successfully', level: 'info', meta: { placeId } });
        res.json({
            status: 200,
            message: "Place Deleted Successfully"
        });
    } catch (error) {
        await logEvent({ message: 'Error deleting place', level: 'error', meta: { error: error.message } });
        handleError(res, error, 400, 'Failed to delete place');
    }
};

/**
 * Show QR code for a place
 * - Generates a QR code for the place's service URL
 */
export const show_place_qrcode = async (req, res) => {
    try {
        await connectDB();
        const placeId = req.params.placeId;
        const place = await Place.findById(placeId);
        const qrUrl = `https://queue-app-with-next-js.vercel.app/user/services/${placeId}`;
        QRCode.toDataURL(qrUrl, async (err, qrCodeDataUrl) => {
            if (err) {
                await logEvent({ message: 'Error generating QR code', level: 'error', meta: { error: err.message } });
                return res.status(500).send('Error generating QR code');
            }
            await logEvent({ message: 'QR code generated for place', level: 'info', meta: { placeId } });
            res.json({
                status: 200,
                place: place,
                qrCodeDataUrl: qrCodeDataUrl
            });
        });
    } catch (error) {
        await logEvent({ message: 'Error showing QR code', level: 'error', meta: { error: error.message } });
        handleError(res, error, 500, 'Internal server error');
    }
};
