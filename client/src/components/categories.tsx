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

  const currentTag = typeof router.query.tag === "string" ? router.query.tag.trim().toLowerCase() : null;

  const goToTag = (tag: string) => {
    // navigate to home with ?tag=... so LatestPosts can pick it up and filter
    router.push({ pathname: "/", query: { tag } }, undefined, { shallow: true });
    // scroll to posts after a short delay so the element exists
    setTimeout(() => {
      const el = document.getElementById("latest-posts");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 120);
  };

  return (
    <div className="flex items-center gap-4 pt-3 font-bold bg-gray-50 pb-3 pl-4 pr-4 overflow-x-auto"> 
      {items.map((it) => {
        const key = it.toLowerCase();
        const active = currentTag === key;
        return (
          <button
            key={it}
            onClick={() => goToTag(it)}
            aria-current={active ? "true" : undefined}
            className={`whitespace-nowrap px-3 py-2 rounded-md transition-transform duration-150 ${active ? "bg-blue-600 text-white shadow" : "hover:scale-105 bg-white border"}`}
          >
            {it}
          </button>
        );
      })}
    </div>
  );
};

export default categories;
