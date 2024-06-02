import express from "express";
import cors from "cors";
import scores from "./routes/scores.js";
import connectDB from "./db/connect.js";

const app = express();
const PORT = process.env.PORT || 5050;

app.use(
  cors({
    origin: "https://jessicaluong.github.io/pacman-js/",
    methods: ["GET", "POST"],
  })
);
app.use(express.json());
app.use("/api/v1/scores", scores);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, console.log(`Server listening on port ${PORT}`));
  } catch (error) {
    console.log(error);
  }
};

start();
