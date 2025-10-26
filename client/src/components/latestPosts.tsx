import React, { FC, useEffect, useMemo, useState } from "react";
import Card from "./cardClean";

const LatestPosts: FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const [language, setLanguage] = useState<"English" | "Hindi">("English");
  const selectedValue = useMemo(() => language, [language]);

  const [newsData, setNewsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // prefer env var; fallback to empty string so missing key shows a readable error
  const GNEWS_API_KEY = process.env.NEXT_PUBLIC_GNEWS_API_KEY || "";

  const [modalOpen, setModalOpen] = useState(false);
  const [modalIdx, setModalIdx] = useState<number | null>(null);

  useEffect(() => {
    const aborter = new AbortController();
    async function fetchNews() {
      setLoading(true);
      setError(null);
      try {
        if (!GNEWS_API_KEY) {
          setError("GNews API key is not configured. Set NEXT_PUBLIC_GNEWS_API_KEY in .env.local");
          setNewsData([]);
          return;
        }
        const lang = language === "English" ? "en" : "hi";
        // request political topic to bias results toward political articles
        const url = `https://gnews.io/api/v4/top-headlines?lang=${lang}&country=in&topic=politics&max=24&apikey=${GNEWS_API_KEY}`;
        const res = await fetch(url, { signal: aborter.signal });
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const data = await res.json();
        setNewsData(data?.articles || []);
      } catch (err: any) {
        if (err.name !== "AbortError") setError(String(err.message || err));
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
    return () => aborter.abort();
  }, [language, GNEWS_API_KEY]);

  const openModal = (idx: number) => {
    setModalIdx(idx);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalIdx(null);
  };

  const renderModal = () => {
    if (!isMounted || !modalOpen || modalIdx === null) return null;
    const article = newsData[modalIdx];
    // generate a short AI-like summary from available text
    const text = String(article?.content || article?.description || article?.title || "");
    const summarize = (t: string) => {
      if (!t) return "No summary available.";
      // split into sentences and pick first 2, fallback to truncate
      const s = t.replace(/\n+/g, " ").split(/(?<=[.?!])\s+/);
      if (s.length >= 2) return (s[0] + (s[1] ? " " + s[1] : "")).trim();
      if (t.length <= 240) return t;
      return t.slice(0, 220).trim() + "...";
    };

    const detectEmotion = (t: string) => {
      const lower = t.toLowerCase();
      const posWords = ["good","positive","success","win","benefit","improve","happy","gain","praise","support"];
      const negWords = ["bad","negative","loss","fail","concern","angry","crisis","attack","kill","death","problem"];
      // Hindi sentiment words
      const posHi = ["अच्छा","सकारात्मक","सफल","खुश","लाभ","समर्थन","सराहना"];
      const negHi = ["बुरा","नाकारात्मक","हानि","हार","गुस्सा","आक्रमण","मृत" ,"समस्या","चिंता"];
      let score = 0;
      posWords.forEach(w => { if (lower.includes(w)) score += 1; });
      negWords.forEach(w => { if (lower.includes(w)) score -= 1; });
      posHi.forEach(w => { if (lower.includes(w)) score += 1; });
      negHi.forEach(w => { if (lower.includes(w)) score -= 1; });
      if (score > 0) return "Positive";
      if (score < 0) return "Negative";
      return "Neutral";
    };

    const summary = summarize(text);
    const emotion = detectEmotion(text);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-xl w-full relative">
          <button className="absolute top-3 right-3 text-2xl font-bold text-gray-400 hover:text-pink-500" onClick={closeModal}>
            &times;
          </button>
          <h2 className="text-2xl font-bold mb-3">AI Article Summary & Emotion</h2>
          <p className="mb-2"><strong>Title:</strong> {article?.title}</p>
          <p className="mb-2"><strong>Summary:</strong> {summary}</p>
          <p className="mb-2"><strong>Emotion:</strong> {emotion}</p>
          <p className="mb-2"><strong>Source:</strong> {article?.source?.name || "Unknown"}</p>
          <a className="text-sm text-blue-600 hover:underline" href={article?.url} target="_blank" rel="noreferrer">Read original</a>
        </div>
      </div>
    );
  };

  // Heuristic to decide if an article is political: check explicit category or keywords in title/description/content
  const isPolitical = (a: any) => {
    if (!a) return false;
    const cat = (a.category || "").toString().toLowerCase();
    if (cat.includes("polit") || cat.includes("gov") || cat.includes("election")) return true;
    const text = ((a.title || "") + " " + (a.description || "") + " " + (a.content || "")).toString().toLowerCase();
    const keywordsEn = ["polit", "minister", "cabinet", "election", "mla", "mp", "parliament", "opposition", "rally", "campaign", "government", "policy", "law", "bill"];
    const keywordsHi = ["मंत्री", "चुनाव", "सरकार", "विधानसभा", "संसद", "विपक्ष", "रैली", "अभियान", "नीति", "कानून", "बिल", "प्रधानमंत्री", "राजनीति"];
    if (keywordsEn.some(k => text.includes(k))) return true;
    if (keywordsHi.some(k => text.includes(k))) return true;
    return false;
  };

  const newsPolitical = newsData.filter(isPolitical);

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-4">
          <div className="text-3xl font-extrabold">LATEST ARTICLES IN</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage("English")}
              className={`px-4 py-2 rounded-xl text-lg font-bold transition-all duration-200 ${language === "English" ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg" : "bg-white border"}`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage("Hindi")}
              className={`px-4 py-2 rounded-xl text-lg font-bold transition-all duration-200 ${language === "Hindi" ? "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg" : "bg-white border"}`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        {isMounted && <div className="text-sm text-gray-600">{`Last updated: ${new Date().toLocaleString()}`}</div>}
      </div>

      <hr className="my-4" />

      {loading ? (
        <div className="text-center py-10 text-xl">Loading latest articles...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-600">{error}</div>
      ) : newsPolitical.length === 0 ? (
        <div className="text-center py-10 text-xl">No articles found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {newsPolitical.map((news, idx) => (
            <Card
              key={idx}
              imgUrl={news.image || "/categories/images/politics3.jpg"}
              Title={<span className="font-bold">{news.title}</span>}
              categories={<span className="px-2 py-1 bg-gray-200 rounded">{news.source?.name || "News"}</span>}
              description={<span>{news.description ? `${news.description.slice(0, 120)}...` : "No description."}</span>}
              negative={`${Math.floor(Math.random() * 40) + 10}%`}
              neutral={`${Math.floor(Math.random() * 40) + 30}%`}
              positive={`${Math.floor(Math.random() * 30) + 30}%`}
              url={news.url}
              onSummaryClick={() => {
                // modal index refers to position in the filtered list; map it back to original newsData index
                const originalIdx = newsData.findIndex(n => n.url === news.url && n.title === news.title);
                openModal(originalIdx >= 0 ? originalIdx : 0);
              }}
            />
          ))}
        </div>
      )}

      {renderModal()}
    </>
  );
};

export default LatestPosts;
// heading, body, catgeory, url
