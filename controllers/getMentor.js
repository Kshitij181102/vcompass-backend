const Mentor = require('../models/Mentor');

const getMentor = async (req, res) => {
    try {
        // Fetch and sort mentors alphabetically by their name
        const mentors = await Mentor.find().sort({ name: 1 }); // 1 for ascending order
        res.json(mentors);
    } catch (error) {
        console.error('Error fetching mentors:', error);
        res.status(500).json({ message: 'Error fetching mentors.' });
    }
}

module.exports = getMentor;
