import React from "react";
import style from "../styles/card.module.css";
import Image from "next/image";

const categoryImageMap: Record<string, string> = {
  Crime: "crime.jpg",
  Culture: "culture.jpg",
  Entertainment: "entertainment.jpg",
  International: "international.jpg",
  Judiciary: "judiciary.jpg",
  Politics: "Politics.jpg",
  Science: "science.jpg",
  Sports: "sports.jpg",
  Technology: "technology.jpg",
  Business: "business.jpg",
};

const card = (props: any) => {
  // Use category name to get correct image filename
  const imageFile = categoryImageMap[props.imgUrl] || "crime.jpg";
  return (
    <div className="flex justify-center items-center">
      <div className="backdrop-blur-lg bg-white/70 border border-purple-200 rounded-3xl shadow-2xl hover:shadow-pink-300 hover:scale-105 transition-all duration-300 w-full max-w-md p-4 m-2">
        <div className="rounded-2xl overflow-hidden mb-2">
          <Image
            src={`/categories/images/${imageFile}`}
            width={400}
            height={200}
            alt={props.imgUrl}
            className="object-cover w-full h-[200px]"
          />
        </div>
        <div className="py-2 px-1">
          <h3 className="flex justify-center text-2xl font-bold text-purple-700 mb-1" id="news-title">
            {props.Title}
          </h3>
          <h6 className="flex justify-center items-center text-sm font-semibold text-gray-600 mb-2" id="news-source">
            {props.categories}
          </h6>
          <p className="text-gray-800 text-base mb-2" id="news-desc">{props.description}</p>
        </div>
        <div className="flex justify-center items-center space-x-6 py-2">
          <div className="flex flex-col justify-center items-center text-green-600 font-semibold">
            Positive <div className="text-lg">{props.positive}%</div>
          </div>
          <div className="flex flex-col justify-center items-center text-orange-500 font-semibold">
            Neutral <div className="text-lg">{props.neutral}%</div>
          </div>
          <div className="flex flex-col justify-center items-center text-red-500 font-semibold">
            Negative <div className="text-lg">{props.negative}%</div>
          </div>
        </div>
        <div className="flex justify-center items-center pt-3">
          <a className="text-lg font-bold text-blue-600 hover:underline hover:text-pink-500 transition-colors duration-200" target="_blank"
            href={props.url}>
            Read More
          </a>
        </div>
      </div>
    </div>
  );
};

export default card;
