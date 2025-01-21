class QuizGame {
  constructor(questions) {
    this.questions = questions;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.showTitlePage();
  }

  showTitlePage() {
    const quizContainer = document.getElementById("quiz");

    // Check if the user is allowed to take the quiz
    /*
    if (!this.isQuizAllowed()) {
      quizContainer.innerHTML = `
        <div class="error">You can only take the quiz once between 6 AM-6 PM and once between 6 PM-6 AM.</div>
      `;
      return;
    }
    */

    quizContainer.innerHTML = `
      <div class="title-page">
        <h1>DRIVIA</h1>
        <button id="start-quiz" class="quiz-button">Earth</button>
      </div>
    `;

    document.getElementById("start-quiz").addEventListener("click", () => this.initQuiz());
  }

  /*
  isQuizAllowed() {
    const now = new Date();
    const hour = now.getHours();
    const currentRange = hour >= 6 && hour < 18 ? "day" : "night";
    const lastAttempt = JSON.parse(localStorage.getItem("quizAttempt"));

    // If there's no previous attempt, allow the quiz
    if (!lastAttempt) {
      this.recordQuizAttempt(currentRange);
      return true;
    }

    // Check if the user has already taken the quiz in the current range
    if (lastAttempt.range === currentRange && this.isSameDay(new Date(lastAttempt.timestamp), now)) {
      return false;
    }

    // Record the new attempt for the current range
    this.recordQuizAttempt(currentRange);
    return true;
  }

  recordQuizAttempt(range) {
    const attemptData = {
      range,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("quizAttempt", JSON.stringify(attemptData));
  }

  isSameDay(date1, date2) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
  */

  initQuiz() {
    // Ensure the progress bar starts at zero
    const progressFill = document.getElementById("progress-fill");
    if (progressFill) progressFill.style.width = "0%";

    this.currentQuestionIndex = 0;
    this.score = 0;

    this.updateProgress();
    this.renderQuestion();
  }

  renderQuestion() {
    const question = this.questions[this.currentQuestionIndex];
    const quizContainer = document.getElementById("quiz");

    // Render the question and answers
    quizContainer.innerHTML = `
      <div class="quiz-question">${question.prompt}</div>
      <div class="quiz-answers">
        ${question.answers
          .map(
            (answer, index) => `
            <button class="quiz-answer" data-index="${index}">${answer}</button>
          `
          )
          .join("")}
      </div>
    `;

    // Add event listeners to the answer buttons
    document.querySelectorAll(".quiz-answer").forEach((button) => {
      button.addEventListener("click", (e) => {
        const selectedIndex = parseInt(e.target.getAttribute("data-index"), 10);
        this.checkAnswer(selectedIndex);
      });
    });
  }

  checkAnswer(selectedIndex) {
    const question = this.questions[this.currentQuestionIndex];
    const isCorrect = selectedIndex === question.correct_index;

    if (isCorrect) {
      this.score++;
    }

    const showAlert = () => {
      swal({
        title: isCorrect ? "That's right!" : "Not quite.",
        text: isCorrect
          ? `"${question.answers[question.correct_index]}" is correct.`
          : `The correct answer is: "${question.answers[question.correct_index]}".`,
        icon: isCorrect ? "success" : "error",
        buttons: {
          details: {
            text: "Details",
            value: "details",
            className: "swal-button--learn-more", // Add a custom class for styling
          },
          next: {
            text: "Next",
            value: "next",
            className: "swal-button--next", // Add a custom class for styling
          },
        },
        closeOnClickOutside: false, // Prevent clicking outside the alert to close it
      }).then((value) => {
        if (value === "details") {
          window.open(question.url, "_blank"); // Open the URL in a new tab
          showAlert(); // Re-show the alert after Learn More
        } else if (value === "next") {
          this.nextQuestion(); // Proceed to the next question
        }
      });
    };

    // Show the initial alert
    showAlert();
  }

  nextQuestion() {
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex < this.questions.length) {
        this.updateProgress();
      this.renderQuestion();
    } else {
      this.showResults();
    }
  }
  
    updateProgress() {
      const progressFill = document.getElementById("progress-fill");
      const totalQuestions = this.questions.length;
      const currentQuestion = this.currentQuestionIndex + 1;
  
      const progressPercentage = (currentQuestion / totalQuestions) * 100;
      progressFill.style.width = `${progressPercentage}%`;
    }

  showResults() {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
    const scoreText = `${this.score}/${this.questions.length}`;
    // Retrieve the current streak from local storage
    const streakKey = 'streakCounter';
    const currentStreak = localStorage.getItem(streakKey) || 0; // Default to 0 if no streak is stored
    const link = "link_placeholder";
  
const shareText = `DRIVIA ${formattedDate} ${scoreText}\nCurrent Streak: ${currentStreak}\n${link}`;  
    document.getElementById("quiz").innerHTML = `
      <div class="quiz-question">Score: ${this.score} / ${this.questions.length}</div>
        <p>See you tomorrow...</p>
      <div class="share-results">
        <p>Share your results with your friends</p>
        <div class="share-buttons">
          <button id="share-twitter" class="share-button twitter-button">
            <i class="fa-solid fa-x"></i> <!-- Twitter Icon -->
          </button>
          <button id="share-text" class="share-button text-button">
            <i class="fa-solid fa-comments"></i> <!-- Chat Bubble Icon -->
          </button>
        </div>
      </div>
    `;
  
    // Add event listeners to the buttons
    document.getElementById("share-twitter").addEventListener("click", () => {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
      window.open(twitterUrl, "_blank");
    });
  
    document.getElementById("share-text").addEventListener("click", () => {
      const smsUrl = `sms:?&body=${encodeURIComponent(shareText)}`;
      window.open(smsUrl, "_self");
    });
  }


  

}

// Copy Link Button Functionality
document.getElementById("copy-link-button").addEventListener("click", function () {
  const tempInput = document.createElement("input");
  tempInput.value = "https://placeholder.com"; // Replace with actual URL
  document.body.appendChild(tempInput);
  tempInput.select();
  tempInput.setSelectionRange(0, 99999); // For mobile devices
  document.execCommand("copy");
  document.body.removeChild(tempInput);

  const feedback = document.getElementById("copy-link-feedback");
  feedback.style.display = "block";
  setTimeout(() => {
    feedback.style.display = "none";
  }, 2000);
});

// Feature Your News Button Functionality
document.getElementById("feature-news-button").addEventListener("click", function () {
  const tempInput = document.createElement("input");
  tempInput.value = "drivia.earth@gmail.com"; // Replace with actual email
  document.body.appendChild(tempInput);
  tempInput.select();
  tempInput.setSelectionRange(0, 99999); // For mobile devices
  document.execCommand("copy");
  document.body.removeChild(tempInput);

  const feedback = document.getElementById("feature-news-feedback");
  feedback.style.display = "block";
  setTimeout(() => {
    feedback.style.display = "none";
  }, 2000);
});



// Fetch questions from `questions.json`
fetch("https://drivia.onrender.com/api/questions") // Replace with your deployed backend URL when live
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to fetch questions");
    }
    return response.json();
  })
  .then((data) => {
    if (data.questions) {
      initializeQuiz(data.questions);
    } else {
      console.error("No questions found in response.");
    }
  })
  .catch((error) => {
    console.error("Error loading questions:", error);
  });
