import React, { useState, useEffect } from "react";
import Card from "../components/card";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";
// import regional_en from "../../public/data/regional.json";
// import regional_hi from "../../public/data/regional_hi.json";
import Crime from "../../public/categories/images/crime.jpg";
import Culture from "../../public/categories/images/culture.jpg";
import Entertainment from "../../public/categories/images/entertainment.jpg";
import International from "../../public/categories/images/international.jpg";
import Judiciary from "../../public/categories/images/judiciary.jpg";
import Politics from "../../public/categories/images/politics3.jpg";
import Science from "../../public/categories/images/science.jpg";
import Sports from "../../public/categories/images/sports.jpg";
import Technology from "../../public/categories/images/technology.jpg";
import Business from "../../public/categories/images/business.jpg";


const latestPosts = () => {
  // Track client mount to avoid hydration errors
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);
  const [selectedKeys, setSelectedKeys] = useState(new Set(["English"]));
  const selectedValue = React.useMemo(
    () => Array.from(selectedKeys).join(", ").replaceAll("_", " "),
    [selectedKeys]
  );
  // State for live articles
  const [newsData, setNewsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // GNews API key (replace with your own key)
  const GNEWS_API_KEY = "3ebc63848202d5e3844862995e2146d4";
  // AI summary, public opinion, and response placeholder
  const [summaries] = useState<Record<number, {
    summary: string;
    opinion: string;
    response: string;
  }>>({
    0: {
      summary: "Israel and Palestine conflict escalates with rocket attacks and military operations.",
      opinion: "Most people are concerned about the humanitarian impact and want peace.",
      response: "The global response is mixed, with calls for ceasefire and aid."
    },
    1: {
      summary: "Historical background of Israel-Palestine enmity and territorial disputes.",
      opinion: "People feel the conflict is deeply rooted and complex.",
      response: "Experts suggest dialogue and international mediation."
    },
    2: {
      summary: "Earthquake in Afghanistan causes casualties and destruction.",
      opinion: "Public sympathy and calls for relief efforts are high.",
      response: "Relief agencies are mobilizing to help affected areas."
    },
    3: {
      summary: "Hamas launches rocket attacks, Israel responds with military force.",
      opinion: "People are worried about escalation and civilian safety.",
      response: "International organizations urge restraint and protection of civilians."
    },
    4: {
      summary: "India wins gold in Asian Games cricket after rain cancels final.",
      opinion: "Fans are proud and celebrate the achievement.",
      response: "Sports authorities commend the team's performance."
    },
    5: {
      summary: "Airport theft incidents highlight security concerns for travelers.",
      opinion: "Travelers demand stricter security and accountability.",
      response: "Airports are reviewing and upgrading security protocols."
    },
    6: {
      summary: "Israel launches military operations in Gaza after Hamas attacks.",
      opinion: "Global opinion is divided, with many calling for peace.",
      response: "Diplomatic efforts are underway to de-escalate the situation."
    },
    7: {
      summary: "Flash floods in Sikkim caused by glacial lake outburst.",
      opinion: "People are concerned about climate change and disaster preparedness.",
      response: "Government and NGOs are providing relief and support."
    },
    8: {
      summary: "Political analysis of Rajasthan elections and seat distribution.",
      opinion: "Voters are interested in fair elections and transparent governance.",
      response: "Election commission ensures proper conduct of polls."
    },
    9: {
      summary: "GST rate cut on millet products to reduce prices.",
      opinion: "Consumers welcome the price reduction and support healthy foods.",
      response: "Retailers adjust prices and promote millet products."
    },
    10: {
      summary: "Commercial real estate demand rises in Tier 2 and 3 cities.",
      opinion: "Local businesses are optimistic about growth opportunities.",
      response: "Government supports infrastructure development."
    },
    11: {
      summary: "A judge and a criminal reunite as former classmates in a viral story.",
      opinion: "People are moved by the emotional reunion and life lessons.",
      response: "Social media shares the story widely, sparking discussions."
    },
    12: {
      summary: "Land dispute in Deoria leads to legal and administrative action.",
      opinion: "Locals want fair resolution and justice.",
      response: "Authorities investigate and take necessary steps."
    },
    13: {
      summary: "Film released in sign language for accessibility to the hearing impaired.",
      opinion: "Public appreciates inclusive efforts in entertainment.",
      response: "Filmmakers plan more accessible releases."
    },
    14: {
      summary: "Alien-themed Tamil film excites audiences with its teaser.",
      opinion: "Fans are excited for innovative storytelling.",
      response: "Producers ramp up marketing and engagement."
    },
    15: {
      summary: "Akshay Kumar's film Mission RaniGanj has a weak box office opening.",
      opinion: "Audience is disappointed but hopeful for improvement.",
      response: "Film critics analyze reasons for low turnout."
    },
    16: {
      summary: "Man wears a garland of applications to highlight unresolved issues at Tehsil Diwas.",
      opinion: "Citizens relate to bureaucratic challenges.",
      response: "Officials promise to address grievances."
    },
    17: {
      summary: "Shakti Didi campaign in UP aims to empower and inform women.",
      opinion: "Women welcome the initiative and seek more support.",
      response: "Government expands awareness and outreach."
    },
    18: {
      summary: "Land dispute in Deoria leads to multiple murders and legal action.",
      opinion: "Community demands justice and safety.",
      response: "Police and administration take strict action."
    }
  });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIdx, setModalIdx] = useState<number | null>(null);

  // Modal content
  const renderModal = () => {
    if (modalIdx === null) return null;
    const info = summaries[modalIdx];
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative animate-fade-in">
          <button className="absolute top-3 right-3 text-2xl font-bold text-gray-400 hover:text-pink-500" onClick={() => setModalOpen(false)}>&times;</button>
          <h2 className="text-3xl font-extrabold text-purple-700 mb-4">AI Article Summary</h2>
          return (
            <div>
              {loading ? (
                <div className="flex justify-center items-center text-2xl py-10">Loading latest articles...</div>
              ) : error ? (
                <div className="flex justify-center items-center text-xl text-red-600 py-10">{error}</div>
              ) : newsData?.length > 0 ? (
                <>
                  <div className="flex justify-center items-center">
                    <div className="flex justify-center items-center text-3xl font-bold m-6">
                      LATEST ARTICLES IN 
                    </div>
                    <div>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button variant="bordered" className="capitalize px-6 py-2 text-2xl font-bold bg-white/80 rounded-xl shadow hover:bg-purple-100 transition-colors duration-200">
                            {selectedValue === "English" ? "English" : "हिन्दी"}
                            <img src="/dropdown.png" className="ml-2" width={24} height={24} alt="" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Language selection"
                          variant="flat"
                          disallowEmptySelection
                          selectionMode="single"
                          selectedKeys={selectedKeys}
                          onSelectionChange={(keys) => setSelectedKeys(new Set(Array.from(keys as Set<string>)))}
                        >
                          <DropdownItem className="w-[120px] text-xl font-bold text-blue-700 hover:bg-blue-100" key="English">English</DropdownItem>
                          <DropdownItem className="w-[120px] text-xl font-bold text-pink-700 hover:bg-pink-100" key="Hindi">हिन्दी</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </div>
                  {isMounted && (
                    <div className="flex justify-center items-center text-lg text-gray-600 mb-2">
                      {`Last updated: ${new Date().toLocaleString()}`}
                    </div>
                  )}
                  <hr className="mb-3" />

                  <div className="grid grid-cols-3 gap-4">
                    {newsData.map((news: any, idx: number) => (
                      <Card
                        imgUrl={news.image || "news.jpg"}
                        Title={<span className="font-extrabold">{news.title}</span>}
                        categories={<span className="flex justify-center items-center" style={{backgroundColor: "#d3d3d3", color: "black", fontWeight: "bold", padding: "5px"}}>{news.source?.name || "News"}</span>}
                        description={<span>About- {news.description ? news.description.slice(0, 60) + "..." : "No description."}<br /><strong>AI Summary:</strong> {news.description ? news.description.slice(0, 60) + "..." : "Loading summary..."}<br /><button className="mt-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-pink-500 text-white rounded-full shadow hover:scale-105 transition-transform duration-200 text-sm font-semibold" onClick={() => { setModalIdx(idx); setModalOpen(true); }}>View Full Summary & Opinion</button></span>}
                        negative={<span style={{ textDecoration: "underline", color: "red" }}>{Math.floor(Math.random() * 40) + 10}%</span>}
                        neutral={<span style={{ textDecoration: "underline", color: "orange" }}>{Math.floor(Math.random() * 40) + 30}%</span>}
                        positive={<span style={{ textDecoration: "underline", color: "green" }}>{Math.floor(Math.random() * 30) + 30}%</span>}
                        url={news.url}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex justify-center items-center text-2xl py-10">No articles found.</div>
              )}
            </div>
          );
                  <Button variant="bordered" className="capitalize px-6 py-2 text-2xl font-bold bg-white/80 rounded-xl shadow hover:bg-purple-100 transition-colors duration-200">
                    {selectedValue === "English" ? "English" : "हिन्दी"}
                    <img src="/dropdown.png" className="ml-2" width={24} height={24} alt="" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Language selection"
                  variant="flat"
                  disallowEmptySelection
                  selectionMode="single"
                  selectedKeys={selectedKeys}
                  onSelectionChange={(keys) => setSelectedKeys(new Set(Array.from(keys as Set<string>)))}
                >
                  <DropdownItem className="w-[120px] text-xl font-bold text-blue-700 hover:bg-blue-100" key="English">English</DropdownItem>
                  <DropdownItem className="w-[120px] text-xl font-bold text-pink-700 hover:bg-pink-100" key="Hindi">हिन्दी</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>

          {/* Show last updated time only after mount to avoid hydration error */}
          {isMounted && (
            <div className="flex justify-center items-center text-lg text-gray-600 mb-2">
              {`Last updated: ${new Date().toLocaleString()}`}
            </div>
          )}
          <hr className="mb-3" />

          <div className="grid grid-cols-3 gap-4">
            {newsData.map((news: any, idx: number) => (
              <Card
                imgUrl={news.image || "news.jpg"}
                Title={<span className="font-extrabold">{news.title}</span>}
                categories={<span className="flex justify-center items-center" style={{backgroundColor: "#d3d3d3", color: "black", fontWeight: "bold", padding: "5px"}}>{news.source?.name || "News"}</span>}
                description={<span>About- {news.description ? news.description.slice(0, 60) + "..." : "No description."}<br /><strong>AI Summary:</strong> {news.description ? news.description.slice(0, 60) + "..." : "Loading summary..."}<br /><button className="mt-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-pink-500 text-white rounded-full shadow hover:scale-105 transition-transform duration-200 text-sm font-semibold" onClick={() => { setModalIdx(idx); setModalOpen(true); }}>View Full Summary & Opinion</button></span>}
                negative={<span style={{ textDecoration: "underline", color: "red" }}>{Math.floor(Math.random() * 40) + 10}%</span>}
                neutral={<span style={{ textDecoration: "underline", color: "orange" }}>{Math.floor(Math.random() * 40) + 30}%</span>}
                positive={<span style={{ textDecoration: "underline", color: "green" }}>{Math.floor(Math.random() * 30) + 30}%</span>}
                url={news.url}
              />
            ))}
    </div>
  {/* Only render modal after mount to avoid hydration error */}
  {isMounted && modalOpen && renderModal()}
        </>
      ) : (
        <div className="flex justify-center items-center text-2xl py-10">No articles found.</div>
      )}
    </>
  );
};

export default latestPosts;

// heading, body, catgeory, url
