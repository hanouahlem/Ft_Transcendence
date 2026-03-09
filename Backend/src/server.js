
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import route from "./routes/routes.js";   

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


app.use("/", route);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});








































































// import express from "express"; //créer une API
// import cors from "cors"; //autoriser les requêtes depuis le frontend
// import dotenv from "dotenv";//charger .env
// import { PrismaClient } from "@prisma/client";

// dotenv.config();

// const app = express(); //Ici tu crées une application Express.
// const prisma = new PrismaClient();
// app.use(cors()); //Autorise le frontend (Next.js par exemple) à appeler ton API.
// app.use(express.json()); // Sinon le navigateur bloque les requêtes.


// app.get("/users", async (req, res) => {

//     const users = await prisma.user.findMany();

//     res.json(users);
// });

// app.post("/users", async (req, res) => {

//     const { username, email, password } = req.body;

//     const user = await prisma.user.create({
//         data: {
//             username,
//             email,
//             password
//         }
//     });

//     res.json(user);
// });

// app.get("/", (req, res) => {
//     res.send("Backend running je m'appel ahleuuum");
// });

// app.get("/looser", (req, res) => {
//     res.send("je suis la route looser");
// });

// app.get("/login", (req, res) => {
//     res.send("je me log");
// });

// app.get("/user", (req, res) => {
//     res.send("je suis ahlem");
// });

// const PORT = process.env.PORT || 3001;

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });