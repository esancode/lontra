import Note from "../models/Note.js"

export const getAllNotes = async (req, res) => {
    try {
        const { q } = req.query;
        let query = {};
        
        if (q) {
            query = {
                $or: [
                    { title: { $regex: q, $options: "i" } },
                    { "content.text": { $regex: q, $options: "i" } } 
                ]
            };
        }

        const notes = await Note.find(query).sort({ order: 1, createdAt: -1 });
        res.status(200).json(notes);

    } catch (error) {
        res.status(500).json({ message: "Internal error server" });
    }
};

export const getNoteById = async (req, res) => {
    try {
        const noteById = await Note.findById(req.params.id);
        if (!noteById) return res.status(404).json({ message: "Note not found" });  
        res.status(200).json(noteById);

    } catch (error) {
        res.status(500).json({ message: "Internal error server" });
    }
};

export const createNote = async (req, res) => {
    try {
        const { title, content, boxId, icon, order } = req.body;
        const note = new Note({ title, content, boxId, icon, order });

        const noteSaved = await note.save();
        res.status(201).json(noteSaved);

    } catch (error) {
        res.status(500).json({ message: "Internal error server" });
    }
};

export const updateNote = async (req, res) => {
    try {
        const updateData = {};
        const fields = ['title', 'content', 'boxId', 'icon', 'tags', 'flashcards', 'linkedNotes', 'order'];
        fields.forEach(f => { if (req.body[f] !== undefined) updateData[f] = req.body[f]; });
        
        const updatedNote = await Note.findByIdAndUpdate(req.params.id, 
            updateData,
            { new: true }
        );
        if (!updatedNote) return res.status(404).json({ message: "Note not found" });

        res.status(200).json(updatedNote);

    } catch (error) {
        res.status(500).json({ message: "Internal error server" });
    }
};

export const deleteNote = async (req, res) => {
    try {
        const deletedNote = await Note.findByIdAndDelete(req.params.id);
        if (!deletedNote) return res.status(404).json({ message: "Note not found" });
        res.status(200).json({ message: "Note deleted succeffuly" });

    } catch (error) {
        res.status(500).json({ message: "Internal error server" });
    }
};

export const addFlashcard = async (req, res) => {
    try {
        const { id } = req.params;
        const { blockId, question } = req.body;

        const note = await Note.findById(id);
        if (!note) return res.status(404).json({ message: "Note not found" });

        note.flashcards.push({
            blockId,
            question,
            nextReview: new Date(),
            interval: 0,
            easeFactor: 2.5
        });

        const updatedNote = await note.save();
        res.status(200).json(updatedNote);

    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};