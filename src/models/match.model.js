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
            required: true,
        },

        awayTeam: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            required: true,
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
    },
    {
        timestamps: true,
    }
);

export const Match = mongoose.model("Match", matchSchema);