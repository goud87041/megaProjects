import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinari.js"
import { ApiResponse } from "../utils/ApiRespone.js"

const registerUser = asyncHandler( async (req,res)=>{
    //  res of fullName ,email ,password avtar coverimage
    // check validation all field is not empty
    // check if user or email already exist in the database
    // check avatar and imagag
    // send avatar and cover image to the cloudnary 
    // create user object  - create entry in the DB
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const { fullName , email , password , userName } = req.body

    console.log("email" , email);


    if([fullName,email,password,userName].some((fileds)=>
      fileds?.trim() === ""
    )){
      throw new ApiError(408, "all fileds are required")
    }

    const isUserExsited = User.findOne({
      $or : [ { userName }, { email }]
    })

    if(isUserExsited){
      throw new ApiError(409,"userName or email already exist")
    }


    const avatarLocalPath = req.files?.avatar[0]?.path ;
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
      throw new ApiError(408 , "Avatar file is required")
    }

   const avatar =  await uploadOnCloudinary(avatarLocalPath)
   const coverImg = await uploadOnCloudinary(coverImageLocalPath)

   if(!avatar){
    throw new ApiError(400 , "Avatar file is required")
   }

   const user = await User.create({
    fullName,
    avatar : avatar.url,
    coverImage : coverImg?.url || "",
    userName : userName.toLowerCase(),
    email,
    password,

   })

   const createUser =  User.findById(user._id).select("-password -refreshToken")

   if(!createUser) {
    throw new ApiError(500 , "some thing went worng while registring the user")
   }

   return res.status(400).json(
    new ApiResponse(200, createUser ,"user register successfuly")
   )




    

})

export  default registerUser