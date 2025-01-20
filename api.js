require("dotenv").config();
const fetch = require("node-fetch");
const fs = require("fs");

// Helper function to calculate similarity between two strings
const calculateSimilarity = (str1, str2) => {
  const words1 = new Set(str1.toLowerCase().split(" "));
  const words2 = new Set(str2.toLowerCase().split(" "));
  const intersection = new Set([...words1].filter((word) => words2.has(word)));
  const union = new Set([...words1, ...words2]);
  return intersection.size / union.size;
};

// Remove similar summaries based on a threshold
const removeSimilarSummaries = (summaries, threshold = 0.7) => {
  const uniqueSummaries = [];
  summaries.forEach((summary) => {
    if (
      uniqueSummaries.every(
        (existing) => calculateSimilarity(existing, summary) < threshold
      )
    ) {
      uniqueSummaries.push(summary);
    }
  });
  return uniqueSummaries;
};

// Fetch questions from GNews API
const fetchQuestionsFromAPI = async () => {
  const gnewsApiKey = process.env.GNEWS_API_KEY;
  if (!gnewsApiKey) {
    console.error("❌ Missing GNews API Key. Check your .env file.");
    return generateDefaultQuestions();
  }

  const cacheFile = "./cache.json";
  const cacheDuration = 12 * 60 * 60 * 1000; // Cache duration: 1 minute

  try {
    // Check cache validity
    if (fs.existsSync(cacheFile)) {
      try {
        const cache = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
        const now = Date.now();
        if (now - cache.timestamp < cacheDuration) {
          console.log("✅ Using cached results.");
          return cache.data;
        }
      } catch (error) {
        console.warn("⚠️ Corrupted cache file. Ignoring cache.", error.message);
      }
    }

    console.log("🌐 Fetching news articles from GNews API...");
    const response = await fetch(
      `https://gnews.io/api/v4/top-headlines?token=${gnewsApiKey}&lang=en&country=us&max=10`
    );

    if (!response.ok) {
      console.error(
        `❌ Failed to fetch news articles: ${response.status} ${response.statusText}`
      );
      return generateDefaultQuestions();
    }

    const newsData = await response.json();
    if (!newsData.articles || newsData.articles.length === 0) {
      console.warn("⚠️ No articles found. Returning default questions.");
      return generateDefaultQuestions();
    }

    // Combine title, description, and content for summaries
    const articles = newsData.articles.map((article) => ({
      summary: `${article.title} ${article.description || ""} ${
        article.content || ""
      }`.trim(),
      url: article.url,
    }));

    // Remove similar summaries
    const uniqueSummaries = removeSimilarSummaries(
      articles.map((article) => article.summary)
    );

    // Generate trivia questions
    const questions = await generateQuestionsFromSummaries(
      uniqueSummaries,
      articles
    );

    // Cache results
    fs.writeFileSync(
      cacheFile,
      JSON.stringify({ timestamp: Date.now(), data: questions })
    );

    // Save questions to questions.json
    fs.writeFileSync("./questions.json", JSON.stringify({ questions }, null, 2));

    return questions.length > 0 ? questions : generateDefaultQuestions();
  } catch (error) {
    console.error("❌ Error fetching questions:", error.message);
    return generateDefaultQuestions();
  }
};

// Generate trivia questions from summaries
const generateQuestionsFromSummaries = async (summaries, articles) => {
  const questions = [];

  for (let i = 0; i < summaries.length; i++) {
    const summary = summaries[i];
    const article = articles[i]; // Corresponding article for the summary

    try {
      console.log(`🛠 Generating question from summary: "${summary}"`);

      const aiResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
              { role: "system", content: "You are a trivia question generator." },
            {
              role: "user",
              content: `
              You are an AI assistant that generates engaging and educational trivia questions for a website. These questions are based on the latest news topics to intrigue users and encourage them to learn something new. Create a standalone trivia question based on the following summary: "${summary}", and the following conditions, ensuring it is clear, accurate, and relevant:

              1. Write the question to spark curiosity and interest, ensuring it is clear and accurate.
              2. Avoid references to tweets, handles, or social media.
              3. Provide four plausible answer options (one correct and three incorrect).
              4. Ensure the question and answers are suitable for a standalone trivia quiz.
              5. Make the question accessible to a general audience with no specialized knowledge required.
              6. If the content includes links, incorporate the key information from the link to enrich the question.
              8. For the options, don't include numbers at the beginning. For example, don't include these: A) or A..
              9. Don't just restate the question for the answers. Instead, make them thought-provoking.
              10. Provide the correct answer, but allow the index to be randomized in the final structure.

              Provide the output in JSON format:
              {
                "prompt": "Question text",
                "answers": ["Correct Answer", "Incorrect Option 1", "Incorrect Option 2", "Incorrect Option 3"]
              }
            `,
            },
          ],
          max_tokens: 500,
        }),
        }
      );

      const aiData = await aiResponse.json();
      if (
        aiData.choices &&
        aiData.choices[0] &&
        aiData.choices[0].message.content
      ) {
        const rawOutput = JSON.parse(aiData.choices[0].message.content.trim());
        if (rawOutput.prompt && Array.isArray(rawOutput.answers)) {
          const correctAnswer = rawOutput.answers[0];
          const shuffledAnswers = rawOutput.answers.sort(() => Math.random() - 0.5);
          const correctIndex = shuffledAnswers.indexOf(correctAnswer);

          questions.push({
            prompt: rawOutput.prompt,
            answers: shuffledAnswers,
            correct_index: correctIndex,
            url: article.url,
          });
        }
      }
    } catch (error) {
      console.error(`❌ Error generating question: "${summary}"`, error.message);
    }
  }

  return questions;
};

// Generate fallback questions
const generateDefaultQuestions = () => [
  {
    prompt: "Who developed the theory of relativity?",
    answers: ["Albert Einstein", "Isaac Newton", "Galileo Galilei", "Marie Curie"],
    correct_index: 0,
  },
  {
    prompt: "What is the capital of France?",
    answers: ["Paris", "Berlin", "Madrid", "Rome"],
    correct_index: 0,
  },
  {
    prompt: "What is the boiling point of water at sea level?",
    answers: ["100°C", "0°C", "50°C", "200°C"],
    correct_index: 0,
  },
];

module.exports = { fetchQuestionsFromAPI };