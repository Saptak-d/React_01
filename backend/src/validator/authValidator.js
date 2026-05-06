import {param,body} from  "express-validator"

const registerValidator = ()=>{
 return[
    body("email")
     .trim()
     .isEmpty().withMessage("Email is required")
     .isEmail().withMessage("Email is invalid"),

     body("username")
      .trim()
      .isEmpty().withMessage("The username is Required")
      .isLength({min : 3}).withMessage("The user name should be greater then 3 character")
      .isLength({max : 13}).withMessage("The username should be within 13 chara="),

    body("fullname")
      .trim()
      .isEmpty().withMessage("The Fullname is Required")
      .isLength({min : 3}).withMessage("The user name should be greater then 3 character")
      .isLength({max : 13}).withMessage("The username should be within 13 chara="),

    body("password")
      .trim()
      .isEmpty().withMessage("The password is required")
      .isLength({ min: 4 }).withMessage("Password should be at least 4 characters")
      .isLength({ max: 13 }).withMessage("Password can't exceed 13 characters"),
 ]
}
export{
    registerValidator,
    
}