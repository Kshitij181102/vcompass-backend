const Poster=require('../models/Poster')
const getPoster=async(req,res)=>{
   
      try {
        const matterList = await Poster.find({}, 'matter').exec();
    
    // Extract and clean the 'matter' content for each document
    const matterArray = matterList.map(item => item.matter.trim());

    res.json(matterArray);
      } catch (error) {
        res.status(500).json({ message: "Error fetching Poster", error });
      }
}
module.exports=getPoster;