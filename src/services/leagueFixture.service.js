export const generateLeagueFixtures = (teams) => {

    let teamList = [...teams];

    if (teamList.length % 2 !== 0) {
        teamList.push(null);
    }

    const fixtures = [];

    const totalTeams = teamList.length;

    const rounds = totalTeams - 1;

    const matchesPerRound = totalTeams / 2;

    for (let round = 0; round < rounds; round++) {

        for (let match = 0; match < matchesPerRound; match++) {

            const homeTeam = teamList[match];

            const awayTeam =
                teamList[totalTeams - 1 - match];

            if (homeTeam && awayTeam) {

                fixtures.push({

                    homeTeam: homeTeam._id,

                    awayTeam: awayTeam._id,

                    round: `Round ${round + 1}`

                });

            }

        }

        const fixed = teamList[0];

        const rotating = teamList.slice(1);

        rotating.unshift(rotating.pop());

        teamList = [fixed, ...rotating];

    }

    return fixtures;

};