const express = require("express");
const cors = require("cors");
const { fetchQuestionsFromAPI } = require("./api");
const cron = require("node-cron");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to enable CORS
app.use(
  cors({
    origin: "https://678f161a8761ee917c4bd1fe--keen-liger-6b3984.netlify.app", // Replace with your Netlify site URL
    methods: ["GET", "POST"], // Specify allowed HTTP methods
  })
);

// Serve static files from the "public" folder
app.use(express.static("public"));

// API endpoint to fetch questions
app.get("/api/questions", async (req, res) => {
  try {
    const questions = await fetchQuestionsFromAPI();
    res.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Failed to fetch questions." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Schedule tasks at 6 AM and 6 PM
cron.schedule("0 6,18 * * *", async () => {
  console.log("Running scheduled task to fetch trivia questions...");
  try {
    await fetchQuestionsFromAPI();
    console.log("Questions fetched successfully during the scheduled task.");
  } catch (error) {
    console.error("Error during the scheduled task:", error);
  }
});
