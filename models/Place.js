import mongoose from "mongoose";


const PlaceSchema = new mongoose.Schema({
    nameEn: {
        type: String,
        required: true,
    },
    nameAr: {
        type: String,
        required: true,
    },
    addressEn: {
        type: String,
        required: true,
    },
    addressAr: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    timeStart: {
        type: String,
        required: false,
        default: '00:00:00'
    },
    timeClosed: {
        type: String,
        required: false,
        default: '00:00:00'
    },

    location: {
        lat: {
            type: String,
            required: true
        },
        lng: {
            type: String,
            required: true
        },
    },
    daysOfWork: {
        type: [String],
        required: false,
        default: []
    },
    locationlink: {
        type: String,
        required: false
    },
    moveTurn: {
        type: Boolean,
        required: false,
        default: false
    },
    estimateTime: {
        type: Number,
        required: false,
        default: 0
    },
    phone: {
        type: String,
        required: false,
        default: ''
    }



}, { timestamps: true });

export default mongoose.model('Place', PlaceSchema);
