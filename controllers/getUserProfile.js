const User = require('../models/User');

const getUserProfile = async (req, res) => {
    try {
        console.log('=== GET PROFILE DEBUG ===');
        console.log('User from middleware:', req.user);
        
        const userId = req.user.userId;
        console.log('Looking for user with ID:', userId);
        
        const user = await User.findById(userId).select('-password -otp');
        
        if (!user) {
            console.log('User not found in database');
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User found:', user.name, user.email);
        
        res.status(200).json({
            success: true,
            user: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = getUserProfile;