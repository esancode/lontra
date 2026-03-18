import express from "express";
import { getBoxes, createBox, updateBox, deleteBox } from "../controllers/boxController.js";

const router = express.Router();

router.get("/", getBoxes);
router.post("/", createBox);
router.put("/:id", updateBox);
router.delete("/:id", deleteBox);

export default router;
