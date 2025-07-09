import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
    place_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
        required: false
    },
    service_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: false
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // لضمان عدم التكرار
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
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
},
    {
        timestamps: true
    }
)


export default mongoose.model('Employee', EmployeeSchema);