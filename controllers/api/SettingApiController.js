import connectDB from "../../config/db.js";
import Setting from "../../models/Setting.js";
import { v2 as cloudinary } from 'cloudinary';


// ***************** fetching website settings ********************
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
        res.status(500).json({ error: error.message });
    }
}


// ***************** update website settings ********************

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
        res.status(500).json({ status: 500, message: error.message });
    }
}




