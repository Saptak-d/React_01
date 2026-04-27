import {User} from "../models/user.model.js"
import { ApiError } from "../utils/api-error.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import {APiResponse} from "../utils/api-response.js"
import {uploadCloudinary,deleteOnCloudinary} from "../utils/cloudinary.js"
import { sendmail ,verificationEmail} from "../utils/mail.js";

const registerUser = asyncHandler(async(req,res,next)=>{
   const{email,username,password, fullname} = req.body 
   const imageLocalPath  = req.file?.path;

   const existUser = await User.findOne({
      $or : [{email},{username}]
   })
   if(!existUser){
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

   const user = User.create({
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

  const {hashedToken , unHashedToken , tokenExpiry} = user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({validateBeforesave : false });

 
  try {
    await sendmail({
        email : user?.email,
        subject : "please verify your email",
        mailGenContent : verificationEmail(user.username, `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`)
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

export{registerUser, 
    
}

