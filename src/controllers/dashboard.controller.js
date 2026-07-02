import { Tournament } from "../models/tournament.model.js";
import { Team } from "../models/team.model.js";
import { Match } from "../models/match.model.js";
import { asyncHandler } from "../utlis/asyncHandler.js";
import { ApiResponse } from "../utlis/ApiResponse.js";

const getDashboard = asyncHandler(async (req, res) => {

    const creator = req.user._id;

    const totalTournaments = await Tournament.countDocuments({
        creator
    });

    const tournamentIds = await Tournament.find({
        creator
    }).distinct("_id");

    const totalTeams = await Team.countDocuments({
        tournament: { $in: tournamentIds }
    });

    const totalMatches = await Match.countDocuments({
        tournament: { $in: tournamentIds }
    });

    const completedMatches = await Match.countDocuments({
        tournament: { $in: tournamentIds },
        status: "Completed"
    });

    const upcomingMatches = await Match.countDocuments({
        tournament: { $in: tournamentIds },
        status: "Scheduled"
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            "Dashboard fetched successfully", {
                totalTournaments,
                totalTeams,
                totalMatches,
                completedMatches,
                upcomingMatches
            }
           
        )
    );

});
const getUpcomingMatches = asyncHandler(async (req, res) => {

    const tournamentIds = await Tournament.find({
        creator: req.user._id
    }).distinct("_id");

    const matches = await Match.find({
        tournament: { $in: tournamentIds },
        status: "Scheduled"
    })
    .populate("homeTeam", "name")
    .populate("awayTeam", "name")
    .sort({ matchDate: 1 })
    .limit(5);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Upcoming matches fetched successfully",matches
        )
    );

});
const getRecentResults = asyncHandler(async (req, res) => {

    const tournamentIds = await Tournament.find({
        creator: req.user._id
    }).distinct("_id");

    const matches = await Match.find({
        tournament: { $in: tournamentIds },
        status: "Completed"
    })
    .populate("homeTeam", "name")
    .populate("awayTeam", "name")
    .sort({ updatedAt: -1 })
    .limit(5);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Recent results fetched successfully", matches
        )
    );

});
export { getDashboard, getUpcomingMatches, getRecentResults };