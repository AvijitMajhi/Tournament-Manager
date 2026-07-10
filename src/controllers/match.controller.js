import { Match } from "../models/match.model.js";
import { Team } from "../models/team.model.js";
import { Tournament } from "../models/tournament.model.js";
import { generateLeagueFixtures } from "../services/leagueFixture.service.js";
import { generateKnockoutFixtures } from "../services/knockout.service.js";
import { asyncHandler } from "../utlis/asyncHandler.js";
import { ApiError } from "../utlis/ApiError.js";
import { ApiResponse } from "../utlis/ApiResponse.js";
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

const matchCount = await Match.countDocuments({
    tournament,
});

const match = await Match.create({
    tournament,
    homeTeam,
    awayTeam,
    matchDate,
    venue,
    round,
    matchNumber: matchCount + 1,
    createdBy: req.user._id,
});

    return res.status(201).json(
        new ApiResponse(
            201,
           
            "Match created successfully", match
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
            "Matches fetched successfully", matches
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
   const teamCount = await Team.countDocuments({
    tournament: tournamentId
});

if (teamCount < tournament.maxTeams) {
    throw new ApiError(
        400,
        "Tournament is not full yet."
    );
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

switch (tournament.tournamentType) {

    case "League":

        fixtures = generateLeagueFixtures(teams);

        // insertMany() here
        break;

    case "Knockout":

        const matches = await generateKnockoutFixtures(
            teams,
            tournament,
            req.user._id
        );

        return res.status(201).json(
            new ApiResponse(
                201,
                matches,
                "Knockout fixtures generated successfully"
            )
        );

    case "League + Knockout":
        // We'll implement this later
        break;
}
const matches=fixtures.map(
(match,index)=>({

    tournament:tournamentId,

    homeTeam:match.homeTeam,

    awayTeam:match.awayTeam,

    round:match.round,

    venue:tournament.location,

    matchDate:tournament.startDate,

    createdBy:req.user._id,
     
    matchNumber:index+1

}));

await Match.insertMany(matches);

return res.status(201).json(
    new ApiResponse(
        201,"Fixtures generated successfully",matches
    )
)
})
const updateMatchResult = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const { homeScore, awayScore } = req.body;

    const match = await Match.findById(id);
  
    if (!match) {
        throw new ApiError(404, "Match not found");
    }

    if (match.status === "Completed") {
        throw new ApiError(400, "Result already entered");
    }
const tournament = await Tournament.findById(match.tournament);
  if(tournament.creator.toString()!==req.user._id.toString()){
    throw  new ApiError(
        403,"You are not authorized"
    )
  }
if (!tournament) {
    throw new ApiError(404, "Tournament not found");
}
    const homeTeam = await Team.findById(match.homeTeam);

    const awayTeam = await Team.findById(match.awayTeam);

    match.homeScore = homeScore;
    match.awayScore = awayScore;
    match.status = "Completed";

if (homeScore > awayScore) {

    match.winner = homeTeam._id;

} else if (awayScore > homeScore) {

    match.winner = awayTeam._id;

} else {

    if (tournament.tournamentType === "League") {

        match.winner = null;

    } else {

        throw new ApiError(
            400,
            "Knockout matches cannot end in a draw. Enter penalty scores."
        );

    }

}

    await match.save();
// Advance winner to next knockout match
if (match.nextMatch && match.winner) {

    const nextMatch = await Match.findById(match.nextMatch);

    if (!nextMatch) {
        throw new ApiError(404, "Next match not found");
    }

    if (match.nextMatchPosition === "home") {
        nextMatch.homeTeam = match.winner;
    } else {
        nextMatch.awayTeam = match.winner;
    }

    await nextMatch.save();
    if (
    tournament.tournamentType === "Knockout"
) {

    const nextMatch = await Match.findById(match.nextMatch);

    if (!nextMatch) {
        throw new ApiError(404, "Next match not found");
    }

    if (match.nextMatchPosition === "home") {

        nextMatch.homeTeam = match.winner;

    } else {

        nextMatch.awayTeam = match.winner;

    }

    await nextMatch.save();

}
}
    homeTeam.played++;
    awayTeam.played++;

    homeTeam.goalsFor += homeScore;
    homeTeam.goalsAgainst += awayScore;

    awayTeam.goalsFor += awayScore;
    awayTeam.goalsAgainst += homeScore;

    if (tournament.tournamentType === "League") {

    if (homeScore > awayScore) {

        homeTeam.won++;
        awayTeam.lost++;
        homeTeam.points += 3;

    } else if (awayScore > homeScore) {

        awayTeam.won++;
        homeTeam.lost++;
        awayTeam.points += 3;

    } else {

        homeTeam.draw++;
        awayTeam.draw++;

        homeTeam.points++;
        awayTeam.points++;

    }

}

    homeTeam.goalDifference =
        homeTeam.goalsFor - homeTeam.goalsAgainst;

    awayTeam.goalDifference =
        awayTeam.goalsFor - awayTeam.goalsAgainst;

    await homeTeam.save();
    await awayTeam.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            "Match result updated successfully", match
        )
    );
});
export {createMatch,getAllMatches,getMatchById,updateMatch,deleteMatch,generateFixtures,updateMatchResult}