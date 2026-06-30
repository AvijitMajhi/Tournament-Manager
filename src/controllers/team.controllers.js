import { Team } from "../models/team.model.js";
import { Tournament } from "../models/tournament.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
const createTeam = asyncHandler(async (req, res) => {

    const {
        name,
        shortName,
        coach,
        captain,
        tournament,
    } = req.body;

    if (
        !name ||
        !shortName ||
        !captain ||
        !tournament
    ) {
        throw new ApiError(
            400,
            "All fields are required"
        );
    }

    const existingTournament =
        await Tournament.findById(tournament);

    if (!existingTournament) {
        throw new ApiError(
            404,
            "Tournament not found"
        );
    }

    if (
        new Date() >
        new Date(existingTournament.registrationDeadline)
    ) {
        throw new ApiError(
            400,
            "Registration has closed"
        );
    }

    const totalTeams =
        await Team.countDocuments({
            tournament,
        });

    if (
        totalTeams >=
        existingTournament.maxTeams
    ) {
        throw new ApiError(
            400,
            "Tournament is already full"
        );
    }

    const existedTeam =
        await Team.findOne({
            name,
            tournament,
        });

    if (existedTeam) {
        throw new ApiError(
            409,
            "Team already exists in this tournament"
        );
    }

    let logo = "";

    if (req.file?.path) {

        const uploadedLogo =
            await uploadOnCloudinary(req.file.path);

        if (!uploadedLogo) {
            throw new ApiError(
                500,
                "Logo upload failed"
            );
        }

        logo = uploadedLogo.url;
    }

    const team = await Team.create({

        name,
        shortName: shortName.toUpperCase(),
        logo,
        coach,
        captain,
        tournament,
        createdBy: req.user._id,

    });

    return res.status(201).json(

        new ApiResponse(

            201,

            team,

            "Team created successfully"

        )

    );
});
const getAllTeams = asyncHandler(async (req, res) => {

    const teams = await Team.find()
        .populate("tournament", "name")
        .populate("createdBy", "fullName username")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            teams,
            "Teams fetched successfully"
        )
    );

});
const getTeamById = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const team = await Team.findById(id)
        .populate("tournament", "name")
        .populate("createdBy", "fullName username");

    if (!team) {
        throw new ApiError(404, "Team not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            team,
            "Team fetched successfully"
        )
    );

});
const updateTeam = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const team = await Team.findById(id);

    if (!team) {
        throw new ApiError(404, "Team not found");
    }

    if (team.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized"
        );
    }

    let logo = team.logo;

    if (req.file?.path) {

        const uploadedLogo =
            await uploadOnCloudinary(req.file.path);

        if (!uploadedLogo) {
            throw new ApiError(
                500,
                "Logo upload failed"
            );
        }

        logo = uploadedLogo.url;
    }

    const updatedTeam = await Team.findByIdAndUpdate(
        id,
        {
            $set: {
                ...req.body,
                logo,
            },
        },
        {
            returnDocument: "after",
            runValidators: true,
        }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedTeam,
            "Team updated successfully"
        )
    );

});
const deleteTeam = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const team = await Team.findById(id);

    if (!team) {
        throw new ApiError(404, "Team not found");
    }

    if (team.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized"
        );
    }

    await team.deleteOne();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Team deleted successfully"
        )
    );

});
 export {createTeam,getAllTeams,getTeamById,updateTeam,deleteTeam}