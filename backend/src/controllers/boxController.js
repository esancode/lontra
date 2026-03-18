import Box from "../models/Box.js";

export const getBoxes = async (req, res) => {
    try {
        const boxes = await Box.find().sort({ order: 1 });
        res.status(200).json(boxes);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const createBox = async (req, res) => {
    try {
        const { name, parentId, color, order } = req.body;
        const newBox = new Box({ name, parentId, color, order });
        const savedBox = await newBox.save();
        res.status(201).json(savedBox);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateBox = async (req, res) => {
    try {
        const updateData = {};
        const fields = ['name', 'parentId', 'color', 'order'];
        fields.forEach(f => { if (req.body[f] !== undefined) updateData[f] = req.body[f]; });

        const updatedBox = await Box.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        if (!updatedBox) return res.status(404).json({ message: "Box not found" });
        res.status(200).json(updatedBox);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteBox = async (req, res) => {
    try {
        const deletedBox = await Box.findByIdAndDelete(req.params.id);
        if (!deletedBox) return res.status(404).json({ message: "Box not found" });
        res.status(200).json({ message: "Box deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
