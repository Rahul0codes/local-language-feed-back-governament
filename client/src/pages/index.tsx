import Image from "next/image";
import { Inter } from "next/font/google";
import Header from "../components/header";
import Categories from "@/components/categories";
import LatestPosts from "@/components/latestPosts";
import ImageGallery from "@/components/ImageGallery";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <Header />

      {/* Hero Section */}
      <section className="w-full flex flex-col items-center justify-center py-10 px-4 text-center bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 shadow-lg rounded-b-3xl mb-8">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-4 tracking-tight">Local Language Feedback Dashboard</h1>
        <p className="text-xl md:text-2xl text-white/90 mb-6 max-w-2xl mx-auto">Get the latest news, summaries, and sentiment analysis in your preferred language. Experience a modern, interactive dashboard for multilingual feedback and insights.</p>
        <img src="/main.jpg" alt="Main" className="rounded-2xl shadow-xl w-full max-w-3xl h-[300px] object-cover border-4 border-white" />
      </section>

      {/* Brief intro */}
      <div className="flex flex-col items-center justify-center mb-8">
        <p className="text-lg text-white/90 max-w-2xl mx-auto">Browse the latest political news in English or Hindi. Click any article card to view an AI-style summary and the detected dominant emotion.</p>
      </div>

      {/* Supporting sections */}
      <div className="container mx-auto px-4">
        <Categories />
        <div className="mt-6 mb-6">
          <ImageGallery />
        </div>
        <LatestPosts />
      </div>
    </div>
  );
}
