import mongoose ,{Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const playListSchema = new Schema({
    name : {
        type : String ,
        require : true
    },
    description  :{
        type : String ,
        require : true 
    },
    videos :[ {
        type  : Schema.Types.ObjectId ,
        ref : "Video"
    }],
    onwer : {
        type : Schema.Types.ObjectId ,
        ref  : "User"
    }


},{timestamps : true})


export const PlayList = mongoose.model("PlayList" , playListSchema)