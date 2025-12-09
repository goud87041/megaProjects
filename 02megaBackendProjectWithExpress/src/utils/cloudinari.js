import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

// import { v2 as cloudinary } from 'cloudinary';

 

    // Configuration
    cloudinary.config({ 
        cloud_name: 'dpapxys1s', 
        api_key: '437144422945768', 
        api_secret: '<your_api_secret>' // Click 'View API Keys' above to copy your API secret
    });


    const uploadOnCloudinary = async (localFilePath)=>{
        try {
            if(!localFilePath) return null ;
            const response = await cloudinary.uploader.upload(localFilePath,{
                resource_type : "auto"
            })

            fs.unlink(localFilePath)
            return response
        } catch (error) {
            fs.unlinkSync(localFilePath)
            return null ;
        }
    }
    
     
    export {uploadOnCloudinary}