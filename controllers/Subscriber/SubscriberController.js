import connectDB from "../../config/db.js";
import Place from "../../models/Place.js";
import Queue from "../../models/Queue.js";
import User from "../../models/User.js";
import bcrypt from "bcryptjs";

import Service from '../../models/Service.js';


import multer from 'multer';
import path from 'path'
import fs from 'fs';




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






export const redirect_to_index = async (req, res) => {
    try {
        await connectDB();
        const user = req.session.user;
        const place = await Place.findById(user.placeId);

        res.render('subscriber/index', {
            layout: "layouts/subscriber",
            title: "Subscriber",
            user: user,
            place: place
        });
    } catch (error) {
        res.render('error', {
            layout: "layouts/subscriber",
            title: "Error",
            message: error.message,
        });
    }
}





export const redirect_to_statistics = async (req, res) => {
    const user = req.session.user;
    const placeId = req.params.id;

    try {
        await connectDB()
        const queues = await Queue.find({ placeId });
        const place = await Place.findById(user.placeId);
        res.render('subscriber/statistics', {
            layout: "layouts/subscriber",
            title: "Subscriber Statistics",
            user,
            queues,
            place

        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
}



// ******************************** users section start ********************************
export const redirect_to_users = async (req, res) => {

    try {

        const user = req.session.user;
        const placeId = req.params.placeId;
        await connectDB()
        const users = await User.find({ place: placeId });
        const place = await Place.findById(user.placeId);
        const services = await Service.find({ placeId: placeId });
        res.render('subscriber/users', {
            layout: "layouts/subscriber",
            title: "Subscriber Users",
            users: users,
            user: user,
            place: place,
            services: services
        });
    } catch (error) {
        res.render('404', {
            layout: "layouts/main",
            title: "Error",
            message: error.message,
        });
    }
}

export const create_new_user_for_place = async (req, res) => {




    const { name, email, password, serviceId } = req.body;
    const user = req.session.user;
    const placeId = req.params.placeId;

    try {
        await connectDB()
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const service = await Service.findById(serviceId);
        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword,
            role: 'employee',
            place: placeId,
            serviceId: serviceId,
            service: service,
        });

        await newUser.save();

        res.redirect(`/subscriber/users/${placeId}`);

    } catch (error) {

        res.render('404', {
            layout: "layouts/main",
            title: "Error",
            message: error.message,
        });
    }
}



// delete user
export const subscriber_delete_user = async (req, res) => {
    try {
        await connectDB();
        const userId = req.params.userId;
        const placeId = req.params.placeId;
        await User.findByIdAndDelete(userId);
        res.redirect(`/subscriber/users/${placeId}`);
    } catch (error) {
        console.log(error)
    }
}

export const subscriber_edit_user = async (req, res) => {
    const { name, email, serviceId } = req.body;
    const user = req.session.user;
    const placeId = req.params.placeId;
    const userId = req.params.userId;

    try {
        await connectDB()

        const service = await Service.findById(serviceId);
        const updatedData = {
            name,
            email,
            role: 'employee',
            place: placeId,
            serviceId,
            service
        }

        await User.findByIdAndUpdate(userId, updatedData);

        res.redirect(`/subscriber/users/${placeId}`);

    } catch (error) {
        console.log(error)
        res.render('404', {
            layout: "layouts/main",
            title: "Error",
            message: error.message,
        });
    }
}

// ******************************* Setting Section start **********************************

export const redirect_to_setting = async (req, res) => {
    try {


        await connectDB()
        const placeId = req.params.placeId;
        const place = await Place.findById(placeId);
        const services = await Service.find({ placeId: placeId });

        res.render('subscriber/setting', {
            layout: "layouts/subscriber",
            title: "Subscriber Setting",
            place: place,
            services: services
        });
    } catch (error) {
        res.render('404', {
            layout: "layouts/subscriber",
            title: "Error",
            message: error.message,
        });
    }
}


// update place info
export const edit_place_info = async (req, res) => {
    try {
        await connectDB();
        const placeId = req.params.placeId;
        const place = await Place.findById(placeId);
        place.nameEn = req.body.nameEn;
        place.nameAr = req.body.nameAr;
        place.addressEn = req.body.addressEn;
        place.addressAr = req.body.addressAr;
        place.description = req.body.description;
        if (req.file) {
            place.image = req.file.filename;
        }
        place.location = {
            lat: req.body.lat,
            lng: req.body.lng
        }

        place.timeStart = req.body.timeStart;
        place.timeClosed = req.body.timeClosed;
        place.daysOfWork = req.body.daysOfWork || [];
        place.moveTurn = Boolean(req.body.moveTurn);
        place.locationlink = req.body.locationlink;
        place.estimateTime = req.body.estimateTime;

        await place.save();

        res.redirect(`/subscriber/setting/${placeId}`);

    } catch (error) {
        console.log(error);
        res.status(500).render('404', {
            layout: "layouts/main",
            title: "Error",
            message: error.message,
        });
    }
}


// edit place service 
export const edit_service = async (req, res) => {
    try {
        await connectDB();

        const placeId = req.params.place;
        const serviceId = req.params.service;

        const place = await Place.findById(placeId)
        const service = await Service.findById(serviceId)

        service.nameAr = req.body.nameAr;
        service.nameEn = req.body.nameEn;
        service.estimateTime = req.body.estimateTime;
        await service.save();
        res.redirect(`/subscriber/setting/${placeId}`);
    } catch (error) {
        res.render('404', {
            layout: "layouts/subscriber",
            title: "Error",
            message: error.message,
        })
    }
}



// Delete place service
export const delete_service = async (req, res) => {
    try {
        const place = req.params.place;
        const serviceId = req.params.service;
        await connectDB();
        await Service.findByIdAndDelete(serviceId)
        // res.redirect(`/places/places`)
        res.redirect(`/subscriber/setting/${place}`);
    } catch (error) {
        console.log(error)
    }
}


// add new service for place
export const add_new_service = async (req, res) => {
    try {
        await connectDB();
        const placeId = req.params.PlaceId;

        const newService = new Service()
        newService.placeId = placeId;
        newService.nameAr = req.body.nameAr;
        newService.nameEn = req.body.nameEn;
        newService.estimateTime = req.body.estimateTime;
        await newService.save();


        res.redirect(`/subscriber/setting/${placeId}`);
    } catch (error) {
        console.log(error)
    }
}
// ******************************* Setting Section End **********************************




























// **************************************************************************************
// ******************************* Queues Section start **********************************
// **************************************************************************************



// ********** redirect to queues page
export const redirect_to_queues = async (req, res) => {
    try {
        await connectDB()
        const placeId = req.params.placeId;
        const services = await Service.find({ placeId: placeId });
        const place = await Place.findById(placeId);


        if (services.length > 0) {
            return res.render("subscriber/services", {
                layout: "layouts/subscriber",
                title: "Subscriber Queues",
                placeId: placeId,
                services: services,
                place: place
            });
        } else {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            const queues = await Queue.find({
                placeId: placeId,
                createdAt: { $gte: startOfDay, $lte: endOfDay }

            });
            res.render('subscriber/queues', {
                layout: "layouts/subscriber",
                title: "Subscriber Queues",
                queues: queues,
                place: place
            });
        }
    } catch (error) {

        res.status(500).render('404', {
            layout: "layouts/main",
            title: "Error",
            message: error.message,
        });
    }
}



// ******** fetch service Queues 

export const redirect_to_service_queues = async (req, res) => {
    try {
        await connectDB();
        const placeId = req.params.placeId;
        const serviceId = req.params.serviceId;

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const place = await Place.findById(placeId);
        const queues = await Queue.find({
            placeId: placeId,
            serviceId: serviceId,
            status: "waiting",
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        res.render('subscriber/queues', {
            layout: "layouts/subscriber",
            title: "Subscriber Queue",
            place: place,
            queues: queues,
        });
    } catch (error) {
        res.render('404', {
            layout: "layouts/subscriber",
            title: "Error",
            message: error.message,
        })
    }
}



// ******** change the stage of queue
export const change_queue_to_active = async (req, res) => {

    try {
        const user = req.session.user;

        const queueId = req.params.queueId;
        const queue = await Queue.findById(queueId);
        if (!queue) {
            return res.status(404).json({ message: "Queue not found" });
        }
        const employee = await User.findById(user.id);
        queue.status = "active";
        queue.employee = employee;
        await queue.save();

        res.redirect(req.get('Referrer') || '/');
    } catch (error) {
        res.render('404', {
            layout: "layouts/subscriber",
            title: "Error",
            message: error.message,
        })
    }
}




// **************************************************************************************
// ******************************* Queues Section end **********************************
// **************************************************************************************



