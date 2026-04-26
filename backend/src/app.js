import  express from  "express"
const app = express();
import cookieParser from "cookie-parser";

app.use(express.json());
app.use(cookieParser())

export default app;
