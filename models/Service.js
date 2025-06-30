
import mongoose from "mongoose";
const ServiceSchema = new mongoose.Schema({
    placeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
        required: true
    },
    nameAr: {
        type: String,
        required: true
    },
    nameEn: {
        type: String,
        required: true
    },
    estimateTime: {
        type: Number,
        required: false,
        default: 0
    },
}, {
    timestamps: true
})


export default mongoose.model('Service', ServiceSchema)