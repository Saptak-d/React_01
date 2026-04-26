import "dotenv/config";
import app  from "./app.js";
import  dbConnect from "./DB/index.js"
import { connect } from "mongoose";

const port = process.env.port || 8080;

dbConnect()
.then(()=>{
    app.listen(port,()=>{
        console.log("server is running or port",port)
    })
}).catch((err)=>{
    console.error("mongoDb connection Error",err);
    process.exit(1);
});

