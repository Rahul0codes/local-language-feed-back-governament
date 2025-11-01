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
      <section
        className="w-full flex items-center justify-center text-center shadow-lg rounded-b-3xl mb-8"
        style={{
          minHeight: "420px",
          backgroundImage: "linear-gradient(rgba(18,24,39,0.45), rgba(99,102,241,0.15)), url('https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 py-16 px-6 w-full">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-4 tracking-tight">WELCOME TO NEWS ANALYSIS</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">Browse the latest political news in English or Hindi. Click any article card to view an AI-style summary and the detected dominant emotion.</p>
        </div>
      </section>

      {/* brief intro removed to avoid duplication (hero already contains this copy) */}

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
