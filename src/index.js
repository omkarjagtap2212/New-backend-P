// require("dotenv").config({path:"./env"})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path:"./env"
})


const PORT=process.env.PORT || 7000



connectDB()
.then(()=>{
    app.listen(PORT,()=>console.log("your server has been started at :",PORT))
    

})
.catch((err)=>{
    console.log("mongodb connection has been failed.!!",err)

})

































































// import mongoose from "mongoose";
// import { DB_NAME } from "./constants"

// import express from "express"

// const app =express()



// (async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error", (error) => {
//             console.log("error", error)
//             throw error
//         })

//     app.listen(process.env.PORT,()=>console.log(`server is up  ${process.env.PORT}`))


//     } catch (error) {
//         console.error("ERROR", error)
//         throw error


//     }


// })()







