import mongoose from "mongoose";

const ScoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Must provide name"],
    trim: true,
    minLength: [3, "Name must be 3 characters long"],
    maxLength: [3, "Name must be 3 characters long"],
    match: [/^[A-Za-z]{3}$/, "Name must be 3 alphabetical characters"],
  },
  points: {
    type: Number,
    required: [true, "Must provide score"],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Score", ScoreSchema);
