import mongoose, { Schema } from "mongoose";

const matchSchema = new Schema(
    {
        tournament: {
            type: Schema.Types.ObjectId,
            ref: "Tournament",
            required: true,
        },

     homeTeam: {
    type: Schema.Types.ObjectId,
    ref: "Team",
    default: null,
},

awayTeam: {
    type: Schema.Types.ObjectId,
    ref: "Team",
    default: null,
},

        matchDate: {
            type: Date,
            required: true,
        },

        venue: {
            type: String,
            required: true,
            trim: true,
        },

        round: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            enum: ["Scheduled", "Live", "Completed"],
            default: "Scheduled",
        },

        homeScore: {
            type: Number,
            default: 0,
            min: 0,
        },

        awayScore: {
            type: Number,
            default: 0,
            min: 0,
        },

        winner: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            default: null,
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        nextMatch: {
    type: Schema.Types.ObjectId,
    ref: "Match",
    default: null,
},

nextMatchPosition: {
    type: String,
    enum: ["home", "away"],
    default: null,
},
matchNumber: {
    type: Number,
    required: true,
},
    },
    {
        timestamps: true,
    }
);

export const Match = mongoose.model("Match", matchSchema);