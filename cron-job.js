const fs = require("fs");
const cron = require("node-cron");
const { fetchQuestionsFromAPI } = require("./api");

// Schedule the task to run at 6 AM and 6 PM
cron.schedule("0 6,18 * * *", async () => { // runs at 6AM and 6 PM
// cron.schedule("* * * * *", async () => { // runs every minute
  console.log("Fetching new trivia questions...");
  try {
    const questions = await fetchQuestionsFromAPI();
    if (questions.length > 0) {
      fs.writeFileSync("./questions.json", JSON.stringify({ questions }, null, 2));
      console.log("Questions updated successfully!");
    } else {
      console.error("No questions generated. Default questions used.");
    }
  } catch (error) {
    console.error("Cron job failed:", error.message);
  }
});
  
console.log("Cron job scheduled. Press Ctrl+C to exit.");