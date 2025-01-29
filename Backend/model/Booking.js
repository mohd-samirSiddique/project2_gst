const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  totalBookingAmount: { type: Number, required: true },
  status: { type: String, required: true, default: 'pending' },
  gstCalculated: { type: Boolean, default: false }
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
