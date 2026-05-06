import  {validationResult}  from "express-validator"
import {ApiError} from "../utils/api-error.js"
import fs from "fs/promises";


 export const validator = async(req, res, next) => {
  const errors = validationResult(req);

  if(errors.isEmpty()){
            return next()
         }
   const  extractedError = errors.array().map(err =>({
     [err.path] : err.msg
   }));

    if (req.file?.path) {
       await fs.unlink(req.file?.path);
    }

    throw new ApiError(422,"Recieved data is not valid",extractedError)
  
};
