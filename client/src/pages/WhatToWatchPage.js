import React, { useState } from 'react';
import axios from 'axios';
import '../styles/WhatToWatchPage.css';

const WhatToWatchPage = () => {
  const questions = [
    {
      key: 'mood',
      question: 'What kind of mood are you in?',
      options: ['Happy', 'Sad', 'Excited', 'Relaxed', 'Adventurous'],
    },
    {
      key: 'occasion',
      question: 'Who are you watching with?',
      options: ['Alone', 'With a partner', 'With family', 'With friends',"With colleagues"],
    },
    {
      key: 'time',
      question: 'How much time do you have?',
      options: ['Less than an hour', '1-2 hours', 'Over 2 hours', 'Binge-watch all day'],
    },
    {
      key: 'engagement',
      question: 'How much do you want to focus?',
      options: ['I want to fully engage', 'I’m multitasking', 'Something in between'],
    },
    {
      key: 'themes',
      question: 'Which themes do you enjoy in movies?',
      options: ['Love', 'Friendship', 'Revenge', 'Mystery', 'Exploration', 'Survival', 'Comedy', 'Superheroes', 'Doesn\'t matter'],
    },
    {
      key: 'cinemaEra',
      question: 'Do you prefer movies from a specific era?',
      options: ['Classic (before 1980)', '80s and 90s', '2000s', 'Modern','Doesn\'t matter'],
    },
    {
      key: 'avoid_genres',
      question: 'Any genres you want to avoid?',
      options: ['None', 'Horror', 'Drama', 'Romance', 'Sci-Fi'],
    },
    {
      key: 'emotional_response',
      question: 'How do you want to feel after watching?',
      options: ['Inspired', 'Laughing', 'Scared', 'Thoughtful', 'Relaxed'],
    },
  ];

  const [answers, setAnswers] = useState({});
  const [recommendation, setRecommendation] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleAnswer = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setSelectedOption(value);
  };

  const fetchRecommendation = () => {
    axios
      .post('http://localhost:5000/api/quiz/recommend', { answers })
      .then((response) => {
        setRecommendation(response.data.recommendation);
      })
      .catch((error) => {
        setRecommendation('An error occurred while fetching the recommendation.');
      });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(answers[questions[currentQuestionIndex + 1].key] || null);
    } else {
      fetchRecommendation();
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedOption(answers[questions[currentQuestionIndex - 1].key] || null);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="what-to-watch-page">
      {recommendation ? (
        <div className="recommendation-section">
          <h2>Your Recommendation</h2>
          <p>{recommendation}</p>
          <button className="generate-again-button" onClick={fetchRecommendation}>
            Generate Again
          </button>
        </div>
      ) : (
        <div className="quiz-section">
          <h2 className="question-title">{currentQuestion.question}</h2>
          <div className="options-container">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                className={`option-button ${selectedOption === option ? 'selected' : ''}`}
                onClick={() => handleAnswer(currentQuestion.key, option)}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="navigation-buttons">
            <button
              className="previous-button"
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </button>
            <button
              className="next-button"
              onClick={nextQuestion}
              disabled={!selectedOption}
            >
              {currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatToWatchPage;
