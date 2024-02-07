import { asyncHandler } from "../utlis/AsyncHandler.js"
import { ApiError } from "../utlis/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utlis/cloudinary.js"
import { ApiResponse } from "../utlis/ApiResponse.js"



const registerUser = asyncHandler(async (req, res) => {

    /*
      1 get userdetails from frontend (react+vanilajs )form or postmen API (testing tools)
      2.validation-check data is comming from  the frontend should not empty
      3.check the user already exists -check the basis of  email or username
      4.check for images and check for avatar and then upload to the cloudinary (CDN )
      5. then create a user object for store data in the mongodb 
      6.remove password and refresh token from response 
      7.check for user creation
      8.return response using ApiResponse
        


      //  res.send({ status: "ok data is recived in backend" })

    // if(fullName===""){
    //  throw new ApiError(400,"full name is required")
    // }
         // console.log("email", email)
      */

    const { fullName, email, username, password } = req.body

    if (

        [fullName, email, username, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(400, "full fields is required")

    }


    const currentUser = await User.findOne({ $or: [{ username }, { email }] })

    if (currentUser) {
        throw new ApiError(409, "user and email already exists")
    }
 

    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    let coverImageLocalPath
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path

    }


    if (!avatarLocalPath) throw new ApiError(400, "avatar file is required")

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) throw new ApiError(400, "avatar file is required")


    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username:username.toLowerCase(),
        email,
        password,

    })

    const newCreatedUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!newCreatedUser) {
        throw new ApiError(500, "somthing is wrong when register a user")
    }


    return res.status(201).json(
        new ApiResponse(200, newCreatedUser, "user create successfully")
    )


})

export { registerUser }