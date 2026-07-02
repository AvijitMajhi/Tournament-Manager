import { Match } from "../models/match.model.js";
import { Team } from "../models/team.model.js";
import { Tournament } from "../models/tournament.model.js";
export const generateKnockoutFixtures = async (
    teams,
    tournament,
    userId
) => {
const totalTeams = teams.length;

if (totalTeams < 2) {
    throw new Error("Minimum two teams required.");
}

if ((totalTeams & (totalTeams - 1)) !== 0) {
    throw new Error(
        "Knockout tournament requires 2, 4, 8, 16, 32... teams."
    );
}
const shuffledTeams = [...teams];

for (let i = shuffledTeams.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1));

    [shuffledTeams[i], shuffledTeams[j]] =
        [shuffledTeams[j], shuffledTeams[i]];
}
const getRoundName = (matches) => {

    switch (matches) {

        case 1:
            return "Final";

        case 2:
            return "Semi Final";

        case 4:
            return "Quarter Final";

        case 8:
            return "Round of 16";

        case 16:
            return "Round of 32";

        case 32:
            return "Round of 64";

        default:
            return `Round of ${matches * 2}`;
    }

};
let currentTeams = totalTeams;

const rounds = [];

while (currentTeams > 1) {

    rounds.push(currentTeams / 2);

    currentTeams /= 2;

}
const allRounds = [];
let matchNumber = 1;
for (const totalMatches of rounds) {

    const currentRound = [];

    for (let i = 0; i < totalMatches; i++) {

        const match = await Match.create({

            tournament: tournament._id,

            round: getRoundName(totalMatches),

            matchNumber: matchNumber++,

            venue: tournament.location,

            matchDate: tournament.startDate,

            createdBy: userId

        });

        currentRound.push(match);

    }

    allRounds.push(currentRound);

}
for (
    let round = 0;
    round < allRounds.length - 1;
    round++
) {

    const currentRound = allRounds[round];

    const nextRound = allRounds[round + 1];

    for (let i = 0; i < currentRound.length; i++) {

        currentRound[i].nextMatch =
            nextRound[Math.floor(i / 2)]._id;

        currentRound[i].nextMatchPosition =
            i % 2 === 0 ? "home" : "away";

        await currentRound[i].save();

    }

}
const firstRound = allRounds[0];

for (let i = 0; i < shuffledTeams.length; i += 2) {

    firstRound[i / 2].homeTeam =
        shuffledTeams[i]._id;

    firstRound[i / 2].awayTeam =
        shuffledTeams[i + 1]._id;

    await firstRound[i / 2].save();

}
return allRounds.flat();

};