import mongoose, { Schema } from "mongoose";

const teamSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        shortName: {
            type: String,
            required: true,
            uppercase: true,
            maxlength: 5,
            trim: true,
        },

        logo: {
            type: String,
            default: "",
        },

        coach: {
            type: String,
            trim: true,
        },

        captain: {
            type: String,
            required: true,
            trim: true,
        },

        tournament: {
            type: Schema.Types.ObjectId,
            ref: "Tournament",
            required: true,
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        played: {
            type: Number,
            default: 0,
        },

        won: {
            type: Number,
            default: 0,
        },

        draw: {
            type: Number,
            default: 0,
        },

        lost: {
            type: Number,
            default: 0,
        },

        goalsFor: {
            type: Number,
            default: 0,
        },

        goalsAgainst: {
            type: Number,
            default: 0,
        },

        goalDifference: {
            type: Number,
            default: 0,
        },

        points: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export const Team = mongoose.model("Team", teamSchema);