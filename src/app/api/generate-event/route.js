// src/app/api/generate-event/route.js
import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({});

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // gemini-3.6-flash model use karein
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Generate realistic event details based on this request: "${prompt}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            suggestedVenue: { type: Type.STRING },
            unsplashQuery: { type: Type.STRING },
          },
          required: ["title", "category", "description", "suggestedVenue", "unsplashQuery"],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate event" }, { status: 500 });
  }
}