require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('../models/Booking'); // Adjust the path to your Booking model

// Function to calculate the UTC date and time from IST time string
function convertISTTimeToUTCDate(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);

    // Convert IST to UTC by subtracting the offset (5 hours 30 minutes)
    const utcHours = (hours - 5 + 24) % 24;
    const utcMinutes = (minutes - 30 + 60) % 60;

    const adjustedHours = utcMinutes > minutes ? (utcHours - 1 + 24) % 24 : utcHours;

    const utcDate = new Date();
    utcDate.setUTCHours(adjustedHours, utcMinutes, 0, 0);

    // Move to the next day if the calculated time is in the past
    const currentUTCDate = new Date();
    if (utcDate <= currentUTCDate) {
        utcDate.setUTCDate(utcDate.getUTCDate() + 1);
    }
    console.log(utcDate)
    return utcDate;
}

// Function to insert a booking with custom data
const insertBooking = async (mentorId, menteeId, scheduleTime) => {
    const booking = new Booking({
        mentorId,
        menteeId,
        scheduleTime,
        isActive: true,
    });

    try {
        await booking.save();
        console.log('Booking inserted successfully!');
    } catch (err) {
        console.error('Error inserting booking:', err);
    }
};

// Express route handler for updating booking
const updateBooking = async (req, res) => {
    const { mentorId, menteeId, time } = req.body;
    console.log(mentorId,menteeId,time)
    if (!mentorId || !menteeId || !time) {
        return res.status(400).json({ message: 'mentorId, menteeId, and time are required.' });
    }

    // Convert IST to UTC date
    const scheduleTime = convertISTTimeToUTCDate(time.slice(0, 5));
    console.log('Converted schedule time:', scheduleTime);

    try {
        await insertBooking(mentorId, menteeId, scheduleTime);
        res.status(200).json({ message: 'Booking updated successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating booking', error: error.message });
    }
};

// Export the updateBooking function
module.exports = updateBooking;
