const Booking = require('../models/Booking');

const getUserBookings = async (req, res) => {
    try {
        const { menteeId } = req.params;
        
        console.log('=== GET USER BOOKINGS DEBUG ===');
        console.log('Requested menteeId:', menteeId);
        console.log('Current UTC time:', new Date().toISOString());
        console.log('Request from user:', req.ip);
        
        if (!menteeId) {
            console.log('ERROR: No menteeId provided');
            return res.status(400).json({
                success: false,
                message: 'Mentee ID is required'
            });
        }
        
        // Find active future bookings for this mentee
        const currentBookings = await Booking.find({
            menteeIds: menteeId,
            isActive: true,
            scheduleTime: { $gte: new Date() } // Only future bookings
        }).sort({ scheduleTime: 1 }); // Sort by earliest first
        
        console.log('Database query results:', currentBookings.length, 'bookings found');
        currentBookings.forEach((booking, index) => {
            console.log(`Booking ${index + 1}:`, {
                id: booking._id,
                mentorId: booking.mentorId,
                menteeIds: booking.menteeIds,
                scheduleTime: booking.scheduleTime,
                scheduleTimeIST: new Date(booking.scheduleTime.getTime() + (5 * 60 + 30) * 60 * 1000),
                isActive: booking.isActive
            });
        });
        
        // Format the response
        const bookingDetails = currentBookings.map(booking => ({
            bookingId: booking._id,
            mentorId: booking.mentorId,
            scheduleTime: booking.scheduleTime,
            scheduleTimeIST: new Date(booking.scheduleTime.getTime() + (5 * 60 + 30) * 60 * 1000),
            totalMentees: booking.menteeIds.length,
            menteeIds: booking.menteeIds,
            isActive: booking.isActive,
            createdAt: booking.createdAt
        }));
        
        console.log('Formatted booking details:', bookingDetails);
        console.log('Has active bookings:', bookingDetails.length > 0);
        console.log('=== END DEBUG ===');
        
        res.status(200).json({
            success: true,
            bookings: bookingDetails,
            hasActiveBookings: bookingDetails.length > 0,
            totalActiveBookings: bookingDetails.length,
            currentTime: new Date().toISOString(),
            menteeId: menteeId
        });
        
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching bookings', 
            error: error.message 
        });
    }
};

module.exports = getUserBookings;