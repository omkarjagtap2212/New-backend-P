import { Router } from "express";
import { LoggedOutUser, changeCurrentPassword, getCurrentUserhandle, getUserChannelprofile, getWatchHistory, loginUser, refreshAccessToken, registerUser, updateAccountdetails, updateCoverImage, updateuserAvatar } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { VerfityJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",

            maxCount: 1
        },
        {
            name:"coverImage",
            maxCount:1


        }
    ]),

    registerUser
)

router.route("/login").post(loginUser)


router.route("/logout").post( VerfityJWT, LoggedOutUser)

router.route("/refeshToken").post(refreshAccessToken)

router.route("/changePassword").post(VerfityJWT,changeCurrentPassword)

router.route("/cuurentUser").get(VerfityJWT,getCurrentUserhandle)

router.route("/updateAccount").patch(VerfityJWT,updateAccountdetails)

router.route("/avatar").patch(VerfityJWT,upload.single("avatar"),updateuserAvatar)

router.route("/coverImage").patch(VerfityJWT,upload.single("coverImage"),updateCoverImage)

router.route("/c/:username").get(VerfityJWT,getUserChannelprofile)

router.route("/userHistory").get(VerfityJWT,getWatchHistory )









export default router