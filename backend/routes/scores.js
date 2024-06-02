import express from "express";
import { getAllScores, addScore } from "../controllers/scores.js";

const router = express.Router();

router.get("/", getAllScores);
router.post("/", addScore);

export default router;
