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

  // Improved sentiment: take separate fields (title/description/content) and weight them,
  // expand positive/negative lexicons and produce a normalized score so values vary per-article.
  const detectEmotionData = (t: string, title = "", desc = "") => {
    const lower = (title + "\n" + desc + "\n" + (t || "")).toLowerCase();

    if (!lower.trim()) return { label: "Neutral", posScore: 0, negScore: 0 };

    // richer lexicons (not exhaustive) for news domain
    const posWords = [
      "excellent","praise","welcomed","welcomes","acclaim","laud","lauded","support","supported","win","success","benefit","gain","improve","improved","reform","boost","positive","stable","resolved","agreement","deal","consensus"
    ];
    const negWords = [
      "crisis","scandal","corrupt","corruption","accuse","accused","attack","violence","kill","death","dead","disaster","protest","angry","outrage","fail","failed","loss","drop","decline","concern","criticize","criticised","criticized","arrest"
    ];
    const posHi = ["अच्छा","सकारात्मक","सफल","खुश","लाभ","समर्थन","सराहना","सुधार","समाधान"];
    const negHi = ["बुरा","हानि","गुस्सा","आक्रमण","मृत","चिंता","विवाद","आलोचना","भ्रष्टाचार","प्रदर्शन"];

    // weight matches found in title/description/content differently
    const fieldWeights = [
      { text: title || "", w: 3 },
      { text: desc || "", w: 2 },
      { text: t || "", w: 1 },
    ];

    let posScore = 0;
    let negScore = 0;

    const matchCount = (txt: string, words: string[]) => {
      if (!txt) return 0;
      const lw = txt.toLowerCase();
      let s = 0;
      for (const w of words) {
        const re = new RegExp("\\b" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "g");
        const m = lw.match(re);
        if (m) s += m.length;
      }
      return s;
    };

    for (const f of fieldWeights) {
      const fw = f.w;
      posScore += matchCount(f.text, posWords) * fw;
      negScore += matchCount(f.text, negWords) * fw;
      posScore += matchCount(f.text, posHi) * fw;
      negScore += matchCount(f.text, negHi) * fw;
    }

    // if still zero, try checking for strong verbs/phrases
    if (posScore === 0 && negScore === 0) {
      const strongPos = /(welcome|praise|applaud|praised|welcomed|historic|landmark)/i;
      const strongNeg = /(condemn|accuse|scandal|outrage|collapse|crisis|violence|attack|dead)/i;
      if (strongPos.test(lower)) posScore += 2;
      if (strongNeg.test(lower)) negScore += 2;
    }

    // normalize by log(length) to prevent very long articles from dominating
    const wordCount = Math.max(1, lower.split(/\s+/).length);
    posScore = posScore / Math.log10(wordCount + 5);
    negScore = negScore / Math.log10(wordCount + 5);

    let label = "Neutral";
    if (posScore > negScore * 1.1) label = "Positive";
    else if (negScore > posScore * 1.1) label = "Negative";

    return { label, posScore: Math.round(posScore), negScore: Math.round(negScore) };
  };

  const computePercentages = (posScore: number, negScore: number) => {
    const total = posScore + negScore;
    if (total === 0) return { positive: 20, neutral: 60, negative: 20 };
    const posRatio = posScore / total;
    const negRatio = negScore / total;
    // map ratios into 10..80 with some neutral share
    const positive = Math.max(5, Math.min(85, Math.round(posRatio * 80) + 10));
    const negative = Math.max(5, Math.min(85, Math.round(negRatio * 80) + 10));
    let neutral = 100 - (positive + negative);
    if (neutral < 0) neutral = 0;
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
            const pct = computePercentages(e.posScore, e.negScore);
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
  