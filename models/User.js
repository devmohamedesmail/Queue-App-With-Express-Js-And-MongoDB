import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        default: '',
    },
    email: {
        type: String,
        required: true,
        unique: true,

    },
    password: {
        type: String,
        required: true,
        select: false
    },
    phone: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    avatar: {
        type: String,
        required: false,
        default: ''
    },
    role: {
        type: String,
        required: false,
        default: 'user',
        enum: ['user', 'admin', 'manager', 'staff', 'subscriber']
    },


    place: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Place",
        required: false
    },
    accessLevel: {
        type: String,
        enum: ['staff', 'manager', 'admin'],
        default: 'staff'
    },


    isActive: {
        type: Boolean,
        required: false,
        default: true
    },







    // this will remove next update

    placeId: {
        type: String,
        required: false,

    },
    serviceId: {
        type: String,
        required: false,

    },
    service: {
        type: Object,
        required: false,
        default: {}
    },





}, {
    timestamps: true
});

export default mongoose.model('User', UserSchema)