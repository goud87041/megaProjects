import dotenv from "dotenv" ; 
import connectDB from "./db/dbConn.js";

dotenv.config({
    path : './'
})

connectDB()






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