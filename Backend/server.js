const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Booking = require('./model/Booking');
const axios = require('axios');

// Setup Express app
const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/gst_invoicing')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Booking Schema and Model
// const bookingSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   totalBookingAmount: { type: Number, required: true },
//   status: { type: String, required: true, default: 'pending' },
//   gstCalculated: { type: Boolean, default: false },
// });

// const Booking = mongoose.model('Booking', bookingSchema);

// Function to calculate GST
const calculateGST = (totalAmount) => {
  const gstRate = 18; // Example GST rate
  const igstAmount = (totalAmount * gstRate) / 100;
  const cgstAmount = (totalAmount * gstRate) / 200; // For intrastate
  const sgstAmount = (totalAmount * gstRate) / 200; // For intrastate

  return {
    totalAmount,
    igstAmount,
    cgstAmount,
    sgstAmount,
  };
};

// API to get bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


// Additional code to handle new booking creation
app.post('/api/createBooking', async (req, res) => {
    try {
        const { name, totalBookingAmount } = req.body;
        console.log(req.body);
        

        // Validate input
        if (!name || !totalBookingAmount || totalBookingAmount <= 0) {
            return res.status(400).send('Please provide valid name and booking amount.');
        }

        // Create a new booking
        // const newBooking = new Booking({
        //     name,
        //     totalBookingAmount,
        //     status: 'pending', // Default status is pending
        // });

        await Booking.create({
            name,
            totalBookingAmount,
            status: 'pending', // Default status is pending
        })
        // await newBooking.save();
        res.status(201).send('Booking created successfully!');
    } catch (err) {
        res.status(500).send('Error creating booking: ' + err.message);
    }
});




// API to update booking status and calculate GST
app.put('/api/updateBooking/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).send('Booking not found');
    }

    if (booking.status === 'finished') {
      return res.status(400).send('GST already calculated for this booking.');
    }

    // Update status to 'finished'
    booking.status = 'finished';
    await booking.save();

    // Calculate GST
    const gstData = calculateGST(booking.totalBookingAmount);

    // Call mock GST API (You can replace this with real API integration)
    await axios.post('https://mock-gst-api.com/submit', gstData)
      .then(response => {
        console.log('GST filed successfully:', response.data);
      })
      .catch(error => {
        console.error('Error filing GST:', error);
      });

    // Mark GST as calculated
    booking.gstCalculated = true;
    await booking.save();

    res.status(200).send('GST filed and booking updated.');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
