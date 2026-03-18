import express from "express";
import notesRoutes from "./routes/notesRoutes.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import rateLimiter from "./middleware/rateLimiter.js";
import cors from 'cors'
import path from 'path'

dotenv.config();
const PORT = process.env.PORT || 500
const __dirname = path.resolve()
const app = express();

if (process.NODE_ENV !== "production") {
app.use(cors({
    origin: 'http://localhost:5173',
}));
};

app.use(express.json());
app.use(rateLimiter);


import boxRoutes from "./routes/boxRoutes.js";

app.use("/api/notes", notesRoutes);
app.use("/api/boxes", boxRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")))

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"))
    });
}

connectDB().then(() => {

    app.listen(PORT, () => {
        console.log("Serve started on PORT:", PORT)
    });

});

