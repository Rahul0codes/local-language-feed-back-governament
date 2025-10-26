import React from "react";
import { useRouter } from "next/router";

const categories = () => {
  const router = useRouter();
  const items = [
    "External Affairs",
    "Law and Justice",
    "Youth Affairs and Sports",
    "Finance",
    "Internal Security",
    "Culture",
    "Information and Broadcasting",
    "Home Affairs",
    "Science and Technology",
    "Electronics and Information Technology",
  ];

  const goToTag = (tag: string) => {
    // navigate to home with ?tag=... so LatestPosts can pick it up and filter
    router.push({ pathname: "/", query: { tag } }, undefined, { shallow: true });
    // optionally scroll to posts
    const el = document.getElementById("latest-posts");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex justify-center items-center space-x-6 md:space-x-20 pt-3 font-bold bg-gray-50 pb-3 pl-5 pr-5 overflow-x-auto">
      {items.map((it) => (
        <button
          key={it}
          onClick={() => goToTag(it)}
          className="whitespace-nowrap px-3 py-2 rounded-md hover:scale-[1.1] transition-transform duration-200"
        >
          {it}
        </button>
      ))}
    </div>
  );
};

export default categories;
