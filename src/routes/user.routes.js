import { Router } from "express";
import { LoggedOutUser, loginUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
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

router.route("/refesh-token").post(refreshAccessToken)


export default router