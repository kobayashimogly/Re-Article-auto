// src/utils/callGemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Gemini 2.5 Flash を使用
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

/**
 * Gemini にプロンプトを投げてテキストを返す
 * @param {string} prompt
 * @returns {Promise<string>}
 */
export async function callGemini(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error("❌ Gemini API Error");
    throw err;
  }
}
