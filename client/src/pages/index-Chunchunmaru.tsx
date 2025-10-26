import Image from "next/image";
import { Inter } from "next/font/google";
import Header from "../components/header";
import Categories from "@/components/categories";
import LatestPosts from "@/components/latestPosts";
import Card from "@/components/card";
const inter = Inter({ subsets: ["latin"] });

import { useState } from "react";


export default function Home() {
  // ...existing code...
  const [showSummary, setShowSummary] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [emotion, setEmotion] = useState("");

  // Example summary/emotion handler
  const handleSummaryRequest = (description: string, sentiment: string) => {
    setSummaryText(description.slice(0, 100) + "...");
    let score = [0, 0, 0];
    if (sentiment) {
      try {
        score = JSON.parse(sentiment.replace(/'/g, '"'));
      } catch {}
    }
    const maxIdx = score.indexOf(Math.max(...score));
    if (maxIdx === 0) setEmotion("Negative");
    else if (maxIdx === 1) setEmotion("Neutral");
    else setEmotion("Positive");
    setShowSummary(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <Header />
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center justify-center py-10 px-4 text-center bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 shadow-lg rounded-b-3xl mb-8">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-4 tracking-tight">Local Language Feedback Dashboard</h1>
        <p className="text-xl md:text-2xl text-white/90 mb-6 max-w-2xl mx-auto">Get the latest news, summaries, and sentiment analysis in your preferred language. Experience a modern, interactive dashboard for multilingual feedback and insights.</p>
        <img src="/main.jpg" alt="Main" className="rounded-2xl shadow-xl w-full max-w-3xl h-[300px] object-cover border-4 border-white" />
      </section>

      {/* Interactive Summary Section */}
      <div className="flex flex-col items-center justify-center mb-8">
        <button
          className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg text-lg font-semibold hover:scale-105 transition-transform duration-200 mb-4"
          onClick={() => handleSummaryRequest(
            "This is a sample article description for summary and emotion analysis.",
            "[0.2, 0.5, 0.3]"
          )}
        >
          Get Article Summary & Emotion
        </button>
        {showSummary && (
          <div className="p-6 bg-white rounded-2xl shadow-xl w-full max-w-xl">
            <h2 className="text-2xl font-bold mb-2 text-purple-700">AI Summary</h2>
            <p className="text-lg text-gray-700">{summaryText}</p>
            <h3 className="mt-4 text-lg">Emotion: <span className="font-semibold text-pink-600">{emotion}</span></h3>
          </div>
        )}
      </div>

      {/* Main Content Section */}
      <div className="container mx-auto px-4">
        <LatestPosts />
      </div>
    </div>
  );
}
