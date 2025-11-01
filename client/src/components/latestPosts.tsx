import React, { FC, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Card from "./cardClean";

const LatestPosts: FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const [language, setLanguage] = useState<"English" | "Hindi">("English");
  const selectedValue = useMemo(() => language, [language]);

  const [newsData, setNewsData] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const pageSize = 12;
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // prefer env var; fallback to empty string so missing key shows a readable error
  const GNEWS_API_KEY = process.env.NEXT_PUBLIC_GNEWS_API_KEY || "";

  

  const router = useRouter();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    // reset when language or api key changes
    setNewsData([]);
    setPage(1);
    setHasMore(true);
  }, [language, GNEWS_API_KEY]);

  useEffect(() => {
    const aborter = new AbortController();
    async function fetchNewsPage() {
      setLoading(true);
      setError(null);
      try {
        if (!GNEWS_API_KEY) {
          setError("GNews API key is not configured. Set NEXT_PUBLIC_GNEWS_API_KEY in .env.local");
          setNewsData([]);
          setHasMore(false);
          return;
        }
        const lang = language === "English" ? "en" : "hi";
        // Use pagination: page and max (pageSize)
        const url = `https://gnews.io/api/v4/top-headlines?lang=${lang}&country=in&topic=politics&max=${pageSize}&page=${page}&apikey=${GNEWS_API_KEY}`;
        const res = await fetch(url, { signal: aborter.signal });
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const data = await res.json();
        const articles = data?.articles || [];
        // append or replace depending on page
        setNewsData(prev => {
          const combined = page === 1 ? articles : [...prev, ...articles];
          // dedupe by url
          const seen = new Set<string>();
          return combined.filter((a: any) => {
            const u = (a.url || a.link || "") as string;
            if (!u) return true;
            if (seen.has(u)) return false;
            seen.add(u);
            return true;
          });
        });
        // if fewer than pageSize returned, no more pages
        setHasMore(articles.length === pageSize && articles.length > 0);
      } catch (err: any) {
        if (err.name !== "AbortError") setError(String(err.message || err));
      } finally {
        setLoading(false);
      }
    }
    fetchNewsPage();
    return () => aborter.abort();
  }, [language, GNEWS_API_KEY, page]);

  // read tag from query string and keep in state
  useEffect(() => {
    if (!router) return;
    const tag = router.query.tag;
    if (typeof tag === "string" && tag.trim().length > 0) setSelectedTag(tag.trim());
    else setSelectedTag(null);
  }, [router.query.tag]);

  

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
  // if a tag is selected via the categories menu, filter further by tag keywords
  // mapping from UI category labels to keyword lists for broader matching
  const tagKeywordMap: Record<string, string[]> = {
    "external affairs": ["external","foreign","diplom","embassy","ambassador","foreign minister","bilateral","international"],
    "law and justice": ["court","judge","supreme court","high court","law","justice","verdict","judiciary"],
    "youth affairs and sports": ["youth","sports","player","athlete","olympic","asian games","cricket","football","tournament"],
    "finance": ["finance","economy","budget","tax","rbi","gst","inflation","fiscal","bank"],
    "internal security": ["security","police","insurgency","terror","attack","internal security","counter"],
    "culture": ["culture","festival","heritage","arts","museum","cinema","film"],
    "information and broadcasting": ["broadcast","media","television","information","broadcaster","press","news agency"],
    "home affairs": ["home","police","internal","migration","citizen","home ministry"],
    "science and technology": ["science","technology","research","space","isro","innovation","tech","ai","machine learning"],
    "electronics and information technology": ["electronics","information technology","it","software","semiconductor","chip","digital","telecom"],
  };

  const displayedNews = selectedTag
    ? newsPolitical.filter((a) => {
        const text = ((a.title || "") + " " + (a.description || "") + " " + (a.source?.name || "")).toString().toLowerCase();
        const key = selectedTag.toLowerCase();
        const kws = tagKeywordMap[key] || [key];
        return kws.some(k => text.includes(k));
      })
    : newsPolitical;

  // Small summarizer and emotion detector to provide inline summaries per article
  const summarizeText = (t: string) => {
    if (!t) return "No summary available.";
    const s = t.replace(/\n+/g, " ").split(/(?<=[.?!])\s+/);
    if (s.length >= 2) return (s[0] + (s[1] ? " " + s[1] : "")).trim();
    if (t.length <= 240) return t;
    return t.slice(0, 220).trim() + "...";
  };

  // Return emotion label plus counts so UI percentages can be derived consistently
  const detectEmotionData = (t: string) => {
    if (!t) return { label: "Neutral", posCount: 0, negCount: 0 };
    const lower = t.toLowerCase();
    const posWords = ["good","positive","success","win","benefit","improve","happy","gain","praise","support"];
    const negWords = ["bad","negative","loss","fail","concern","angry","crisis","attack","kill","death","problem"];
    const posHi = ["अच्छा","सकारात्मक","सफल","खुश","लाभ","समर्थन","सराहना"];
    const negHi = ["बुरा","नाकारात्मक","हानि","हार","गुस्सा","आक्रमण","मृत","समस्या","चिंता"];
    let posCount = 0;
    let negCount = 0;
    posWords.forEach(w => { if (lower.includes(w)) posCount += 1; });
    negWords.forEach(w => { if (lower.includes(w)) negCount += 1; });
    posHi.forEach(w => { if (lower.includes(w)) posCount += 1; });
    negHi.forEach(w => { if (lower.includes(w)) negCount += 1; });
    let label = "Neutral";
    if (posCount === 0 && negCount === 0) label = "Neutral";
    else if (posCount > negCount) label = "Positive";
    else if (negCount > posCount) label = "Negative";
    return { label, posCount, negCount };
  };

  const computePercentages = (posCount: number, negCount: number) => {
    // simple mapping: if no signals, show neutral 60/20/20
    const totalSignals = posCount + negCount;
    if (totalSignals === 0) return { positive: 20, neutral: 60, negative: 20 };
    // base neutral as leftover
    const positive = Math.round((posCount / totalSignals) * 70) + 15; // scale into 15-85
    const negative = Math.round((negCount / totalSignals) * 70) + 15;
    let neutral = 100 - (positive + negative);
    // clamp
    if (neutral < 0) {
      neutral = 0;
    }
    return { positive, neutral, negative };
  };

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-4">
          <div className="text-3xl font-extrabold">LATEST ARTICLES IN</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage("English")}
              className={`px-4 py-2 rounded-xl text-lg font-bold transition-all duration-200 ${language === "English" ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg" : "bg-white text-black border border-gray-300 shadow-sm"}`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage("Hindi")}
              className={`px-4 py-2 rounded-xl text-lg font-bold transition-all duration-200 ${language === "Hindi" ? "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg" : "bg-white text-black border border-gray-300 shadow-sm"}`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isMounted && <div className="text-sm text-gray-600">{`Last updated: ${new Date().toLocaleString()}`}</div>}
          {selectedTag ? (
            <div className="ml-3 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-semibold flex items-center gap-2">
              <span>Showing:</span>
              <span className="uppercase">{selectedTag}</span>
              <button
                onClick={() => {
                  // clear tag and shallow-push to remove query
                  router.push({ pathname: "/" }, undefined, { shallow: true });
                  setSelectedTag(null);
                }}
                className="ml-2 px-2 py-1 rounded bg-white text-sm"
                aria-label="Clear tag"
              >
                ×
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <hr className="my-4" />

      {loading ? (
        <div className="text-center py-10 text-xl">Loading latest articles...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-600">{error}</div>
      ) : newsPolitical.length === 0 ? (
        <div className="text-center py-10 text-xl">No articles found.</div>
      ) : (
        <div className="w-full">
          <div id="latest-posts" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedNews.map((news, idx) => {
            const contentText = (news.content || news.description || news.title || "").toString();
            const summary = summarizeText(contentText);
            const e = detectEmotionData(contentText);
            const pct = computePercentages(e.posCount, e.negCount);
            return (
              <Card
                key={idx}
                imgUrl={news.image || "/categories/images/politics3.jpg"}
                Title={<span className="font-bold">{news.title}</span>}
                categories={<span className="px-2 py-1 bg-gray-200 rounded">{news.source?.name || "News"}</span>}
                description={<span>{news.description ? `${news.description.slice(0, 120)}...` : "No description."}</span>}
                negative={`${pct.negative}%`}
                neutral={`${pct.neutral}%`}
                positive={`${pct.positive}%`}
                url={news.url}
                summary={summary}
                emotion={e.label}
              />
            );
          })}
        </div>
        <div className="flex justify-center mt-6">
          {hasMore ? (
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-full shadow hover:scale-105 transition-transform duration-150"
            >
              {loading ? "Loading..." : "Load more articles"}
            </button>
          ) : (
            <div className="text-gray-500">No more articles to load.</div>
          )}
        </div>
        </div>
      )}

  {/* AI modal removed as requested */}
    </>
  );
};

export default LatestPosts;
// heading, body, catgeory, url
