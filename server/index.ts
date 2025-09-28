import express from 'express';
import cors from 'cors';
import { initDb, addResult, getResults } from './db';
import { CandidateResult } from '../types';
import { GoogleGenAI } from "@google/genai";

// Fix: Create an Express server to handle API requests.
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Initialize DB
initDb().catch(console.error);

app.post('/submit', async (req, res) => {
    try {
        const submissionData: Omit<CandidateResult, 'id' | 'submissionDate'> = req.body;
        if (!submissionData.name || !submissionData.email) {
            return res.status(400).json({ message: 'Missing required fields: name and email.' });
        }

        const newResult: CandidateResult = {
            ...submissionData,
            id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            submissionDate: new Date().toISOString(),
        };

        await addResult(newResult);
        res.status(201).json({ message: 'Submission successful', data: newResult });
    } catch (error) {
        console.error('Error submitting result:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/results', async (req, res) => {
    try {
        const results = await getResults();
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// A new endpoint for Gemini to analyze essay answers
if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable is not set. AI features will be disabled.");
}

const ai = process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;

app.post('/analyze-essay', async (req, res) => {
    if (!ai) {
        return res.status(503).json({ message: "AI service is not configured. API_KEY is missing." });
    }
    const { question, answer } = req.body;

    if (!question || !answer) {
        return res.status(400).json({ message: 'Missing question or answer in the request body.' });
    }

    try {
        const prompt = `
            Sebagai seorang ahli HR profesional, evaluasi jawaban esai untuk lamaran kerja berikut.
            Berikan evaluasi yang ringkas, konstruktif, dan profesional dalam Bahasa Indonesia.
            Fokus pada kejelasan, relevansi, kemampuan memecahkan masalah, dan ciri kepribadian yang ditunjukkan dalam jawaban.
            Jangan memberikan skor numerik.

            Pertanyaan: "${question}"
            Jawaban Kandidat: "${answer}"

            Evaluasi Anda (gunakan poin-poin markdown, contoh: "* Poin 1"):
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const analysis = response.text;
        res.status(200).json({ analysis });

    } catch (error) {
        console.error('Error analyzing essay with Gemini API:', error);
        res.status(500).json({ message: 'Failed to analyze essay.' });
    }
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});