import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
    createMatch,
    getAllMatches,
    getMatchById,
    updateMatch,
    deleteMatch,
    updateMatchResult,
    generateFixtures,
} from "../controllers/match.controller.js";

const router = Router();

router.route("/")
.post(verifyJWT, createMatch)
.get(getAllMatches);

router.route("/generate-fixtures")
.post(verifyJWT, generateFixtures);

router.route("/:id")
.get(getMatchById)
.patch(verifyJWT, updateMatch)
.delete(verifyJWT, deleteMatch);

router.route("/:id/result")
.patch(verifyJWT, updateMatchResult);

export default router;