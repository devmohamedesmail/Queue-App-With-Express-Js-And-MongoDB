import express from 'express';
import { fetch_setting, update_settings } from '../../controllers/api/SettingApiController.js';
import multer from 'multer';
import path from 'path'
import fs from 'fs';


const router = express.Router();




// Multer setup for image uploads
// const storage = multer.diskStorage({
//     destination: './public/uploads/',
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//     }
// });

// Ensure the 'uploads' directory exists
// const uploadDirectory = './public/uploads/';
// if (!fs.existsSync(uploadDirectory)) {
//     fs.mkdirSync(uploadDirectory, { recursive: true });
// }

// const upload = multer({ storage: storage });


const storage = multer.memoryStorage(); // store file in memory buffer
const upload = multer({ storage });

// fetch setting api route
router.get('/', fetch_setting);


// update settings 
router.post('/update/settings', upload.single('logo'), update_settings );




export default router;