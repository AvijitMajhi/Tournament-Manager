import { Match } from "../models/match.model.js";
import { Team } from "../models/team.model.js";
import { Tournament } from "../models/tournament.model.js";
import { generateLeagueFixtures } from "../services/leagueFixture.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const createMatch = asyncHandler(async (req, res) => {

    const {
        tournament,
        homeTeam,
        awayTeam,
        matchDate,
        venue,
        round,
    } = req.body;

    if (
        !tournament ||
        !homeTeam ||
        !awayTeam ||
        !matchDate ||
        !venue ||
        !round
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const tournamentExists = await Tournament.findById(tournament);

    if (!tournamentExists) {
        throw new ApiError(404, "Tournament not found");
    }

    const home = await Team.findById(homeTeam);
    const away = await Team.findById(awayTeam);

    if (!home || !away) {
        throw new ApiError(404, "Team not found");
    }

    if (homeTeam.toString() === awayTeam.toString()) {
        throw new ApiError(
            400,
            "A team cannot play against itself"
        );
    }

    if (
        home.tournament.toString() !== tournament ||
        away.tournament.toString() !== tournament
    ) {
        throw new ApiError(
            400,
            "Teams do not belong to this tournament"
        );
    }

    const existingMatch = await Match.findOne({
        tournament,
        homeTeam,
        awayTeam,
        round,
    });

    if (existingMatch) {
        throw new ApiError(
            409,
            "Match already exists"
        );
    }

    const match = await Match.create({
        tournament,
        homeTeam,
        awayTeam,
        matchDate,
        venue,
        round,
        createdBy: req.user._id,
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            match,
            "Match created successfully"
        )
    );
});
const getAllMatches = asyncHandler(async (req, res) => {

    const matches = await Match.find()
        .populate("tournament", "name")
        .populate("homeTeam", "name shortName logo")
        .populate("awayTeam", "name shortName logo")
        .sort({ matchDate: 1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            matches,
            "Matches fetched successfully"
        )
    );

});
const getMatchById = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const match = await Match.findById(id)
        .populate("tournament", "name")
        .populate("homeTeam", "name shortName logo")
        .populate("awayTeam", "name shortName logo");

    if (!match) {
        throw new ApiError(
            404,
            "Match not found"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            match,
            "Match fetched successfully"
        )
    );

});
const updateMatch = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const match = await Match.findById(id);

    if (!match) {
        throw new ApiError(
            404,
            "Match not found"
        );
    }

    if (
        match.createdBy.toString() !==
        req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized"
        );
    }

    const updatedMatch =
        await Match.findByIdAndUpdate(
            id,
            {
                $set: req.body,
            },
            {
                new: true,
                runValidators: true,
            }
        )
        .populate("homeTeam", "name shortName")
        .populate("awayTeam", "name shortName");

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedMatch,
            "Match updated successfully"
        )
    );

});
const deleteMatch = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const match = await Match.findById(id);

    if (!match) {
        throw new ApiError(
            404,
            "Match not found"
        );
    }

    if (
        match.createdBy.toString() !==
        req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized"
        );
    }

    await match.deleteOne();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Match deleted successfully"
        )
    );

});
const generateFixtures=asyncHandler(async(req,res)=>{
     const {tournamentId}=req.body
     const tournament=await Tournament.findById(tournamentId)
     if(!tournament){
        throw new ApiError(404,"Tournament Not Found")
     }
     if(tournament.tournamentType!=="League"){
        throw new ApiError(
            400,"Only Leauge Tournament supported currently"
        )
     }
     const teams=await Team.find({
        tournament:tournamentId
     })
     if(teams.length<2){
        throw new ApiError(
            400,"Atleast two teams required"
        )
     }
   let fixtures=[];

switch(tournament.tournamentType){

    case "League":

        fixtures=
        generateLeagueFixtures(
            teams
        );

        break;

    case "Knockout":

        fixtures=
        generateKnockoutFixtures(
            teams
        );

        break;

    case "League + Knockout":

        fixtures=
        generateLeagueKnockoutFixtures(
            teams
        );

        break;

    default:

        throw new ApiError(
            400,
            "Invalid tournament type"
        );

}
const matches=fixtures.map(
(match,index)=>({

    tournament:tournamentId,

    homeTeam:match.homeTeam,

    awayTeam:match.awayTeam,

    round:match.round,

    venue:tournament.location,

    matchDate:tournament.startDate,

    createdBy:req.user._id

}));

await Match.insertMany(fixtures);
return res.status(201).json(
    new ApiResponse(
        201,"Fixtures generated successfully",matches
    )
)
})
export {createMatch,getAllMatches,getMatchById,updateMatch,deleteMatch}