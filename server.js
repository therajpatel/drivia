const express = require("express");
const { fetchQuestionsFromAPI } = require("./api");
const cors = require("node-cors");
const app = express();
const PORT = process.env.PORT || 3000;
const axios = require("axios");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(express.json());

app.use(
    cors({
      origin: ["https://drivia.news", "https://www.drivia.news"], // Add both domains
      methods: ["GET", "POST"], // Allow required methods
      credentials: true, // Allow cookies if needed
    })
  );

// Serve static files from the "public" folder
app.use(express.static("public"));

// API endpoint to fetch general questions
app.get("/api/questions", async (req, res) => {
  try {
    const questions = await fetchQuestionsFromAPI(); // Default to general questions
    res.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Failed to fetch questions." });
  }
});

// API endpoint for sports questions
app.get("/api/sports-questions", async (req, res) => {
  try {
    const questions = await fetchQuestionsFromAPI("sports"); // Pass "sports" category
    res.json(questions);
  } catch (error) {
    console.error("Error fetching sports questions:", error);
    res.status(500).json({ error: "Failed to fetch sports questions." });
  }
});

// API endpoint for entertainment questions
app.get("/api/entertainment-questions", async (req, res) => {
  try {
    const questions = await fetchQuestionsFromAPI("entertainment"); // "entertainment" category
    res.json(questions);
  } catch (error) {
    console.error("Error fetching entertainment questions:", error);
    res.status(500).json({ error: "Failed to fetch entertainment questions." });
  }
});

app.get("/api/gaming-questions", async (req, res) => {
  try {
    const prompt = `
      Generate 5 engaging and challenging trivia questions about iconic gaming history. Each question should cover a unique topic, such as influential video game titles, console launches, legendary game developers, notable characters, or significant industry milestones. Format each question in JSON with the following structure: 
      Each question should be in the following JSON format:
      {
        "prompt": "What year was the original Nintendo Entertainment System (NES) released in North America?",
        "answers": ["1985", "1983", "1990", "1987"],
        "correct_index": 0
      }
      The questions must cover diverse topics in gaming history, such as release years, iconic characters, and companies.
    `;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4", // Use the GPT-4 model for better context
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const questions = JSON.parse(response.data.choices[0].message.content);

    // Cache the generated questions with a timestamp
    const timestamp = Date.now();
    global.gamingQuestionsCache = { questions, timestamp };

    res.json(questions);
  } catch (error) {
    console.error("Error generating gaming questions:", error);
    res.status(500).json({ error: "Failed to generate gaming questions" });
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