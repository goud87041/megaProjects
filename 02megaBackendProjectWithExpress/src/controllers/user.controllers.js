import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinari.js"
import { ApiResponse } from "../utils/ApiRespone.js"

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user =await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
  } catch (error) {
    throw new ApiError(500, "something went wrong when generating refresh and access token")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  //  res of fullName ,email ,password avtar coverimage
  // check validation all field is not empty
  // check if user or email already exist in the database
  // check avatar and imagag
  // send avatar and cover image to the cloudnary 
  // create user object  - create entry in the DB
  // remove password and refresh token field from response
  // check for user creation
  // return res


  const { fullname, email, password, userName } = req.body

  console.log("email", req.body);


  if ([fullname, email, password, userName].some((fileds) =>
    fileds?.trim() === ""
  )) {
    throw new ApiError(408, "all fileds are required")
  }

  console.log(User);


  const isUserExsited = await User.findOne({
    $or: [{ userName }, { email }]
  })

  if (isUserExsited) {
    throw new ApiError(409, "userName or email already exist")
  }



  const avatarLocalPath = await req.files?.avtar[0]?.path;
  console.log(req.files);

  // const coverImageLocalPath = req.files?.coverImage[0]?.path

  let coverImageLocalPath

  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
  }

  if (!avatarLocalPath) {
    throw new ApiError(408, "Avatar file is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImg = await uploadOnCloudinary(coverImageLocalPath)

  console.log(avatar);


  if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
  }

  const user = await User.create({
    fullname,
    avtar: avatar.url,
    coverImage: coverImg?.url || "",
    userName: userName.toLowerCase(),
    email,
    password,

  })

  const createUser = await User.findById(user._id).select("-password -refreshToken")

  if (!createUser) {
    throw new ApiError(500, "some thing went worng while registring the user")
  }

  return res.status(200).json(
    new ApiResponse(200, createUser, "user register successfuly")
  )






})


const loginUser = asyncHandler(async (req, res) => {

  // email, password -> body
  // find the user
  // check password 
  // access and refresh token 
  // send cookies




  const { email, userName, password } = req.body

  console.log(email);
  

  if (!userName || !email) {
    throw new ApiError(404, "email or userName is required")
  }


  const user =  await User.findOne(
    {
      $or: [{ email }, { userName }]
    }
  )

  if (!user) {
    throw new ApiError(401, "username or email not exist")
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(401, "invalid user credentials")
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

  const logedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: logedInUser, accessToken, refreshToken
        },
        "user Login successfully"
      )
    )





})


const logout = asyncHandler(async (req, res) => {
 await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:
      {
        refreshToken: undefined,
      }
    },
    {
      new: true
    }


  )

  const options = {
    htppOnly: true,
    secure: true
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(200, {}, "User logged Out ")
})





export   { registerUser, loginUser, logout }