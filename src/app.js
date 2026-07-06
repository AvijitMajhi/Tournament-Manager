import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(express.json({limit:'16kb'}));
app.use(express.urlencoded({
    extended:true,
    limit:'16kb'
}))
app.use(express.static('public'))
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
app.use("/api/v1/users",userRouter);     
import tournamentRouter from "./routes/tournament.routes.js"; 
app.use("/api/v1/tournaments",tournamentRouter);
import teamRouter from "./routes/team.routes.js";
app.use ("/api/v1/teams",teamRouter);
import matchRouter from "./routes/match.routes.js";
app.use("/api/v1/matches",matchRouter)
import dashboardRouter from "./routes/dashboard.routes.js";
app.use("/api/v1/dashboard", dashboardRouter);
export{app};