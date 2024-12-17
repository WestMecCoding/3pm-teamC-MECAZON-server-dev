// ./models/Products.js

const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    employee_id: { type: String, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
    name: {
        first_name: {
            type: String,
            required: [true, 'First name is required'],
            trim: true
        },
        last_name: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true
        },
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        trim: true
    },
    department: {
        type: String,
    },
    employment_type: {
        type: String,
        enum: ['part-time', 'full-time']
    },
    date_hired: {
        type: Date,
    },
    isAdmin: {
        type: Boolean,
    },
    contact_info: {
        email: {
            type: String,
            lowercase: true,
            trim: true
        },
        phone_number: {
            type: String,
            trim: true
        },
        address: {
            type: String,
            trim: true
        }
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = employeeSchema;