import user from "../models/user.js";
import {StatusCodes} from "http-status-codes"
import ExpressError from "../util/expressError.js";
import bcrypt from "bcrypt" ;
import  crypto from"crypto" ;
import jwt from "jsonwebtoken";

const register=async(req,res,next)=>{
     let {email,password,name}=req.body;

     email=email.toLowerCase().trim();

     let findUser=await user.findOne({email})

     if(findUser){
          return next(new ExpressError("user already exites",StatusCodes.CONFLICT))
     }

     let salt=await bcrypt.genSalt(10);
     let hasPassword=await bcrypt.hash(password,salt);

     let newUser=new user({
          email,
          password:hasPassword,
          name

     })

    await newUser.save()

    return res.status(StatusCodes.CREATED).json({ message: "User signup"})

     
}


let login=async(req,res,next)=>{
     let {email,password}=req.body
      email=email.toLowerCase().trim();

      let findUser=await user.findOne({email});

      if(!findUser){
         return next(new ExpressError("user not found",StatusCodes.BAD_REQUEST)) 

      }

      let correctpassword=await bcrypt.compar(findUser.password,password);

      if(!correctpassword){
          return next(new ExpressError("password is not correct",StatusCodes.UNAUTHORIZED))
      }

      let token=jwt.sign({userId:findUser._id},
          process.env.JWT_SECRET,
    { expiresIn: "1d" }
      )

     res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "devlopment",
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000,
});

return res.status(StatusCodes.OK).json({message: "User login successful",user: { id: foundUser._id,
email: foundUser.email,}});
}

const logout=async(req,res,next)=>{
     
     res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "devlopment",
    sameSite: "lax",
  });

    return   res.status(StatusCodes.OK).json({message: "User logout successful",})

}

export {register,login,logout}