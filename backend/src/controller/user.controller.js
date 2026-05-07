import {User} from "../models/user.model.js"
import { ApiError } from "../utils/api-error.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import {APiResponse} from "../utils/api-response.js"
import {uploadCloudinary,deleteOnCloudinary} from "../utils/cloudinary.js"
import { sendmail ,verificationEmail} from "../utils/mail.js";
import crypto from "crypto"
const generateAccessAndRefreshTokens = async(userId)=>{
  try {
    const user = await User.findById(userId)
     const accessToken = user.generateAccessToken();
     const refreshToken = user.generateRefereshToken();
     user.refreshToken = refreshToken ;
     await user.save({validateBeforeSave : false});
      return {accessToken , refreshToken}
  } catch (error) {
     throw new ApiError(500,"something went wrong while generating the access token")
  }
}
const registerUser = asyncHandler(async(req,res)=>{
   const{email,username,password, fullname} = req.body 
   const imageLocalPath  = req.file?.path;

   const existUser = await User.findOne({
      $or : [{email},{username}]
   })
   if(existUser){
    throw new ApiError(409,"the user is already exist")
   }
   let avatarCloudLink ; 

   if(imageLocalPath){
       try {
        avatarCloudLink = await uploadCloudinary(imageLocalPath)
       } catch (error) {
         throw new ApiError(500,"avatar upload failed")
       }
   }

   const user = await User.create({
     fullname,
     email,
     username,
     password,
     avatar : {
        url : avatarCloudLink.secure_url || "",
        public_id : avatarCloudLink.public_id || "",
     },
     isEmailVerified: false,
   });
 
  const {unhashedToken, hashToken , tokenExpiary} = user.generateTemporaryToken();

  user.emailVerificationToken = hashToken;
  user.emailVerificationExpiry = tokenExpiary;

  await user.save({validateBeforesave : false });

  try {
    await sendmail({
        email : user?.email,
        subject : "please verify your email",
        mailGenContent : verificationEmail(user.username, `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashedToken}`)
    })}
     catch (error) {
    await User.findByIdAndDelete(user._id);
    throw new ApiError(500,"Email sending failed")
  }
  const createdUser  = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry")
  if(!createdUser){
    throw new ApiError(500,"something went wrong while registering the user")
  }

  return res.status(201).json(
    new APiResponse(201,createdUser,"User registered successfully  and verification email has been sent on your email")
  )
})

const verifyEmail = asyncHandler(async(req,res)=>{
  const {verificationToken} = req.params;
   console.log("the data is",verificationToken)
      console.log("the data type", typeof verificationToken)
  if(!verificationToken){
    throw new ApiError(400,"Email Verification token is missing")
  }
  const hashToken = crypto.createHash("sha256").update(verificationToken).digest("hex")
  const user = await User.findOne({emailVerificationToken : hashToken ,emailVerificationExpiry : {$gt : Date.now()}});

  if(!user){
    throw new ApiError(400,"token is expaired or not found")
  }
  user.isEmailVerified = true ;
  user.emailVerificationExpiry = undefined ;
  user.emailVerificationToken = undefined ;

  await user.save({validateBeforeSave : false});

   return res
    .status(200)
    .json(new APiResponse(200, {isEmailVerified : true} ,"The Email is verified"))
});

const loginUser = asyncHandler(async(req,res)=>{
  const {email,password,username} = req.body ;

  const user  = await User.findOne({$or :[{email},{username}]});

  if(!user){
    throw new ApiError(404,"user not found")
  }
  
  const isPasswordValid = user.isPasswordValid(user.password);
  if(!isPasswordValid){
    throw new ApiError(401,"INVALID PASSWORD")
  }
  if(!user.isEmailVerified){
    throw new ApiError(401,"User Email is not Verified please Verify Your Email Fist")
  }

  const {accessToken , refreshToken} =  await generateAccessAndRefreshTokens(user._id)
  
   const loggedinUser  = await User.findById(user._id).select("-password -refreshToken -emailVerification -emailVerificationExpiry");

   const options = {
    httpOnly : true ,
    secure: process.env.NODE_ENV === "production"
   }
   return res 
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
      new APiResponse(200,loggedinUser,"user is  login successfully")
    )
})

export{
  registerUser, 
  verifyEmail,
  loginUser,



    
}

