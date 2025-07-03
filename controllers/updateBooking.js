require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('../models/Booking'); // Adjust the path to your Booking model

// Function to parse IST datetime string and convert to UTC Date
function parseISTDateTimeToUTC(istDateTimeString) {
    try {
        // Expected format: "YYYY-MM-DD HH:MM:SS IST"
        const dateTimeString = istDateTimeString.replace(' IST', '');
        const [datePart, timePart] = dateTimeString.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes, seconds] = timePart.split(':').map(Number);

        // Create date in IST (UTC+5:30)
        const istDate = new Date(year, month - 1, day, hours, minutes, seconds || 0);
        
        // Convert IST to UTC by subtracting 5 hours 30 minutes
        const utcDate = new Date(istDate.getTime() - (5 * 60 + 30) * 60 * 1000);
        
        console.log('Original IST string:', istDateTimeString);
        console.log('Parsed IST date:', istDate);
        console.log('Converted UTC date:', utcDate);
        
        return utcDate;
    } catch (error) {
        console.error('Error parsing IST datetime:', error);
        return null;
    }
}

// Function to get the next available date for a specific day and time
function getNextAvailableDateTime(dayName, timeString) {
    try {
        console.log('Finding next available slot for:', dayName, timeString);
        
        // Day mapping
        const dayMap = {
            'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6,
            'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6
        };
        
        const targetDayIndex = dayMap[dayName];
        if (targetDayIndex === undefined) {
            throw new Error(`Invalid day name: ${dayName}`);
        }
        
        // Parse time string (e.g., "10-11 AM", "2-3 PM")
        let timeMatch = timeString.match(/(\d{1,2})-\d{1,2}\s*(AM|PM)/i);
        if (!timeMatch) {
            // Try alternative format "10:00-11:00"
            timeMatch = timeString.match(/(\d{1,2}):?\d{0,2}/);
            if (!timeMatch) {
                throw new Error(`Invalid time format: ${timeString}`);
            }
        }
        
        let startHour = parseInt(timeMatch[1]);
        const isPM = timeMatch[2] && timeMatch[2].toUpperCase() === 'PM';
        const isAM = timeMatch[2] && timeMatch[2].toUpperCase() === 'AM';
        
        // Convert to 24-hour format
        if (isPM && startHour !== 12) {
            startHour += 12;
        } else if (isAM && startHour === 12) {
            startHour = 0;
        }
        
        // Get current IST time
        const nowUTC = new Date();
        const nowIST = new Date(nowUTC.getTime() + (5 * 60 + 30) * 60 * 1000);
        
        console.log('Current IST time:', nowIST);
        console.log('Target day index:', targetDayIndex, 'Target hour:', startHour);
        
        // Find the next occurrence of this day and time
        let targetDate = new Date(nowIST);
        targetDate.setHours(startHour, 0, 0, 0);
        
        const currentDayIndex = nowIST.getDay();
        const currentHour = nowIST.getHours();
        const currentMinutes = nowIST.getMinutes();
        
        console.log('Current day index:', currentDayIndex, 'Current hour:', currentHour);
        
        // Calculate days to add
        let daysToAdd = 0;
        
        if (targetDayIndex === currentDayIndex) {
            // Same day - check if time has passed
            if (startHour > currentHour || (startHour === currentHour && currentMinutes < 30)) {
                // Time hasn't passed today, book for today
                daysToAdd = 0;
                console.log('Booking for today - time hasn\'t passed');
            } else {
                // Time has passed today, book for next week
                daysToAdd = 7;
                console.log('Booking for next week - time has passed today');
            }
        } else if (targetDayIndex > currentDayIndex) {
            // Target day is later this week
            daysToAdd = targetDayIndex - currentDayIndex;
            console.log('Booking for later this week, days to add:', daysToAdd);
        } else {
            // Target day is earlier in the week, so next week
            daysToAdd = 7 - (currentDayIndex - targetDayIndex);
            console.log('Booking for next week, days to add:', daysToAdd);
        }
        
        // Set the target date
        targetDate.setDate(nowIST.getDate() + daysToAdd);
        
        console.log('Target IST date:', targetDate);
        
        // Convert back to UTC
        const targetUTC = new Date(targetDate.getTime() - (5 * 60 + 30) * 60 * 1000);
        
        console.log('Target UTC date:', targetUTC);
        
        return targetUTC;
        
    } catch (error) {
        console.error('Error calculating next available datetime:', error);
        return null;
    }
}

// Function to parse day and time from availability slot format
function parseDayAndTime(availabilitySlot) {
    try {
        // Handle formats like "Mon 10-11 AM", "Wed 2-3 PM"
        const parts = availabilitySlot.trim().split(' ');
        if (parts.length < 2) {
            throw new Error(`Invalid availability slot format: ${availabilitySlot}`);
        }
        
        const day = parts[0];
        const time = parts.slice(1).join(' ');
        
        return { day, time };
    } catch (error) {
        console.error('Error parsing availability slot:', error);
        return null;
    }
}

// Legacy function to calculate the UTC date and time from IST time string (kept for backward compatibility)
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

// Function to handle booking logic - either create new or add to existing
const handleBooking = async (mentorId, menteeId, scheduleTime) => {
    try {
        // Check if a booking already exists for this mentor and time
        const existingBooking = await Booking.findOne({
            mentorId: mentorId,
            scheduleTime: scheduleTime,
            isActive: true
        });

        if (existingBooking) {
            // Check if mentee is already in the booking
            if (existingBooking.menteeIds.includes(menteeId)) {
                console.log('Mentee already booked for this slot');
                return {
                    success: false,
                    message: 'You have already booked this time slot',
                    booking: existingBooking
                };
            }

            // Check if we've reached the maximum number of mentees (optional)
            if (existingBooking.menteeIds.length >= existingBooking.maxMentees) {
                console.log('Booking is full');
                return {
                    success: false,
                    message: 'This time slot is fully booked',
                    booking: existingBooking
                };
            }

            // Add mentee to existing booking
            existingBooking.menteeIds.push(menteeId);
            existingBooking.updatedAt = new Date();
            
            const updatedBooking = await existingBooking.save();
            console.log(`Added mentee ${menteeId} to existing booking. Total mentees: ${updatedBooking.menteeIds.length}`);
            
            return {
                success: true,
                message: 'Successfully joined the group session',
                booking: updatedBooking,
                isNewBooking: false
            };
        } else {
            // Create new booking
            const newBooking = new Booking({
                mentorId,
                menteeIds: [menteeId],
                scheduleTime,
                isActive: true,
            });

            const savedBooking = await newBooking.save();
            console.log('Created new booking:', savedBooking._id);
            
            return {
                success: true,
                message: 'Booking created successfully',
                booking: savedBooking,
                isNewBooking: true
            };
        }
    } catch (error) {
        console.error('Error handling booking:', error);
        
        // Handle duplicate key error (race condition)
        if (error.code === 11000) {
            console.log('Duplicate booking detected, trying to add to existing booking...');
            // Retry by finding the existing booking and adding mentee
            const existingBooking = await Booking.findOne({
                mentorId: mentorId,
                scheduleTime: scheduleTime,
                isActive: true
            });
            
            if (existingBooking && !existingBooking.menteeIds.includes(menteeId)) {
                existingBooking.menteeIds.push(menteeId);
                existingBooking.updatedAt = new Date();
                const updatedBooking = await existingBooking.save();
                
                return {
                    success: true,
                    message: 'Successfully joined the group session',
                    booking: updatedBooking,
                    isNewBooking: false
                };
            }
        }
        
        throw error;
    }
};

// Function to remove mentee from booking
// Function to remove mentee from booking and delete entry if no mentees are left
const removeMenteeFromBooking = async (mentorId, menteeId) => {
    try {
        const booking = await Booking.findOne({
            mentorId: mentorId,
            menteeIds: menteeId,
            isActive: true,
            scheduleTime: { $gte: new Date() } // Only future bookings
        });

        if (!booking) {
            return {
                success: false,
                message: 'No active booking found for this mentee'
            };
        }

        // Remove mentee from the array
        booking.menteeIds = booking.menteeIds.filter(id => id !== menteeId);

        // Update the updatedAt field
        booking.updatedAt = new Date();

        if (booking.menteeIds.length === 0) {
            // No mentees left, delete the booking entry
            await Booking.deleteOne({ _id: booking._id });
            console.log('No mentees left, booking entry deleted');
            return {
                success: true,
                message: 'Successfully removed from booking and booking entry deleted',
                booking: null
            };
        }

        const updatedBooking = await booking.save();

        return {
            success: true,
            message: 'Successfully removed from booking',
            booking: updatedBooking
        };
    } catch (error) {
        console.error('Error removing mentee from booking:', error);
        throw error;
    }
};

// Express route handler for updating booking
const updateBooking = async (req, res) => {
    const { mentorId, menteeId, time } = req.body;
    console.log('Received booking request:', { mentorId, menteeId, time });
    
    if (!mentorId || !menteeId || !time) {
        return res.status(400).json({ message: 'mentorId, menteeId, and time are required.' });
    }

    let scheduleTime;

    try {
        // Check if the time is in the new IST datetime format or legacy format
        if (time.includes('IST') || time.includes('-')) {
            if (time.includes('IST')) {
                // New format: "YYYY-MM-DD HH:MM:SS IST"
                scheduleTime = parseISTDateTimeToUTC(time);
                if (!scheduleTime) {
                    return res.status(400).json({ message: 'Invalid datetime format. Expected format: YYYY-MM-DD HH:MM:SS IST' });
                }
            } else {
                // Availability slot format: "Wed 7-8 PM"
                const parsed = parseDayAndTime(time);
                if (!parsed) {
                    return res.status(400).json({ message: 'Invalid availability slot format. Expected format: "Day HH-HH AM/PM"' });
                }
                
                scheduleTime = getNextAvailableDateTime(parsed.day, parsed.time);
                if (!scheduleTime) {
                    return res.status(400).json({ message: 'Unable to calculate next available date and time' });
                }
            }
        } else {
            // Legacy format: "HH:MM"
            scheduleTime = convertISTTimeToUTCDate(time.slice(0, 5));
        }
        
        console.log('Final schedule time (UTC):', scheduleTime);

        // Validate that the scheduled time is in the future
        const nowUTC = new Date();
        if (scheduleTime <= nowUTC) {
            console.log('Scheduled time is in the past, adjusting...');
            // If somehow the calculated time is in the past, add 7 days
            scheduleTime = new Date(scheduleTime.getTime() + 7 * 24 * 60 * 60 * 1000);
            console.log('Adjusted schedule time (UTC):', scheduleTime);
        }

        const result = await handleBooking(mentorId, menteeId, scheduleTime);
        
        if (!result.success) {
            return res.status(400).json({ 
                message: result.message,
                status: false
            });
        }

        // Convert back to IST for response
        const scheduleTimeIST = new Date(scheduleTime.getTime() + (5 * 60 + 30) * 60 * 1000);
        
        res.status(200).json({ 
            message: result.message,
            status: true,
            scheduledTimeUTC: scheduleTime,
            scheduledTimeIST: scheduleTimeIST,
            bookingId: result.booking._id,
            isNewBooking: result.isNewBooking,
            totalMentees: result.booking.menteeIds.length,
            menteeIds: result.booking.menteeIds
        });
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ message: 'Error updating booking', error: error.message });
    }
};

// Express route handler for canceling booking
const cancelBooking = async (req, res) => {
    const { mentorId, menteeId } = req.body;
    console.log('Received cancel booking request:', { mentorId, menteeId });
    
    if (!mentorId || !menteeId) {
        return res.status(400).json({ message: 'mentorId and menteeId are required.' });
    }

    try {
        const result = await removeMenteeFromBooking(mentorId, menteeId);
        
        if (!result.success) {
            return res.status(400).json({ 
                message: result.message,
                status: false
            });
        }

        res.status(200).json({ 
            message: result.message,
            status: true,
            bookingId: result.booking._id,
            remainingMentees: result.booking.menteeIds.length,
            isBookingActive: result.booking.isActive
        });
    } catch (error) {
        console.error('Error canceling booking:', error);
        res.status(500).json({ message: 'Error canceling booking', error: error.message });
    }
};

// Export both functions
module.exports = {
    updateBooking,
    cancelBooking
};