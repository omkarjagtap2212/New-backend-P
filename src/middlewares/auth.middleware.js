import { User } from "../models/user.model.js";
import { ApiError } from "../utlis/ApiError.js";
import { asyncHandler } from "../utlis/AsyncHandler.js";
import Jwt from "jsonwebtoken";

export const VerfityJWT = asyncHandler(async (req, res, next) => {
    try {

        const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        console.log(token)

      
        if (!token) throw new ApiError(401, "unauthorized request")

        const decodedToken = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        //   console.log(decodedToken)  

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) throw new ApiError(401, "invalid access token")

        req.user = user
        next()

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new ApiError(401, "token alerady expired")
        }
        else {

            throw new ApiError(401, error?.message || "invalid access token")

        }


    }


})

