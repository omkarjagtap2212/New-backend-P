import { asyncHandler } from "../utlis/AsyncHandler.js"
import { ApiError } from "../utlis/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utlis/cloudinary.js"
import { ApiResponse } from "../utlis/ApiResponse.js"
import jwt from "jsonwebtoken"


const generateAccessTokenandrefreshTokens = async (userId) => {
    try {

        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "somthing went wring while genrating refresh and accessing tokens")

    }

}


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
        username: username.toLowerCase(),
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



const loginUser = asyncHandler(async (req, res) => {

    // const {email,password} =req.body
    //req.body-data
    //access basis of username or email
    //check user 
    //password compare 
    //access and refresh token
    //send cookie
    //if ok get user email or username  or _id
    //and then give to access of token

    const { email, username, password } = req.body

    if (!(username || email)) {
        throw new ApiError(400, "username or password is required")

    }

    const user = await User.findOne({ $or: [{ email }, { username }] })

    if (!user) {
        throw new ApiError(404, "user does not exists")
    }

    const isPaswordvalid = await user.isPaswordCorrect(password)

    if (!isPaswordvalid){
        throw new ApiError(401, "invalid user credential")

    }
    const { accessToken, refreshToken } = await generateAccessTokenandrefreshTokens(user._id)

    const loginedUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loginedUser, accessToken, refreshToken
            }, "user logged  In successfully")
        )
})



const LoggedOutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )


    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "user looged successfully"))


})



const refreshAccessToken=asyncHandler(async(req,res)=>{

 const incomingRefreshToken=  req.cookies?.refreshToken|| req.body.refreshToken

 if(!incomingRefreshToken) throw new ApiError(401,"unauthorized request ")

try {
    
     const decodedToken = jwt.verify(incomingRefreshToken, process.env.ACCESS_TOKEN_SECRET)
    
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
     if(!user) throw new ApiError(401,"invalid refresh token ")
    
    // const matchRefreshToken
    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401,"refresh token is expired or used")
    }
    
    const options ={
        httpOnly:true,
        secure:true
    }
    
     const {accessToken,newRefreshTokens}=await generateAccessTokenandrefreshTokens(user._id)
     
     return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", newRefreshTokens, options)
    .json(
        new ApiResponse(
            200,
           {accessToken, refreshToken:newRefreshTokens},
            "Access Token Refreshed"
            )
    )
} catch (error) {
    new ApiError(401,error?.message||"invalid refresh token")
    
}

 

})

export { registerUser, loginUser, LoggedOutUser,refreshAccessToken }