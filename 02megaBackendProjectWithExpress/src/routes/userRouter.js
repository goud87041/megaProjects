import { Router } from "express";
// import {registerUser} from "../controllers/user.controllers.js";
import {registerUser,loginUser} from "../controllers/user.controllers.js"
import {logout} from "../controllers/user.controllers.js"
import {upload} from "../middlewares/multer.midware.js"
import { verifyJWT } from "../middlewares/auth.midware.js";


const router = Router();

router.route("/register").post(
    upload.fields(
        [
            {
                name: "avtar",
                maxCount : 1
            },
            {
                name: "coverImage",
                maxCount : 1
            }
        ]),
    registerUser)


router.route("/login").post(upload.none(),loginUser)

router.route("/logOut").post(verifyJWT,logout)

export default router
