import express from "express";
import { 
    getAllNotes, 
    getNoteById, 
    createNote, 
    updateNote, 
    deleteNote,
    addFlashcard
 } from "../controllers/notesController.js";

const router = express.Router();

router.get("/search", getAllNotes); 
router.get("/", getAllNotes);
router.get("/:id", getNoteById);
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);
router.post("/:id/flashcards", addFlashcard);

export default router;