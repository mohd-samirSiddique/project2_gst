import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [bookings, setBookings] = useState([]);
  const [newBooking, setNewBooking] = useState({ name: '', totalBookingAmount: '' });
  const [loading, setLoading] = useState(false);

  // Fetch bookings from backend API
  useEffect(() => {
    axios.get('http://localhost:5000/api/bookings')
      .then(response => {
        setBookings(response.data);
      })
      .catch(error => {
        console.error('Error fetching bookings:', error);
      });
  }, []);

  // Handle new booking form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBooking({ ...newBooking, [name]: value });
  };

  // Submit new booking form
  const handleNewBookingSubmit = (e) => {
    e.preventDefault();
    if (!newBooking.name || !newBooking.totalBookingAmount) {
      alert('Please fill out all fields.');
      return;
    }

    setLoading(true);

    axios.post('http://localhost:5000/api/createBooking', newBooking)
      .then(response => {
        alert(response.data);
        setNewBooking({ name: '', totalBookingAmount: '' });
        setLoading(false);
        // Refresh the bookings list after adding new booking
        axios.get('http://localhost:5000/api/bookings')
          .then(response => {
            setBookings(response.data);
          })
          .catch(error => {
            console.error('Error fetching bookings:', error);
          });
      })
      .catch(error => {
        alert('Error: ' + error.response.data);
        setLoading(false);
      });
  };

  // Update booking status and trigger GST calculation
  const handleUpdateStatus = (id) => {
    axios.put(`http://localhost:5000/api/updateBooking/${id}`)
      .then(response => {
        alert(response.data);
        // Refresh the booking list after update
        setBookings(bookings.map(booking =>
          booking._id === id ? { ...booking, status: 'finished', gstCalculated: true } : booking
        ));
      })
      .catch(error => {
        alert('Error: ' + error.response.data);
      });
  };

  return (
    <div className="App">
      <h1>Booking List</h1>
      
      {/* New Booking Form */}
      <div className="form-container">
        <h2>Create New Booking</h2>
        <form onSubmit={handleNewBookingSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newBooking.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="totalBookingAmount">Total Booking Amount:</label>
            <input
              type="number"
              id="totalBookingAmount"
              name="totalBookingAmount"
              value={newBooking.totalBookingAmount}
              onChange={handleInputChange}
              required
              min="1"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating Booking...' : 'Create Booking'}
          </button>
        </form>
      </div>

      {/* Booking List Table */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(booking => (
            <tr key={booking._id}>
              <td>{booking.name}</td>
              <td>{booking.totalBookingAmount}</td>
              <td>{booking.status}</td>
              <td>
                {booking.status !== 'finished' ? (
                  <button onClick={() => handleUpdateStatus(booking._id)}>
                    Mark as Finished
                  </button>
                ) : (
                  'GST Filed'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
