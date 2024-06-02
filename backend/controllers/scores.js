import Score from "../models/Score.js";

const getAllScores = async (req, res) => {
  try {
    const scores = await Score.find({}).sort({ points: -1, date: 1 });
    res.status(200).json({ scores });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const addScore = async (req, res) => {
  try {
    const score = await Score.create(req.body);
    res.status(201).json({ score });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

export { getAllScores, addScore };
