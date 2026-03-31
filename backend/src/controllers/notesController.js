import Note from '../models/Note.js';
import NoteVersion from '../models/NoteVersion.js';

export const getAllNotes = async (req, res) => {
    try {
        const { q } = req.query;
        const base = { ownerId: req.ownerId };

        let query = base;
        if (q) {
            query = {
                ...base,
                $or: [
                    { title: { $regex: q, $options: 'i' } },
                    { 'content.text': { $regex: q, $options: 'i' } }
                ]
            };
        }

        const notes = await Note.find(query).sort({ order: 1, createdAt: -1 });
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getNoteById = async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, ownerId: req.ownerId });
        if (!note) return res.status(404).json({ message: 'Note not found' });
        res.status(200).json(note);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createNote = async (req, res) => {
    try {
        const { title, content, boxId, icon, order } = req.body;
        const note = new Note({ title, content, boxId, icon, order, ownerId: req.ownerId });
        const noteSaved = await note.save();
        res.status(201).json(noteSaved);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateNote = async (req, res) => {
    try {
        const updateData = {};
        const fields = ['title', 'content', 'boxId', 'icon', 'tags', 'flashcards', 'linkedNotes', 'order'];
        fields.forEach(f => { if (req.body[f] !== undefined) updateData[f] = req.body[f]; });

        const updatedNote = await Note.findOneAndUpdate(
            { _id: req.params.id, ownerId: req.ownerId },
            updateData,
            { new: true }
        );
        if (!updatedNote) return res.status(404).json({ message: 'Note not found' });
        res.status(200).json(updatedNote);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteNote = async (req, res) => {
    try {
        const result = await Note.deleteOne({ _id: req.params.id, ownerId: req.ownerId });
        if (result.deletedCount === 0) return res.status(404).json({ message: 'Note not found' });
        res.status(200).json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const addFlashcard = async (req, res) => {
    try {
        const { blockId, question } = req.body;
        const note = await Note.findOne({ _id: req.params.id, ownerId: req.ownerId });
        if (!note) return res.status(404).json({ message: 'Note not found' });

        note.flashcards.push({ blockId, question, nextReview: new Date(), interval: 0, easeFactor: 2.5 });
        const updatedNote = await note.save();
        res.status(200).json(updatedNote);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getNoteVersions = async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, ownerId: req.ownerId }).lean();
        if (!note) return res.status(404).json({ message: 'Note not found' });

        const versions = await NoteVersion.find({ noteId: req.params.id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.status(200).json(versions);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createNoteSnapshot = async (req, res) => {
    try {
        const { type } = req.body;
        const note = await Note.findOne({ _id: req.params.id, ownerId: req.ownerId });
        if (!note) return res.status(404).json({ message: 'Note not found' });
        if (!note.content) return res.status(400).json({ message: 'Empty content' });

        const snapshot = new NoteVersion({
            noteId: note._id,
            title: note.title,
            content: note.content,
            type: type || 'auto'
        });
        await snapshot.save();
        res.status(201).json(snapshot);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const restoreNoteVersion = async (req, res) => {
    try {
        const { id, versionId } = req.params;

        const note = await Note.findOne({ _id: id, ownerId: req.ownerId });
        if (!note) return res.status(404).json({ message: 'Note not found' });

        const version = await NoteVersion.findById(versionId);
        if (!version) return res.status(404).json({ message: 'Version not found' });

        note.title = version.title;
        note.content = version.content;
        const updatedNote = await note.save();
        res.status(200).json(updatedNote);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};