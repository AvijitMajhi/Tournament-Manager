import mongoose,{Schema} from "mongoose";
const tournamentSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        index: true},
    description: {
        type: String,
        required: true,
        default: ""},
    location: {
        type: String,
        required: true,
        trim: true},
    banner: {
        type: String,
        default: ""},
    startDate: {
        type: Date,
        required: true},
    endDate: {
        type: Date,
        required: true},
    registrationDeadline: {
        type: Date,
        required: true},
    tournamentType: {
        type: String,
        enum: ["League", "League + Knockout", "Knockout"],
        default: "League"},
    status: {
        type: String,
        enum: ["Upcoming", "Ongoing", "Completed"],
        default: "Upcoming"},
    maxTeams: {
        type: Number,
        required: true},
    creator: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
  
},
{
        timestamps: true
    });
export const Tournament = mongoose.model("Tournament", tournamentSchema);