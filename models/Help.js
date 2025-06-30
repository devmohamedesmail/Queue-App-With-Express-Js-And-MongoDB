import mongoose from "mongoose";
const HelpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: false,
        default: null,
    },
    user: {
        type: Object,
        required: false,
        default: null
    },
    topic: {
        type: String,
        required: false,
        default: null,
    },
    message: {
        type: String,
        required: false,
        default: null,
    },
    reply: {
        type: String,
        required: false,
        default: null
    }
}, { timestamps: true });


export default mongoose.model("Help", HelpSchema);  
