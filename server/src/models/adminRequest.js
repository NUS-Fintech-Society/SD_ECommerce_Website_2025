const mongoose = require("mongoose");

const adminRequestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    organisation: { type: String, required: true },
    status: { 
        type: String, 
        required: true, 
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
});

const AdminRequest = mongoose.model("AdminRequest", adminRequestSchema);

exports.AdminRequest = AdminRequest;