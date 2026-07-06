import {Router} from 'express';
import {verifyJWT} from '../middlewares/auth.middleware.js';
import {
    createTournament,
    getAllTournaments,
    getTournamentById,
    updateTournament,
    deleteTournament,
    getStandings,
    getTournamentDashboard,
} from "../controllers/tournament.controller.js";
import { upload } from '../middlewares/multer.middleware.js';
const router=Router();
router.route("/").post(
    verifyJWT,upload.single("banner"),createTournament
).get(getAllTournaments);
router.route("/:id")
.get(getTournamentById)
.patch(verifyJWT,upload.single("banner"),updateTournament)
.delete(verifyJWT,deleteTournament)
router.route("/:tournamentId/standings").get(verifyJWT,getStandings);
router.route("/:id/dashboard")
.get(getTournamentDashboard);
export default router;