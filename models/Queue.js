import mongoose from "mongoose";
import { format } from 'date-fns';

const QueueSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: false,
        default: null,
    },
    serviceId: {
        type: String,
        required: false,
        default: null,
    },
    placeId: {
        type: String,
        required: false,
        default: null,
    },
    place:{
        type: mongoose.Schema.Types.Mixed,
        required: false,
        default: null,
    },
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        default: null
    },
    place_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
        required: false,
        default: null
    },
    service_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: false,
        default: null
    },
    queue: {
        type: Number,
        required: false,
    },
    status: {
        type: String,
        enum: ["waiting", "active", "cancelled", "completed" , "rejected" , "pending"], 
        default: "waiting",
    },
    employee: {
        type:Object,
        required: false,
        default: null
    },
    employee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: false,
        default: null
    }
}, { timestamps: true });


QueueSchema.pre("save", async function (next) {
    if (!this.queue) {
        const today = format(new Date(), 'yyyy-MM-dd');

        let query = {
            placeId: this.placeId,
            createdAt: {
                $gte: new Date(`${today}T00:00:00.000Z`),
                $lte: new Date(`${today}T23:59:59.999Z`)
            }
        };

        if (this.serviceId) {
            query.serviceId = this.serviceId;
        }

        const lastQueue = await this.constructor
            .findOne(query)
            .sort({ queue: -1 });

        this.queue = lastQueue ? lastQueue.queue + 1 : 1;
    }

    next();
});

export default mongoose.model('Queue', QueueSchema)
