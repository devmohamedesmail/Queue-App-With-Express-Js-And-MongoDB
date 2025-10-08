import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true,
        
    },
    password: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    role: {
        type: String,
        required: false,
        default: 'user',
        enum: ['user', 'admin', 'manager', 'staff' , 'subscriber']
    },
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
    avatar: {
        type: String,
        required: false ,
        default: ''
    },
    isActive: {
        type: Boolean,
        required: false,
        default: true
    },
    isDeleted: {
        type: Boolean,
        required: false,
        default: false
    }
    
  

}, {
    timestamps: true
});

export default mongoose.model('User', UserSchema)