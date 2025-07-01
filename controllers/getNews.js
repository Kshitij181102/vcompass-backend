const News=require('../models/News')
const getNews=async(req,res)=>{
   
     try {
    const { category, featured, limit = 10, page = 1 } = req.query;
    
    let filter = { status: 'published' };
    
    if (category) {
      filter.category = category;
    }
    
    if (featured === 'true') {
      filter.featured = true;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const news = await News.find(filter)
      .sort({ publishDate: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();
    
    const total = await News.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: news,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasNext: skip + news.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
      error: error.message
    });
  }
}
module.exports=getNews;