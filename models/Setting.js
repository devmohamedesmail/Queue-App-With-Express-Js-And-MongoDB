import mongoose from "mongoose";
const SettingSchema = new mongoose.Schema({
    nameEn:{
        type:String,
        required:false,
        default:' name en '
    },
    nameAr:{
        type:String,
        required:false,
        default:' name ar '
    },
    descriptionEn:{
        type:String,
        required:false,
        default:' Description en '
    },
    descriptionAr:{
        type:String,
        required:false,
        default:' Description Ar '
    },
    logo:{
        type:String,
        required:false
    },
    icon:{
        type:String,
        required:false
    },
    email:{
        type:String,
        required:false,
        default:' email '
    },
    phone:{
        type:String,
        required:false,
        default:' phone '
    },
    address:{
        type:String,
        required:false,
        default:' address '
    },
    appUrl:{
        type:String,
         required:false,
         default:' url '
    }

});
export default mongoose.model('Setting', SettingSchema)