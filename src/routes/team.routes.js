import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    createTeam,
    getAllTeams,
    getTeamById,
    updateTeam,
    deleteTeam,
    getTeamsByTournament,
} from "../controllers/team.controllers.js";

const router = Router();

router.route("/")
.post(
    verifyJWT,
    upload.single("logo"),
    createTeam
)
.get(getAllTeams);
router.route("/tournament/:tournamentId")
    .get(verifyJWT, getTeamsByTournament);
router.route("/:id")
.get(getTeamById)
.patch(
    verifyJWT,
    upload.single("logo"),
    updateTeam
)
.delete(
    verifyJWT,
    deleteTeam
);

export default router;