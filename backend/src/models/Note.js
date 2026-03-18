import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema({
    blockId: String,
    question: String,
    nextReview: Date,
    interval: Number,
    easeFactor: Number
});

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    icon: {
        type: String
    },
    boxId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Box',
        default: null
    },
    content: {
        type: mongoose.Schema.Types.Mixed, 
        default: {}
    },
    linkedNotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note'
    }],
    flashcards: [flashcardSchema],
    tags: [{
        type: String
    }],
    order: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

noteSchema.index({ title: 'text' });
noteSchema.index({ boxId: 1 });
noteSchema.index({ order: 1 });

const Note = mongoose.model("Note", noteSchema);
export default Note;