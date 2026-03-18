import express from "express";
import notesRoutes from "./routes/notesRoutes.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import rateLimiter from "./middleware/rateLimiter.js";
import cors from 'cors'

dotenv.config();
const PORT = process.env.PORT || 500

const app = express();


app.use(cors({
    origin: 'http://localhost:5173',
}));
app.use(express.json());
app.use(rateLimiter);


import boxRoutes from "./routes/boxRoutes.js";

app.use("/api/notes", notesRoutes);
app.use("/api/boxes", boxRoutes);

connectDB().then(() => {
    
    app.listen(PORT, () => {
        console.log("Serve started on PORT:", PORT)
    });

});

