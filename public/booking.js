const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bookingId: String,
    userEmail: String,
    resourceId: String,
    date: String,
    time: String,
    duration: String,
    purpose: String,
    attendees: Number,
    status: String,
    createdAt: { type: Date, default: Date.now },
    booking_date: String,
    time_slot: String
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;