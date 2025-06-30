import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "subscriber", "employee" , "user"], 
    required: true,
  },
  parent_role: {
    type: String,
    enum: ["subscriber"], 
    required: function () {
      return this.role === "employee"; 
    },
  },
  place_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Place", 
    required: function () {
      return this.role === "subscriber"; 
    },
  },
}, {
  timestamps: true, 
});



export default mongoose.model('Role', RoleSchema)
