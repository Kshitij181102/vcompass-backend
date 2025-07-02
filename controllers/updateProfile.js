const User = require('../models/User');
const bcrypt = require('bcryptjs');

const updateProfile = async (req, res) => {
    try {
        console.log('=== UPDATE PROFILE DEBUG ===');
        console.log('User from middleware:', req.user);
        console.log('Request body:', req.body);

        const userId = req.user.userId;

        const {
            name,
            email,
            phoneNumber,
            password,
            academicInfo,
            disId 
        } = req.body;

        // Validate required fields
        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }

        // Check if email is already taken by another user
        const existingUser = await User.findOne({ 
            email: email, 
            _id: { $ne: userId } 
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Email is already in use by another account' });
        }

        // Prepare update data
        const updateData = {
            name,
            email,
            phoneNumber: phoneNumber || '',
            disId: disId || '',
            academicInfo: {
                studentId: academicInfo?.studentId || '',
                program: academicInfo?.program || '',
                department: academicInfo?.department || '',
                yearOfStudy: academicInfo?.yearOfStudy || '',
                section: academicInfo?.section || ''
            },
            profileCompleted: true
        };

        // Hash password if provided
        if (password && password.trim() !== '') {
                        const saltRounds = 10;
            updateData.password = await bcrypt.hash(password, saltRounds);
        }

        

        // Update user without running validators (to avoid disId required error)
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true } // removed runValidators
        ).select('-password -otp');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User updated successfully');

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (error) {
        //console.error('Update profile error:', error);
        console.error('Update profile error:', error.stack || error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: validationErrors 
            });
        }

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email is already in use' });
        }

        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = updateProfile;
