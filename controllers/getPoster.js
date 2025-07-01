const Poster=require('../models/Poster')
const getPoster=async(req,res)=>{
   
     try {
    const { category, status, featured, limit = 10, page = 1 } = req.query;
    
    let filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (status) {
      filter.status = status;
    } else {
      // By default, show upcoming and ongoing events
      filter.status = { $in: ['upcoming', 'ongoing'] };
    }
    
    if (featured === 'true') {
      filter.featured = true;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const posters = await Poster.find(filter)
      .sort({ eventDate: 1 }) // Sort by event date (earliest first)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();
    
    const total = await Poster.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: posters,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasNext: skip + posters.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching posters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posters',
      error: error.message
    });
  }
}
module.exports=getPoster;