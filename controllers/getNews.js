const News=require('../models/News')
const getNews=async(req,res)=>{
   
      try {
         // Fetch all 'matter' fields from News documents
    const matterList = await News.find({}, 'matter').exec();
    
    // Extract and clean the 'matter' content for each document
    const matterArray = matterList.map(item => item.matter.trim());

    res.json(matterArray);
      } catch (error) {
        res.status(500).json({ message: "Error fetching news", error });
      }
}
module.exports=getNews;