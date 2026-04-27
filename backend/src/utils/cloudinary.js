import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"
import {ApiError} from "./api-error.js"


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET ,
});

const uploadCloudinary = async(localFilepath)=>{
      const fixedPath = localFilepath.replace(/\\/g, "/")
    try {
        if(!localFilepath){
            throw new ApiError(500,"the image path is not found")
        }
        const response = await cloudinary.uploader.upload(fixedPath,{
            resource_type : "auto",
            folder: "task_attachments",
             type: "upload",       
            access_mode: "public",   
             use_filename: true,
             unique_filename: true,
        })

        fs.unlinkSync(fixedPath);
        return response;

    } catch (error) {
        console.log("cloudinary Error-",error);
        fs.unlinkSync(fixedPath);
        console.log("file is removed")
    }
};

const  deleteOnCloudinary = async(public_id , resource_type = "image")=>{
 
    try {
        if(!public_id){
            throw new ApiError(500,"the public id is required")
        }
        const response = await cloudinary.uploader.destroy(public_id, {resource_type});

        if(response.result !== "ok" && response.result !== "not found"){
            throw new ApiError(500,"internal server Error")
        }
        return response;
         
    } catch (error) {
        console.log("cloudinary Deletation Error---",error);
    }

}

export {
    uploadCloudinary,
    deleteOnCloudinary,
}