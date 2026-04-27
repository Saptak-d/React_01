import mongoose from "mongoose";
import {User} from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async(req,resizeBy,next)=>{
    try{
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","");
        if(!token){
            throw new ApiError(401,"The AccessToken is not found")
        }
        const dcrypetToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(dcrypetToken._id).select("-password -refreshToken");

        if(!user){
             throw new ApiError(401, "Invalid AccessToken ")
        }
        req.user = user;
        next();
    }catch(err){
        throw new ApiError(401,err.message || "invalid AccessToken")
    }
});