import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend running je m'appel ahleuuum");
});

app.get("/looser", (req, res) => {
    res.send("je suis la route looser");
});

app.get("/login", (req, res) => {
    res.send("je me log");
});

app.get("/user", (req, res) => {
    res.send("je me log");
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});