import { asyncHandler } from "../utlis/AsyncHandler.js"

const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "master orj is in a scene"
    })



})

export {registerUser}