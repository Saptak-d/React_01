import  express from  "express"
const app = express();
import cookieParser from "cookie-parser";

app.use(express.json());
app.use(cookieParser())

import authRouter from "./routes/auth.routes.js"
app.use("/api/v1/auth",authRouter);









app.use((err,req,res,next)=>{
    const statusCode  = err.statusCode || 500 
    console.log(err)
    res.status(statusCode).json(
        {
            success : false ,
            message : err.message,
            errors  : err || {}
        }
    )
})


export default app;
