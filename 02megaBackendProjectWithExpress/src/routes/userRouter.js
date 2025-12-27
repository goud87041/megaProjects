import { Router } from "express";
// import {registerUser} from "../controllers/user.controllers.js";
import {
    registerUser,
    loginUser,
    ChangeUserPassword,
    getCurrentUser, 
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCouverImage, 
    getUserChannelProfile, 
    getUserWatchHistory,
    refreshAccessToken} from "../controllers/user.controllers.js"
import {logout} from "../controllers/user.controllers.js"
import {upload} from "../middlewares/multer.midware.js"
import { verifyJWT } from "../middlewares/auth.midware.js";
// import { VirtualType } from "mongoose";/


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


// secure routes 

router.route("/logOut").post(verifyJWT,logout)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT , ChangeUserPassword)
router.route("/current-user").get(verifyJWT , getCurrentUser)
router.route("/update-account").post(verifyJWT ,updateAccountDetails)

router.route("/avatar").post(verifyJWT,upload.single("avtar"),updateUserAvatar)
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCouverImage)

router.route("/channel/:username").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT,getUserWatchHistory)

                             

export default router
