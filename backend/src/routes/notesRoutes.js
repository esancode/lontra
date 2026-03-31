import express from "express";
import { 
    getAllNotes, 
    getNoteById, 
    createNote, 
    updateNote, 
    deleteNote,
    addFlashcard,
    getNoteVersions,
    createNoteSnapshot,
    restoreNoteVersion
 } from "../controllers/notesController.js";

const router = express.Router();

router.get("/search", getAllNotes); 
router.get("/", getAllNotes);
router.get("/:id", getNoteById);
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);
router.post("/:id/flashcards", addFlashcard);

// Rotas de Versionamento
router.get("/:id/versions", getNoteVersions);
router.post("/:id/versions/snapshot", createNoteSnapshot);
router.post("/:id/versions/:versionId/restore", restoreNoteVersion);

export default router;