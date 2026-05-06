import { Router } from "express";
import {upload} from "../middleware/multer.js"
import {registerUser} from "../controller/user.controller.js"
import {registerValidator} from "../validator/authValidator.js"
import {validator} from "../middleware/validator.middleware.js"
const router  = Router();

router.route("/register")
    .post(upload.single("avatar"),
     registerValidator(),
     validator,
     registerUser,
)

 export default router;