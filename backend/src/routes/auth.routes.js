import { Router } from "express";
import {upload} from "../middleware/multer.js"
import {registerUser,verifyEmail} from "../controller/user.controller.js"
import {registerValidator,verifyEmailValidator} from "../validator/authValidator.js"
import {validator} from "../middleware/validator.middleware.js"
const router  = Router();

router.route("/register")
    .post(upload.single("avatar"),
     registerValidator(),
     validator,
     registerUser,
)

router.route("/verify-email/:verificationToken")
   .get(verifyEmailValidator(),validator,verifyEmail)

 export default router;