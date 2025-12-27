import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinari.js"
import { ApiResponse } from "../utils/ApiRespone.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId)
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

  // console.log("this is you req.body  " + req.body);

  console.log(email);


  if (!(userName || email)) {
    throw new ApiError(404, "email or userName is required")
  }


  const user = await User.findOne(
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

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request")
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET 
    )

    // console.log(decodedToken);
    

    const user = await User.findById(decodedToken?._id)

    if (!user) {
      throw new ApiError(401, "Invalid refresh token")
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used")

    }

    const options = {
      httpOnly: true,
      secure: true
    }

    const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  }

})

const ChangeUserPassword = asyncHandler(async (req, res) => {
  // const { oldPassword, newPassword } = req.body
  const {oldPassword,newPassword } = req.body ||{}

  // console.log(oldPassword);
  

  const user = await User.findById(req.user?.id)
  // console.log(user);
  

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invaild old Password")
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Change successfully "))

})

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(400, "user does not exsit")
  }

  return res
    .status(400)
    .json(new ApiResponse(400, { user }, "get currect user successfully"))

})

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body

  if (!(fullname || email)) {
    throw new ApiError(200, "full Name or email required")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email
      }
    },
    { new: true }
  ).select("-password")

  return res
    .status(400)
    .json(new ApiResponse(400, user, "account Details update successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {

  const avatarLocalPath = req.file?.path

  console.log("i am here : " + req.file);
  

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing")
  }


  //  const oldavatr = User.findById(res.user?._id)
  // delete old avatr image

  // deleteFromCludinary()

  const uploaded = await uploadOnCloudinary(avatarLocalPath)

  // console.log("hello i am here : " + avatr.url);

  console.log("current user : ", req.user?._id);
  
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avtar: uploaded.url
      }
    },
    { new: true }
  )

  // console.log(avatr.url);
  
  return res
    .status(200)
    .json(new ApiResponse(200, user, "avatr image update successfully"))
})


const updateUserCouverImage = asyncHandler(async (req, res) => {

  const coverImageLocalPath = req.file?.path

  console.log("here is file from req " + req?.file);
  

  if (!coverImageLocalPath) {
    throw new ApiError(400, "cover image file is missing")
  }


  //  const oldavatr = User.findById(res.user?._id)
  // delete old avatr image

  // deleteFromCludinary()

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url
      }
    },
    { new: true }
  )

  console.log("i come  hare");
  

  return res
    .status(200)
    .json(new ApiResponse(200, user, "cover image update successfully"))



})


const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params

  if (!username?.trime()) {
    throw new ApiError(400, "user name is missing")
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channal",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscribers",
        localField: " _id",
        foreignField: " subscriber",
        as: "subscribeTo"
      }
    },

    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribsToCount: {
          $size: "$subscribeTo"
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        fullName: 1,
        userName: 1,
        subscribersCount: 1,
        channelsSubscribsToCount: 1,
        isSubscribed: 1,
        avatr: 1,
        coverImage: 1,
        email: 1
      }
    }
  ])

  if (!channel?.length) {
    throw new ApiError(404, " channel  does not exists")
  }

  return res
    .status(200).
    json(new ApiResponse(200, channel[0], "User Channel featched successfully"))

})

const getUserWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id ",
              as: " owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatr: 1
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      $addFields: {
        owner: {
          $first: $owner
        }
      }
    }
  ])

  return res
    .status(200)
    .json(new ApiResponse(200, user[0], "Watch hitory featched successFully"))
})



export {
  registerUser,
  loginUser,
  logout,
  refreshAccessToken,
  ChangeUserPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCouverImage,
  getUserChannelProfile,
  getUserWatchHistory
}