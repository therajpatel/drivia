const express = require("express");
const { fetchQuestionsFromAPI } = require("./api");
const app = express();
const PORT = process.env.PORT || 3000;

const cron = require("node-cron");
//const { fetchQuestionsFromAPI } = require("./api");

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
  await fetchQuestionsFromAPI();
});