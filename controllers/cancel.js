const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const cancel=async(req,res)=>{
    const { mentorId, menteeId } = req.body;

    try {
        // Find and delete the booking based on mentorId and menteeId
        const result = await Booking.findOneAndDelete({ mentorId, menteeId });

        if (!result) {
            return res.status(404).json({ status: false, message: 'Booking not found.' });
        }

        res.json({ status: true, message: 'Booking canceled successfully.' });
    } catch (error) {
        console.error("Error canceling booking:", error);
        res.status(500).json({ status: false, message: 'Error canceling booking.' });
    }
}
module.exports=cancel;