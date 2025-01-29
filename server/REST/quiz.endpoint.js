const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const router = express.Router();

const quizEndpoint = (router) => {
    router.post('/api/quiz/recommend', async (req, res) => {
        const { answers } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;
        console.log("Received answers:", answers);

        const description = `Based on the following preferences, suggest a movie or series title ONLY:
         - Mood: ${answers.mood || 'Not specified'}
        - Occasion: ${answers.occasion || 'Not specified'}
        - Available Time: ${answers.time || 'Not specified'}
        - Level of Engagement: ${answers.engagement || 'Not specified'}
         - Preferred Themes: ${answers.themes && answers.themes !== "Doesn't matter" ? answers.themes : 'No specific preference'}
         - Preferred Cinema Era: ${answers.cinemaEra && answers.cinemaEra !== "Doesn't matter" ? answers.cinemaEra : 'No specific preference'}
         - Genres to Avoid: ${answers.avoid_genres && answers.avoid_genres !== "None" ? answers.avoid_genres : 'No specific restrictions'}
         - Desired Emotional Response: ${answers.emotional_response || 'Not specified'}
        `;

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

            const result = await model.generateContent(description);
            console.log('Full Gemini Response:', result);

            const responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No recommendation available';
            console.log("Recommendation:", responseText);

            res.json({ recommendation: responseText });
        } catch (error) {
            console.error('Error connecting to Google Gemini:', error);
            if (error.response) {
                console.error('Error details:', error.response.data);
            }
            res.status(500).send('Błąd podczas generowania rekomendacji.');
        }
    });

    return router;
};

module.exports = quizEndpoint;
