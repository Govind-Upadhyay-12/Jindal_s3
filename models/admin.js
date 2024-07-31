
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    name: { type: String, maxlength: 200 },
    email: { type: String, maxlength: 200, index: true },
    ip: { type: String, maxlength: 200 },
    hash: { type: String },
    salt: { type: String, maxlength: 200 },
    status: { type: Boolean, default: true, index: true },
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;

