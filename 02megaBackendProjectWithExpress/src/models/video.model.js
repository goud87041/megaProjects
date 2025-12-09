import mongoose ,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile :{
        type : String , // coludnary URL
        required : true 
    },
    thumbnail : {
        type : String ,
        required : true
    },
     title : {
        type : String ,
        required : true
    },
     discription : {
        type : String ,
        required : true
    },
    duration : {
        type : Number , // coludnary URL 
        required : true
    },
    views : {
        type : Number ,
        // required : true ,
        default : 0
    }


},{timestamps : true})

videoSchema.plugin(mongooseAggregatePaginate)


export const Video = mongoose.model("Video", videoSchema)