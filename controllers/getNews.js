const News = require('../models/News');

const getNews = async (req, res) => {
  try {
    const { category, featured, limit = 10, page = 1 } = req.query;
    
    let filter = { status: 'published' };
    
    // Handle category filtering
    if (category && category !== 'all') {
      filter.category = { $regex: new RegExp(category, 'i') };
    }
    
    if (featured === 'true') {
      filter.featured = true;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    console.log("News filter:", filter);
    console.log("Pagination - Skip:", skip, "Limit:", limit);

    // Apply the filter, limit, and skip properly
    const news = await News.find(filter)
      .sort({ publishDate: -1, createdAt: -1 }) // Sort by publish date (newest first)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();
    
    const total = await News.countDocuments(filter);
    
    console.log("Found news:", news.length, "Total:", total);
    
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
};

module.exports = getNews;