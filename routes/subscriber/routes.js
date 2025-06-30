import express from 'express';
import QRCode from 'qrcode';
import Place from '../../models/Place.js';
import {
    redirect_to_index,
    redirect_to_statistics,
    redirect_to_users,
    create_new_user_for_place,
    redirect_to_setting,
    redirect_to_queues,
    edit_place_info,
    edit_service,
    delete_service,
    add_new_service,
    redirect_to_service_queues,
    subscriber_delete_user,
    subscriber_edit_user,
    change_queue_to_active
} from '../../controllers/Subscriber/SubscriberController.js';
import connectDB from '../../config/db.js';
import multer from 'multer';
import path from 'path'
import fs from 'fs';


// multer
// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Ensure the 'uploads' directory exists
const uploadDirectory = './public/uploads/';
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

const upload = multer({ storage: storage });






const router = express.Router();




// redirect to subscriber page
router.get('/index', redirect_to_index);

// show statistics page
router.get('/statistics/:id', redirect_to_statistics);


// show users page
router.get('/users/:placeId', redirect_to_users);


// create new user for place 
router.post('/create/new/user/:placeId', create_new_user_for_place);


// **********************************************************************************
// *********************************** Setting Routes ********************************
// **********************************************************************************


// redirect to setting page
router.get('/setting/:placeId', redirect_to_setting);

// edit place Setting
router.post('/edit/place/:placeId', upload.single('image'), edit_place_info);

// /edit/service/
router.post('/edit/service/:place/:service', edit_service);

// /delete/service
router.get('/delete/service/:place/:service', delete_service);

// add Service
router.post('/add/service/:PlaceId', add_new_service)



// **********************************************************************************
// *********************************** Setting Routes ********************************
// **********************************************************************************









// **********************************************************************************
// *********************************** Queues Routes ********************************
// **********************************************************************************

// redirect to queues page
router.get('/queues/:placeId', redirect_to_queues);

// show service queues
router.get('/service/queues/:placeId/:serviceId', redirect_to_service_queues);
// change queue to active
router.get('/change/queue/to/active/:queueId', change_queue_to_active)


// show qr code page
router.get('/show/qr/code/:placeId', async (req, res) => {
    await connectDB();
    const placeId = req.params.placeId;
    const place = await Place.findById(placeId);
    
    // Generate the QR code URL (you can adjust the URL based on where you want to redirect)
    const qrUrl = `${req.protocol}://${req.get('host')}/front/fetch/place/service/${placeId}`;

    // Generate QR code
    QRCode.toDataURL(qrUrl, (err, qrCodeDataUrl) => {
        if (err) {
            return res.status(500).send('Error generating QR code');
        }

        // Pass the QR code data URL to the view
        res.render('subscriber/qr', {
            title: "Show QR Code",
            layout: "layouts/main",
            place: place,
            qrCodeDataUrl: qrCodeDataUrl
        });
    });
});

// **********************************************************************************
// *********************************** Queues Routes ********************************
// **********************************************************************************









// **********************************************************************************
// *********************************** users  Routes Start ********************************
// **********************************************************************************



router.post('/create/new/user/:placeId', create_new_user_for_place);
router.get('/delete/user/:placeId/:userId' , subscriber_delete_user);
router.post('/edit/user/:placeId/:userId' , subscriber_edit_user);




// **********************************************************************************
// *********************************** users  Routes End ********************************
// **********************************************************************************

















export default router;