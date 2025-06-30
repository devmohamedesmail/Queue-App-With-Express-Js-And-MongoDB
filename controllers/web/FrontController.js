
import connectDB from "../../config/db.js";
import Service from "../../models/Service.js";
import Place from "../../models/Place.js";
import Queue from "../../models/Queue.js";
import Setting from "../../models/Setting.js";
import moment from "moment";
import Page from "../../models/Page.js";



export const home_page = async (req, res) => {
    try {
        await connectDB();
        const places = await Place.find();

        res.render('front/index', {
            title: "Home Page",
            layout: "layouts/front",
            places: places,
        })
    } catch (error) {
        res.render('404', {
            title: "Page Not Found",
            layout: "layouts/front"
        })
    }
}


export const redirect_login_page = (req, res) => {
    try {
        res.render('front/login.ejs', {
            title: "Login Page",
            layout: "layouts/front"
        })
    } catch (error) {
        res.render('404', {
            title: "Page Not Found",
            layout: "layouts/front"
        })
    }

}



export const redirect_to_register_page = (req, res) => {
    res.render('front/register', {
        title: "Register",
        layout: "layouts/front",
    })
}





export const fetch_place_service_for_user = async (req, res) => {
    try {
        const placeId = req.params.placeId;
        await connectDB();
        const services = await Service.find({ placeId: placeId });
        const place = await Place.findById(placeId);
        // res.render('front/place_services', {
        //     title: "Place Services",
        //     layout: "layouts/front",
        //     services: services,
        //     placeId: placeId
        // })

        if (services.length > 0) {
            res.render('front/place_services', {
                title: "Place Services",
                layout: "layouts/front",
                services: services,
                placeId: placeId
            })
        } else {
            const queues = await Queue.find({ placeId: placeId });
            res.render('front/show_waiting', {
                title: "Place Queues",
                layout: "layouts/front",

                queues: queues,
                place: place
            })
        }

    } catch (error) {
        console.log(error);
    }
}





// show waiting queue
export const show_waiting_list = async (req, res) => {

    await connectDB();
    const placeId = req.params.placeId;
    const serviceId = req.params.serviceId;
    const startOfDay = moment().startOf('day').toDate();
    const endOfDay = moment().endOf('day').toDate();
    const place = await Place.findById(placeId);
    const service = await Service.findById(serviceId);



    const queues = await Queue.find({
        status: 'waiting',
        placeId: placeId,
        serviceId: serviceId,
        createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    }).sort({ createdAt: 1 });

    res.render('front/show_waiting', {
        title: "Waiting Queue",
        layout: "layouts/front",
        queues: queues,
        place: place,
        service: service,
    })
}



export const Book_my_turn = async (req, res) => {

    try {
        if (!req.session.user) {
            return res.render('front/login.ejs', {
                title: "Login Page",
                layout: "layouts/front"
            });

        } else {

            await connectDB();
            const placeId = req.params.place;
            const serviceId = req.params.service;
            const userId = req.session.user.id;
            const place = await Place.findById(placeId);


            const queue = await Queue.create({
                placeId: placeId,
                serviceId: serviceId,
                userId: userId,
                place: place,
            });


            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            const userQueues = await Queue.find({
                status: 'waiting',
                userId: userId,
                createdAt: { $gte: todayStart, $lte: todayEnd }
            }).sort({ createdAt: 1 });


            const queuesData = [];

            for (let queue of userQueues) {
                const { placeId, serviceId } = queue;
                const place = await Place.findById(placeId);
                const service = await Service.findById(serviceId);

                // Calculate ahead of you
                const aheadOfYou = await Queue.countDocuments({
                    placeId,
                    serviceId,
                    status: 'waiting',
                    createdAt: { $gte: todayStart, $lte: todayEnd }, // Only today's queues
                    createdAt: { $lt: queue.createdAt } // Users before this one in the same service
                });

                // Find the first active queue for the same placeId and serviceId
                const nowServing = await Queue.findOne({
                    placeId,
                    serviceId,
                    status: 'active',
                    createdAt: { $gte: todayStart, $lte: todayEnd }
                }).sort({ queue: 1 });

                // Calculate estimated time based on people ahead of the user
                //  const estimatedTime = aheadOfYou * 5; // Assuming 5 minutes per user
                let estimatedTime;
                if (service && service.estimateTime) {
                    estimatedTime = aheadOfYou * service.estimateTime;
                } else {
                    estimatedTime = aheadOfYou * place.estimateTime;
                }
                // Collect the result for this queue
                queuesData.push({
                    queue,
                    aheadOfYou,
                    nowServingQueue: nowServing ? nowServing.queue : null,
                    estimatedTime
                });
            }



            res.render('front/my_queues', {
                title: "My Queues",
                layout: "layouts/front",
                queuesData: queuesData,
            })
        }

    } catch (error) {
        res.render('front/404.ejs', {
            layout: "layouts/front",
            title: "Error"
        })
    }


}



// show user queues
export const show_user_queues = async (req, res) => {
    try {
        const userId = req.params.userId;

        await connectDB();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const userQueues = await Queue.find({
            status: 'waiting',
            userId: userId,
            createdAt: { $gte: todayStart, $lte: todayEnd }
        }).sort({ createdAt: 1 });


        const queuesData = [];

        for (let queue of userQueues) {
            const { placeId, serviceId } = queue;
            const place = await Place.findById(placeId);
            const service = await Service.findById(serviceId);

            // Calculate ahead of you
            const aheadOfYou = await Queue.countDocuments({
                placeId,
                serviceId,
                status: 'waiting',
                createdAt: { $gte: todayStart, $lte: todayEnd }, // Only today's queues
                createdAt: { $lt: queue.createdAt } // Users before this one in the same service
            });

            // Find the first active queue for the same placeId and serviceId
            const nowServing = await Queue.findOne({
                placeId,
                serviceId,
                status: 'active',
                createdAt: { $gte: todayStart, $lte: todayEnd }
            }).sort({ queue: 1 });


            let estimatedTime;
            if (service && service.estimateTime) {
                estimatedTime = aheadOfYou * service.estimateTime;
            } else {
                estimatedTime = aheadOfYou * place.estimateTime;
            }

            // Collect the result for this queue
            queuesData.push({
                queue,
                aheadOfYou,
                nowServingQueue: nowServing ? nowServing.queue : null,
                estimatedTime
            });
        }



        res.render('front/my_queues', {
            title: "My Queues",
            layout: "layouts/front",
            queuesData: queuesData,
        })
    } catch (error) {
        res.render('404', {
            title: "Page Not Found",
            layout: "layouts/front"
        })
    }
}



// contact_page
export const contact_page = async (req,res) =>{
    try {
        await connectDB();
        const settings = await Setting.findOne();
        console.log(settings)
        res.render('front/contact.ejs',{
            settings:settings,
            layout: "layouts/front",
            title: "Contact us" 
        })
    } catch (error) {
        res.render('front/404.ejs', {
            layout: "layouts/front",
            title: "Error"
        })
    }
}




export const show_page_content = async (req,res)=>{
    try {
        await connectDB();
        
        const page = await Page.findById(req.params.pageId);
        res.render('front/page.ejs',{
            page:page,
            layout: "layouts/front",
            title: page.title_en
        })
    } catch (error) {
        res.render('front/404.ejs', {
            layout: "layouts/front",
            title: "Error"
        })
    }
}