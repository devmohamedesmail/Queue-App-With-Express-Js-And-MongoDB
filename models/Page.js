import mongoose from "mongoose";
const PageSchema = new mongoose.Schema({
    title_en: {
        type: String,
        required: false,
        default: null,
    },
    title_ar: {
        type: String,
        required: false,
        default: null,
    },
    content_en: {
        type: String,
        required: false,
        default: null,
    },
    content_ar: {
        type: String,
        required: false,
        default: null,
    }
    
}, { timestamps: true });
export default mongoose.model('Page', PageSchema)
