import {asyncHandler} from "../utlis/asyncHandler.js";
import {ApiError} from "../utlis/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utlis/cloudinary.js";
import {ApiResponse} from "../utlis/ApiResponse.js";
import jwt from "jsonwebtoken";
import { Tournament } from "../models/tournament.model.js";
import { Team } from "../models/team.model.js";
import { Match } from "../models/match.model.js";
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating refresh and access token"
        );
    }
};
const registerUser=asyncHandler(async(req,res,next)=>{
 const {fullName,email,username,password}=req.body;
 if ([fullName,email,username,password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Please provide all required fields");
 }
const existedUser=await User.findOne({$or:[{email}, {username}]});
if(existedUser){
    throw new ApiError(400,"User already exists with this email or username");
}
const avatarLocalFilePath=req.files?.avatar?.[0]?.path;
if (!avatarLocalFilePath) {
    throw new ApiError(400, "Avatar is required");
}
const avatar=await uploadOnCloudinary(avatarLocalFilePath);
if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar");
}
const newUser=await User.create({
    fullName,email,username:username.toLowerCase(),password,
    avatar:avatar.url
});
const createdUser=await User.findById(newUser._id).select("-password -refreshToken");
if(!createdUser) {
    throw new ApiError(500,"Failed to create user");
}   
return res.status(201).json(new ApiResponse(201,"User registered successfully",createdUser));
})
const loginUser=asyncHandler(async(req,res)=>{
const {email,username,password}=req.body;
if(!(username||email)){
    throw new ApiError(400,"Please provide username or email");
}
if (!password){
    throw new ApiError(400,"Please provide password");
}
const user=await User.findOne({$or:[{email},{username}]});
if(!user){
    throw new ApiError(404,"User not found");
}
const isPasswordCorrect=await user.isPasswordCorrect(password);
if(!isPasswordCorrect){
    throw new ApiError(401,"Invalid password");
}
const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id);
const loggedInUser=await User.findById(user._id).select("-password -refreshToken");
const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
}
return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            "User logged in successfully", {
                user: loggedInUser,
                accessToken,
                refreshToken,
            }
        )
    );
})
const logoutUser=asyncHandler(async(req,res)=>{
await User.findByIdAndUpdate(req.user._id,{ $set: { refreshToken: undefined } },{new:true});
const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
}
    return res
    .status(200 )
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,"User logged out successfully",{}));
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const { accessToken, refreshToken } =
            await generateAccessAndRefreshTokens(user._id);

        const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
}
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    "Access token refreshed successfully",
                     {
                        accessToken,
                        refreshToken,
                    }
                )
            );

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});
const getCurrentUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id)
        .select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const totalTournaments = await Tournament.countDocuments({
        creator: req.user._id,
    });

    const totalTeams = await Team.countDocuments({
        createdBy: req.user._id,
    });

    const totalMatches = await Match.countDocuments({
        createdBy: req.user._id,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            "Profile fetched successfully",
            {
                user,
                totalTournaments,
                totalTeams,
                totalMatches,
            }
        )
    );

});
const updateUserProfile = asyncHandler(async (req, res) => {

    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullName,
                email,
            },
        },
        {
            returnDocument: "after"
        }
    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(
            200,
            "Profile updated successfully",
             user,
        )
    );
});
const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    const isPasswordCorrect =
        await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(
            400,
            "Old password is incorrect"
        );
    }

    user.password = newPassword;

    await user.save({
        validateBeforeSave: false,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            
            "Password changed successfully",{}
        )
    );
});
export {registerUser,loginUser,logoutUser,refreshAccessToken,getCurrentUser,updateUserProfile,changeCurrentPassword
};