import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; 

const videoSchema = new mongoose.Schema({


    videoFile: {
        type: String,
        required: [true, "file is required"],

    },

    thumbnail: {
        type: String,
        required: true,

    },

    title: {
        type: String,
        required: true,

    },

    description: {
        type: String,
        required: true,

    },
    duration: {
        type: String,  //get form clodinaryurl
        required: true,

    },
    views: {
        type: Number,  //get form clodinaryurl
        default: 0

    },
    isPublished: {
        type: Boolean,  
        default: true

    },

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }





}, { timestamps: true })

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)