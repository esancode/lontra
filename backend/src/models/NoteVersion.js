import mongoose from "mongoose";

const noteVersionSchema = new mongoose.Schema({
    noteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note',
        required: true
    },
    content: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['auto', 'manual'],
        default: 'auto'
    }
}, { timestamps: true });

// Indice para acesso rapido das versoes de uma mesmissima nota em ordem decrescente
noteVersionSchema.index({ noteId: 1, createdAt: -1 });

const NoteVersion = mongoose.model("NoteVersion", noteVersionSchema);
export default NoteVersion;
