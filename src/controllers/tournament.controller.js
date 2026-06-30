import { Tournament } from "../models/tournament.model.js";
import { asyncHandler } from "../utlis/asyncHandler.js";
import { ApiError } from "../utlis/ApiError.js";
import { ApiResponse } from "../utlis/ApiResponse.js";
import { uploadOnCloudinary } from "../utlis/cloudinary.js";

const createTournament=asyncHandler(async(req,res)=>{
const {name,description,location,startDate,endDate,registrationDeadline,tournamentType,maxTeams}=req.body;
if(!name||!location||!startDate||!endDate||!registrationDeadline||!maxTeams){
    throw new ApiError(400,"All fields are required")
}
if(new Date(registrationDeadline)>=new Date(startDate)){
    throw new ApiError(400,"Registration deadline must be before starting date")
}
if(new Date(startDate)>=new Date(endDate)){
    throw new ApiError(400,"Enddate must be after starting date")
}
const bannerLocalPath=req.file?.path;
let banner="";
if(bannerLocalPath){
const uploadedBanner=await uploadOnCloudinary(bannerLocalPath);
if(!uploadOnCloudinary){
    throw new ApiError(500,"Banner upload is failed")
}
banner =uploadedBanner.url
}
const tournament=await Tournament.create({
    name,description,location,banner,startDate,endDate,registrationDeadline,tournamentType,maxTeams,creator:req.user._id
})

return res
.status (201).json(
    new ApiResponse(201,"Tournament created successfully",tournament)
)
})
const getAllTournaments=asyncHandler(async(req,res)=>{
const tournaments=await Tournament.find().populate("creator","fullName username email")
.sort ({createdAt:-1})
return res
.status(200).json(
    new ApiResponse(200,"Tournaments fetched successfully",tournaments)
)
})
const getTournamentById= asyncHandler(async(req,res)=>{
    const {id}=req.params
    const tournament=await Tournament.findById(id).populate("creator","fullName usename email")
    if(!tournament){
        throw new ApiError(
            404,"Tournament not found"
        )
    }
   return res.status(200).json(
    new ApiResponse(200,"Tournament fetched successfullly",tournament)
   )

})
const updateTournament=asyncHandler(async(req,res)=>{
  const { id } =req.params;
  const tournament=await Tournament.findById(id);
  if(!tournament){
    throw new ApiError(404,"Tournament not found")
  }
  if(tournament.creator.toString()!==req.user._id.toString()){
    throw  new ApiError(
        403,"You are not authorized"
    )
  }
  let banner=tournament.banner;
  if(req.file?.path){
    const uploadedBanner=await uploadOnCloudinary(req.file.path);
    if(!uploadedBanner){
        throw new ApiError(500,"Banner upload failed")
    }
    banner=uploadedBanner.url;
  }
  const updatedTournament= await Tournament.findByIdAndUpdate(
    id,{
        $set:{
          ...req.body,
          banner
        }
    },
    {
        returnDocument: "after"
    }
)
return res.status(200).json(
    new ApiResponse(
        200,"Tournament updated successfully",updatedTournament
    )
)
  
})
const deleteTournament=asyncHandler(async(req,res)=>{
 const {id} =req.params;
  const tournament=await Tournament.findById(id);
  if(!tournament){
    throw new ApiError(404,"Tournament not found")
  }
  if(tournament.creator.toString()!==req.user._id.toString()){
    throw  new ApiError(
        403,"You are not authorized"
    )
  }
  await tournament.deleteOne();
  return res.status(200).json(
    new ApiResponse(
        200,"Tournament deleted successfully",{}
    )
  )
})
export {createTournament,getAllTournaments,getTournamentById,updateTournament,deleteTournament}