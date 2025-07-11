const express = require('express');
const register = require('../controllers/register');
const router = express.Router();
const login = require('../controllers/login');
const forgetPassword = require('../controllers/forgetPassword');
const verifyOtp = require('../controllers/verifyOtp');
const getOtpTime = require('../controllers/getOtpTime');
const updatePassword = require('../controllers/passwordUpdate');
const getAccess = require('../controllers/getAccess');
const mainAuth = require('../controllers/mainAuth');

const deleteData = require('../controllers/cancel');
const getMentor = require('../controllers/getMentor');
const getNews = require('../controllers/getNews');
const getPoster = require('../controllers/getPoster');

// Profile controllers
const getUserProfile = require('../controllers/getUserProfile');
const updateProfile = require('../controllers/updateProfile');

// Add the new getUserBookings controller
const getUserBookings = require('../controllers/getUserBookings');

const authenticateToken = require('../middleware/authenticateToken'); 
const { updateBooking, cancelBooking } = require('../controllers/updateBooking');

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', login);
router.post('/forget/password', forgetPassword);
router.post('/otp/verify', verifyOtp);
router.post('/otp/time', getOtpTime);
router.post('/password/update', updatePassword);

// Protected routes (authentication required)
router.post('/get/access', getAccess);
router.post('/main', mainAuth);
router.post('/book', updateBooking);
router.delete('/cancel', cancelBooking);
router.get('/mentors', getMentor);
router.get('/news', getNews);
router.get('/poster', getPoster);

// Profile routes (authentication required)
router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile/update', authenticateToken, updateProfile);

// New route for getting user bookings
router.get('/bookings/:menteeId', getUserBookings);

module.exports = router;