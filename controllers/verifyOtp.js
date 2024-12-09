const User=require('../models/User')
const verifyOtp=async(req,res,next)=>{
    const {otp}=req.body

    try {
        const findedUser=await User.findOne({'otp.otp':otp})
        if(!findedUser) {
            const error=new Error('invalid otp')
            error.status=400
            throw error
        }
        if(new Date(findedUser.otp.sendTime).getTime()<new Date().getTime()){
            const error=new Error('otp verified');
            error.status=400
            throw error
        }
        findedUser.otp.otp=null;
        await findedUser.save();
        res.status(200).json({message:'otp verified',status:true});
    } catch (error) {
        next(error);
    }
}
module.exports=verifyOtp;