import React from "react";
import Image from "next/image";

const categoryImageMap: Record<string, string> = {
  Crime: "crime.jpg",
  Culture: "culture.jpg",
  Entertainment: "entertainment.jpg",
  International: "international.jpg",
  Judiciary: "judiciary.jpg",
  Politics: "politics3.jpg",
  Science: "science.jpg",
  Sports: "sports.jpg",
  Technology: "technology.jpg",
  Business: "business.jpg",
};

type CardProps = {
  imgUrl?: string;
  Title?: React.ReactNode;
  categories?: React.ReactNode;
  description?: React.ReactNode;
  negative?: React.ReactNode;
  neutral?: React.ReactNode;
  positive?: React.ReactNode;
  url?: string;
  summary?: string;
  emotion?: string;
};

const CardClean: React.FC<CardProps> = (props) => {
  const imgProp = props.imgUrl;
  const isExternal = typeof imgProp === "string" && (imgProp.startsWith("http://") || imgProp.startsWith("https://"));
  const imageFile = typeof imgProp === "string" && imgProp in categoryImageMap ? categoryImageMap[imgProp] : "crime.jpg";
  const [showSummary, setShowSummary] = React.useState(false);

  return (
    <div className="flex justify-center items-center">
      <div className="backdrop-blur-lg bg-white/70 border border-purple-200 rounded-3xl shadow-2xl hover:shadow-pink-300 hover:scale-105 transition-all duration-300 w-full max-w-md p-4 m-2">
        <div className="rounded-2xl overflow-hidden mb-2 w-full">
          {isExternal ? (
            // For external images use <img> to avoid next/image domain config during dev
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imgProp} alt="news" className="w-full h-[200px] object-cover" />
          ) : (
            // Use CSS background with a remote fallback so missing local files won't show a broken image icon
            <div
              role="img"
              aria-label={String(imgProp || "news image")}
              className="w-full h-[200px] bg-center bg-cover"
              style={{
                backgroundImage: `url('/categories/images/${imageFile}'), url('https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=60')`,
              }}
            />
          )}
        </div>

        <div className="py-2 px-1">
          <h3 className="flex justify-center text-2xl font-bold text-purple-700 mb-1" id="news-title">
            {props.Title}
          </h3>
          <h6 className="flex justify-center items-center text-sm font-semibold text-gray-600 mb-2" id="news-source">
            {props.categories}
          </h6>
          <p className="text-gray-800 text-base mb-2" id="news-desc">{props.description}</p>
          {/* Inline AI summary area inside the card (collapsed by default) */}
          {props.summary ? (
            <div className="mt-2">
              <button
                onClick={() => setShowSummary(s => !s)}
                className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-full shadow hover:scale-105 transition-transform duration-150 text-sm font-semibold"
              >
                {showSummary ? "Hide Summary" : "View Summary"}
              </button>
              {showSummary && (
                <div className="mt-3 bg-gray-50 p-3 rounded">
                  <div className="font-semibold text-sm text-gray-700">AI Summary</div>
                  <div className="text-sm text-gray-800 mt-1">{props.summary}</div>
                  {props.emotion ? (
                    <div className="mt-2 text-sm">Emotion: <span className="font-semibold">{props.emotion}</span></div>
                  ) : null}
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex justify-center items-center space-x-6 py-2">
          <div className="flex flex-col justify-center items-center text-green-600 font-semibold">
            Positive <div className="text-lg">{props.positive}</div>
          </div>
          <div className="flex flex-col justify-center items-center text-orange-500 font-semibold">
            Neutral <div className="text-lg">{props.neutral}</div>
          </div>
          <div className="flex flex-col justify-center items-center text-red-500 font-semibold">
            Negative <div className="text-lg">{props.negative}</div>
          </div>
        </div>

        <div className="flex justify-center items-center gap-4 pt-3">
          <a className="text-lg font-bold text-blue-600 hover:underline hover:text-pink-500 transition-colors duration-200" target="_blank" rel="noreferrer" href={props.url}>
            Read More
          </a>
        </div>
      </div>
    </div>
  );
};

export default CardClean;
