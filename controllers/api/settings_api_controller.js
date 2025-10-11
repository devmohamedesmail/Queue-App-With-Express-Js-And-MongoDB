import connectDB from "../../config/db.js";
import Setting from "../../models/Setting.js";
import { v2 as cloudinary } from 'cloudinary';


/**
 * @function fetch_setting
 * @desc    Fetch application settings from the database.
 * @param   {object} req - Express request object.
 * @param   {object} res - Express response object.
 * @returns {object} JSON response with status, settings data, and message.
 */
export const fetch_setting = async (req, res) => {
    try {
        await connectDB();
        const setting = await Setting.findOne();
        res.json({
            status: 200,
            data: setting,
            message: 'Setting fetched successfully'
        });
    } catch (error) {
        res.json({
            status: 400,
            message: "Failed Fetching Setting",
            error: error.message
        });
    }
}


/**
 * @function update_settings
 * @desc    Update application settings and upload logo if provided.
 * @param   {object} req - Express request object, expects settings fields in body and optional logo file.
 * @param   {object} res - Express response object.
 * @returns {object} JSON response with status, updated settings data, and message.
 */

export const update_settings = async (req, res) => {
    try {
        await connectDB();

        let setting = await Setting.findOne();

        if (!setting) {
            setting = new Setting();
        }

        // Update fields from req.body
        const fields = [
            'nameEn', 'nameAr', 'descriptionEn', 'descriptionAr',
            'email', 'phone', 'address', 'appUrl'
        ];

        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                setting[field] = req.body[field];
            }
        });

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

            setting.logo = uploadResult.secure_url;
        }

        // Save updated settings
        await setting.save();

        res.json({
            status: 200,
            message: 'Settings updated successfully',
            data: setting
        });

    } catch (error) {
        res.json({
            status: 400,
            message: "Failed update Setting",
            message: error.message
        });
    }
}




