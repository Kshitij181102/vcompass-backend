const User = require("../models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res, next) => {
 
  const { email, password } = req.body;
  try {
   
    const formatedEmail = email.toLowerCase();
    const findedUser = await User.findOne({ email: formatedEmail });
    const disId=findedUser.disId;
  

    if (!findedUser) {
      const error = new Error("User Doesn't exist");
      error.status = 400;
      throw error;
    }
    const isPssMatch = await bcrypt.compare(password, findedUser.password);
    if (!isPssMatch) {
      const error = new Error("incorrect password");
      error.status = 400;
      throw error;
    }
    const accessToken = jwt.sign(
        { email:formatedEmail , userId: findedUser._id },
        process.env.ACCESS_TOKEN_KEY,
        { expiresIn: "7d" }
      );
      res.status(200).json({message:"Login Successfully",status:true,token:accessToken,disId:disId});
  } catch (error) {
    next(error);
  }
  

 
};

module.exports=login;