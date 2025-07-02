const Mentor = require('../models/Mentor');

const getMentor = async (req, res) => {
    try {
        console.log('Fetching mentors...');
        
        // Fetch and sort mentors alphabetically by their name
        const mentors = await Mentor.find().sort({ name: 1 }); // 1 for ascending order
        
        console.log(`Found ${mentors.length} mentors`);
        
        // Transform the data to ensure all fields are present with defaults
        const transformedMentors = mentors.map(mentor => ({
            id: mentor.id,
            name: mentor.name,
            shortDes: mentor.shortDes,
            time: mentor.time,
            img: mentor.img,
            
            // New fields with defaults if not present
            program: mentor.program || 'Not specified',
            department: mentor.department || 'Not specified',
            yearOfStudy: mentor.yearOfStudy || 'Not specified',
            specialization: mentor.specialization || [],
            availabilitySlots: mentor.availabilitySlots || [mentor.time], // fallback to time field
            languagesSpoken: mentor.languagesSpoken || [],
            bio: mentor.bio || mentor.shortDes, // fallback to shortDes
            supportAreas: mentor.supportAreas || [],
            achievements: mentor.achievements || [],
            contactInfo: mentor.contactInfo || {},
            
            // Include timestamps if present
            createdAt: mentor.createdAt,
            updatedAt: mentor.updatedAt
        }));
        
        res.json(transformedMentors);
    } catch (error) {
        console.error('Error fetching mentors:', error);
        res.status(500).json({ 
            message: 'Error fetching mentors.',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

module.exports = getMentor;