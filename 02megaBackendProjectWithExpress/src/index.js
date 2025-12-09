import dotenv from "dotenv" ; 
import connectDB from "./db/dbConn.js";
import { app } from "./app.js";
// import log from "cros/common/logger.js";

dotenv.config({
    path : './'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running on the ${process.env.PORT}`);
        
    })
})
.catch((error)=>{
console.log(error);

})






/*

(async ()=>{
    try {
        mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERROR : ", error);
            throw error
            
        })

        app.listen(process.env.PORT , ()=>{
            console.log(`app is listening on port ${process.env.PORT}`);
            
        })
        
    } catch (error) {
        console.error(error)
        throw err
    }
})()

*/