import mongoose from "mongoose";
import { DB_NAME } from "../constants.js"



const connectDB = async () => {
    try {
        const connectInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        // console.log(connectInstance)im
        console.log(`\n MongoDB connected !! DB HOST :${connectInstance.connection.host}`)

    } catch (error) {
        console.log("db connection error", error)
        process.exit(1)

    }
} 

export default connectDB