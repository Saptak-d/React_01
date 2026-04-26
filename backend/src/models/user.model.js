import mongoose, { Schema }  from "mongoose";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const userSchema = new Schema({
   avatar : {
    url : {
        type : String ,
        default : "https://placehold.co/600x400",
    },
    public_id : {
        type : String
    }
   },
   username : {
    type : String ,
    required : true,
    unique : true,
    lowercase : true ,
    trim : true,
   },
   email : {
    type : String ,
    required : true ,
    unique : true ,
    trim : true,
  },
  fullName : {
    type : string ,
    required : true ,
    trim : true,
  },
  password : {
    type : String ,
    require : [true ,"password is mandatory"]
  },
  isEmailVerified : {
    type : Boolean ,
    default : false,
  },
  forgotpasswordToken : {
    type : String,
  },
  forgotpasswordExpiry : {
    type : Date
  },
  refreshToken : {
    type : String,
  },
  emailVerificationToken : {
         type : String
    },  
 emailVerificationExpiry :{
        type : Date    
    },
},{timestamps : true})

userSchema.pre("save", async function (next) {
   if(!this.isModified("password")){
      return next()
   }
   this.password = await bcrypt.hash(this.password, 10);
   next();
});

userSchema.methods.ispasswordCorrect = async function (password) {
   return await bcrypt.compare(this.password,password)
}

userSchema.methods.generateAccessToken = function(){
  return jwt.sign({
    id : this.id,
    email : this.email,
    username : this.username,
  },
  process.env.ACCESS_TOKEN_SECRET,
  {expiresIn : process.env.ACCESS_TOKEN_EXPIRY}
)
}

userSchema.methods.generateRefereshToken = function(){
  return jwt.sign({
    id : this._id,
    email : this.email,
    username : this.username
  },
  process.env.REFRESH_TOKEN_SECRET,
{expiresIn : process.env.REFRESH_TOKEN_EXPIRY})
}

userSchema.methods.generateTemporaryToken = function(){
  const unhashedToken = crypto.randomBytes(20).toString("hex");
  const hashToken = crypto.createHash("sha256").update(unhashedToken).digest("hex");
  const tokenExpiary = Date().now() + (20 * 60 * 1000)
  return {unhashedToken, hashToken , tokenExpiary}
}
export const  User = mongoose.model("User",userSchema);