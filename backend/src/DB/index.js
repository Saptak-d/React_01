import mongoose from "mongoose"

const dbConnect = async()=>{
   try {
     await mongoose.connect(process.env.DB_URL);
     console.log("connect to DB");
   } catch (error) {
        console.log("the DB connection failed ",error)
        process.exit(1);
   }
}

export default dbConnect;