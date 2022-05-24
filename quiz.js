/*
  Quick quiz bootstrap extension
*/


;(function($) {




  
  // keep track of number of quizes added to page
  var quiz_count = 0;
  
  // add jQuery selection method to create
  // quiz structure from question json file
  // "filename" can be path to question json
  // or javascript object
  $.fn.quiz = function(filename) {
    if (typeof filename === "string") {
      $.getJSON(filename, render.bind(this));
    } else {
      render.call(this, filename);
    }
  };
  
  // create html structure for quiz
  // using loaded questions json
  function render(quiz_opts) {
  
  
    // list of questions to insert into quiz
    var questions = quiz_opts.questions;
  
    // keep track of the state of correct
    // answers to the quiz so far
    var state = {
      correct : 0,
      total : questions.length
    };
  
    var $quiz = $(this)
      .attr("class", "carousel slide")
      .attr("data-ride", "carousel");
  
    // unique ID for container to refer to in carousel
    var name = $quiz.attr("id") || "urban_quiz_" + (++quiz_count);
  
    $quiz.attr('id', name);
  
    var height = $quiz.height();
  
  
    /*
      Add carousel indicators
    */
  
  
    /*
      Slides container div
    */
    var $slides = $("<div>")
      .attr("class", "carousel-inner")
      .attr("role", "listbox")
      .appendTo($quiz);
  
    /*
      Create title slide
    */
    var $title_slide = $("<div>")
      .attr("class", "item active")
      .attr("height", height + "px")
      .appendTo($slides);
  
    $('<h1>')
      .text(quiz_opts.title)
      .attr('class', 'quiz-title')
      .appendTo($title_slide);
  
    var $start_button = $("<div>")
      .attr("class", "quiz-answers")
      .appendTo($title_slide);
  
  var $indicators = $('<ol>')
      .attr('class', 'progress-circles')
  
    $("<button>")
      .attr('class', 'quiz-button btn')
      .text("Start")
      .click(function() {
        $quiz.carousel('next');
        $indicators.addClass('show');
  
      $(".active .quiz-button.btn").each(function(){
        console.log(this.getBoundingClientRect())
        $(this).css("margin-left", function(){
          return ((250 - this.getBoundingClientRect().width) *0.5) + "px"
        })
      })
  
  
  
      })
      .appendTo($start_button);
  
    $indicators
      .appendTo($quiz);
  
    $.each(questions, function(question_index, question) {
      $('<li>')
        .attr('class', question_index ? "" : "dark")
        .appendTo($indicators);
    });
  
    /*
      Add all question slides
    */
    $.each(questions, function(question_index, question) {
  
      var last_question = (question_index + 1 === state.total);
  
      var $item = $("<div>")
        .attr("class", "item")
        .attr("height", height + "px")
        .appendTo($slides);
      var $img_div;
      if (question.image) {
        $img_div = $('<div>')
          .attr('class', 'question-image')
          .appendTo($item);
        $("<img>")
          .attr("class", "img-responsive")
          .attr("src", question.image)
          .appendTo($img_div);
        $('<p>')
          .text(question.image_credit)
          .attr("class", "image-credit")
          .appendTo($img_div);
      }
      $("<div>")
        .attr("class", "quiz-question")
        .html(question.prompt)
        .appendTo($item);
  
      var $answers = $("<div>")
        .attr("class", "quiz-answers")
        .appendTo($item);
  
      // if the question has an image
      // append a container with the image to the item
  
  
      // for each possible answer to the question
      // add a button with a click event
      $.each(question.answers, function(answer_index, answer) {
  
        // create an answer button div
        // and add to the answer container
        var ans_btn = $("<div>")
          .attr('class', 'quiz-button btn')
          .html(answer)
          .appendTo($answers);
  
        // This question is correct if it's
        // index is the correct index
        var correct = (question.correct.index === answer_index);
  
        // default opts for both outcomes
        var opts = {
          allowOutsideClick : false,
          allowEscapeKey : false,
          confirmButtonText: "NEXT",
  
          html : true,
          confirmButtonColor: "rgb(245 222 210)",
          
        };
  
        // set options for correct/incorrect
        // answer dialogue
        if (correct) {
          opts = $.extend(opts, {
            title: "Correct!",
          });
        } else {
          opts = $.extend(opts, {
            title: "Incorrect",
            
          });
        }
  
        if (last_question) {
          opts.confirmButtonText = "Score";
        }
  
        // bind click event to answer button,
        // using specified sweet alert options
        ans_btn.on('click', function() {
  
          function next() {
            // if correct answer is selected,
            // keep track in total
            if (correct) state.correct++;
            $quiz.carousel('next');
  
            // if we've reached the final question
            // set the results text
            if (last_question) {
              $results_title.html(resultsText(state));
              $results_ratio.text(
                "You got " +
                Math.round(100*(state.correct/state.total)) +
                "% of the questions correct!"
              );




              $facebook_link.attr('href', facebook(state, quiz_opts));
              $twitter_link.attr('href', tweet(state, quiz_opts));





              $indicators.removeClass('show');
              // indicate the question number
              $indicators.find('li')
                .removeClass('dark')
                .eq(0)
                .addClass('dark');
            } else {
              // indicate the question number
              $indicators.find('li')
                .removeClass('dark')
                .eq(question_index+1)
                .addClass('dark');
            }
            // unbind event handler
            $('.sweet-overlay').off('click', next);
          }
  
          // advance to next question on OK click or
          // click of overlay
          swal(opts, next);
  
        });
  
      });
  
  
    });
  
  
    // final results slide
    var $results_slide = $("<div>")
      .attr("class", "item")
      .attr("height", height + "px")
      .appendTo($slides);
  
    var $results_title = $('<h1>')
      .attr('class', 'results-title')
      .appendTo($results_slide);
  
    var $results_ratio = $('<div>')
      .attr('class', 'results-ratio')
      .appendTo($results_slide);
  
 
  
    var $social = $("<div>")
      .attr('class', 'results-social')
      .html('<div id = "social-text">Share your results with your friends</div>')
      .appendTo($results_slide);
  

  
    var $facebook_link = $('<a>')
      .html('<span class="social social-facebook follow-fb"> <img style="margin-bottom:25px; position:relative; right:13px" src="chatCircle.png" width="31" height="31"> </span>')
      .appendTo($social);
  

      var $twitter_link = $('<a>')
      .html('<span class="social social-twitter follow-tw"></span>')
      .appendTo($social);
    
  
    $(window).on('resize', function() {
      $quiz.find(".item")
        .attr('height', $quiz.height() + "px");
    });
  
  }
  
  

  function resultsText(state) {
  
    var ratio = state.correct / state.total;
    var text;
  
    switch (true) {
      case (ratio === 1):
        text = "Never thought you'd get this far but congrats";
        break;
      case (ratio > 0.5):
        text = "You're average";
        break;
      case (ratio < 0.4 && ratio != 0):
        text = "No wonder people always talk about you behind your back";
        break;
      case (ratio == 0):
        text = "Even my Grandma was able to get more correct";
        break;
    }
    return text;
    
    
  
  }
  
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!

today = mm + '/' + dd;



  function facebook(state, opts) {
  
    var body = (

            opts.title +
      " " +
      today +
      " " +
      state.correct +
      "/" +
      state.total +
      "\n" +
      opts.url

    );
  
    return (
      "sms:&body=" +
      encodeURIComponent(body)
    );
  
  }







  function tweet(state, opts) {
  
    var body = (
            opts.title +
      " " +
      today +
      " " +
      state.correct +
      "/" +
      state.total +
      "\n" +
      opts.url
  
    return (
      "http://twitter.com/intent/tweet?text=" +
      encodeURIComponent(body)
    );
  
  }
  

  




  
  






  


   


    





  })(jQuery);
  
  
