import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import trips from "./db.js";

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/api", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/trips", (req, res) => {
  let keywords = req.query.keywords;

  if (keywords === undefined) {
    return res.status(400).json({
      message: "Please send keywords parameter in the URL endpoint",
    });
  }

  const regexKeywords = keywords.split(" ").join("|");
  const regex = new RegExp(regexKeywords, "ig");
  const results = trips.filter((trip) => {
    return (
      trip.title.match(regex) ||
      trip.description.match(regex) ||
      trip.tags.filter((tag) => tag.match(regex)).length
    );
  });

  return res.json({
    data: results,
  });
});

// Export for Vercel
export default app;
