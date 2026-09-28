import { useState } from "react";
import { BookOpen, Search, Volume2, Play, Sparkles, X } from "lucide-react";
import SignAnimationViewer from "../components/SignAnimationViewer.jsx";

const DEFAULT_ISL_GESTURES = [
  {
    id: "good",
    name: "Good / Well Done",
    gloss: "GOOD",
    hindi: "अच्छा / बहुत बढ़िया",
    marathi: "छान / उत्तम",
    category: "greetings",
    description: "Closed fist with only thumb pointing straight up. All 4 fingers are tightly curled into the palm.",
    videoUrl: "/models/good.glb", // Optional fallback direct video URL
  },
  {
    id: "hello",
    name: "Hi / Hello",
    gloss: "HI",
    hindi: "नमस्ते / हेलो",
    marathi: "नमस्कार / हॅलो",
    category: "greetings",
    description: "Open palm facing camera with all 5 fingers fully extended and spread out.",
    videoUrl: "/models/Hi.mp4",
  },
  {
    id: "namaste",
    name: "Namaste / Greetings",
    gloss: "NAMASTE",
    hindi: "नमस्ते / प्रणाम",
    marathi: "नमस्कार / वंदन",
    category: "greetings",
    description: "Both hands held together in prayer position at chest or single hand folded upright.",
    videoUrl: "/models/namaste.glb",
  },
  {
    id: "sorry",
    name: "Sorry",
    gloss: "SORRY",
    hindi: "माफ़ कीजिए / क्षमा करें",
    marathi: "माफ करा / क्षमस्व",
    category: "courtesy",
    description: "Fist held against chest rotating gently in remorse.",
    videoUrl: "/models/Sorry.mp4",
  },
  {
    id: "bad",
    name: "Bad / Not Good",
    gloss: "BAD",
    hindi: "बुरा / ठीक नहीं",
    marathi: "वाईट / योग्य नाही",
    category: "responses",
    description: "Closed fist with thumb pointed strictly downwards.",
    videoUrl: "",
  },
  {
    id: "thankyou",
    name: "Thank You",
    gloss: "THANK YOU",
    hindi: "धन्यवाद / शुक्रिया",
    marathi: "धन्यवाद / आभार",
    category: "courtesy",
    description: "Flat hand with fingers touching chin/lips, then moving outward toward the conversational partner.",
    videoUrl: "",
  },
  {
    id: "please",
    name: "Please",
    gloss: "PLEASE",
    hindi: "कृपया",
    marathi: "कृपया",
    category: "courtesy",
    description: "Flat open hand rubbing chest in a respectful clockwise motion.",
    videoUrl: "",
  },
  {
    id: "yes",
    name: "Yes / Agree",
    gloss: "YES",
    hindi: "हाँ / सहमत",
    marathi: "होय / संमती",
    category: "responses",
    description: "Closed fist nodding up and down like a head nod.",
    videoUrl: "",
  },
  {
    id: "no",
    name: "No / Disagree",
    gloss: "NO",
    hindi: "नहीं / असहमत",
    marathi: "नाही / असंमती",
    category: "responses",
    description: "Index and middle finger tapping thumb or index finger wagging side to side.",
    videoUrl: "",
  },
  {
    id: "water",
    name: "Water",
    gloss: "WATER",
    hindi: "पानी",
    marathi: "पाणी",
    category: "daily_needs",
    description: "'W' shaped three middle fingers touching the chin or cupped hand drinking motion.",
    videoUrl: "",
  },
  {
    id: "food",
    name: "Food / Eat",
    gloss: "FOOD",
    hindi: "खाना / भोजन",
    marathi: "जेवण / अन्न",
    category: "daily_needs",
    description: "Fingertips clustered together brought to the mouth as if eating.",
    videoUrl: "",
  },
  {
    id: "help",
    name: "Help",
    gloss: "HELP",
    hindi: "मदद / सहायता",
    marathi: "मदत / साहाय्य",
    category: "emergency",
    description: "One flat palm underneath supporting a thumbs-up hand, lifting slightly.",
    videoUrl: "",
  },
];

export default function Dictionary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeVideoGesture, setActiveVideoGesture] = useState(null);

  const categories = [
    { id: "all", label: "All Signs" },
    { id: "greetings", label: "Greetings (अभिवादन)" },
    { id: "courtesy", label: "Courtesy (विनम्रता)" },
    { id: "daily_needs", label: "Daily Needs (दैनिक)" },
    { id: "responses", label: "Responses (प्रतिसाद)" },
    { id: "emergency", label: "Emergency (आपत्कालीन)" },
  ];

  const speak = (text, lang) => {
  if (!text || typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const langCode = lang === "hi" ? "hi-IN" : lang === "mr" ? "mr-IN" : "en-IN";
  const voices = window.speechSynthesis.getVoices();

  // Look for exact voice match (e.g., mr-IN for Marathi)
  let matchedVoice = voices.find(
    (v) => v.lang === langCode || v.lang.startsWith(langCode.split("-")[0])
  );

  // If Marathi voice is missing on Windows/Chrome, fallback to Devanagari Hindi voice
  if (!matchedVoice && lang === "mr") {
    matchedVoice = voices.find(
      (v) => v.lang === "hi-IN" || v.lang.startsWith("hi")
    );
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = matchedVoice ? matchedVoice.lang : langCode;
  utterance.rate = 0.85; // Slightly slower for better Marathi articulation
  if (matchedVoice) utterance.voice = matchedVoice;

  window.speechSynthesis.speak(utterance);
};

  const handleSimulateSign = (gesture) => {
    setActiveVideoGesture(gesture);
  };

  const filtered = DEFAULT_ISL_GESTURES.filter((g) => {
    const matchesCat =
      selectedCategory === "all" || g.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCat;
    return (
      matchesCat &&
      (g.name.toLowerCase().includes(q) ||
        g.hindi.toLowerCase().includes(q) ||
        g.marathi.toLowerCase().includes(q) ||
        g.gloss.toLowerCase().includes(q))
    );
  });

  return (
    <main
      className="translator-page"
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "24px 16px",
        color: "#f8fafc",
      }}
    >
      {/* Container Box */}
      <div
        style={{
          background: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Workspace Header Bar */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "20px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            paddingBottom: "16px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              <BookOpen size={20} color="#38bdf8" />
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#ffffff",
                  margin: 0,
                }}
              >
                Indian Sign Language (ISL) Interactive Dictionary
              </h2>
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                margin: 0,
              }}
            >
              Browse standard sign gestures with Hindi, English, and Marathi vocabulary
            </p>
          </div>

          {/* Search Input */}
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "320px",
            }}
          >
            <Search
              size={15}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748b",
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by English, हिंदी, or मराठी..."
              style={{
                width: "100%",
                background: "#020617",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                padding: "8px 12px 8px 36px",
                fontSize: "12px",
                color: "#f8fafc",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Animated Sign Demonstration Area */}
        {activeVideoGesture && (
          <div
            style={{
              marginBottom: "24px",
              background: "#020617",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              borderRadius: "16px",
              padding: "16px",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={16} color="#38bdf8" />
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "bold",
                    color: "#38bdf8",
                  }}
                >
                  {activeVideoGesture.name} — Animated Sign Demonstration
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideoGesture(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Render Animation Player directly using SignAnimationViewer */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "380px",
                background: "#090d16",
                borderRadius: "12px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SignAnimationViewer phrase={activeVideoGesture.gloss || activeVideoGesture.name} />
            </div>
          </div>
        )}

        {/* Category Pills */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "12px",
            marginBottom: "20px",
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "600",
                whiteSpace: "nowrap",
                cursor: "pointer",
                border:
                  selectedCategory === cat.id
                    ? "none"
                    : "1px solid rgba(255, 255, 255, 0.1)",
                background:
                  selectedCategory === cat.id ? "#06b6d4" : "#020617",
                color: selectedCategory === cat.id ? "#020617" : "#94a3b8",
                transition: "all 0.2s ease",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "16px",
          }}
        >
          {filtered.map((g) => (
            <div
              key={g.id}
              style={{
                background: "#020617",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div>
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "8px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: "bold",
                      color: "#ffffff",
                      margin: 0,
                    }}
                  >
                    {g.name}
                  </h3>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "10px",
                      background: "#0f172a",
                      color: "#38bdf8",
                      border: "1px solid rgba(56, 189, 248, 0.3)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    {g.gloss}
                  </span>
                </div>

                {/* Multilingual strip */}
                <div
                  style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    borderRadius: "8px",
                    padding: "8px",
                    marginBottom: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#64748b",
                        fontWeight: "bold",
                      }}
                    >
                      HI:
                    </span>
                    <span style={{ color: "#fcd34d", fontWeight: "500" }}>
                      {g.hindi}
                    </span>
                    <button
                      type="button"
                      onClick={() => speak(g.hindi, "hi")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#94a3b8",
                        cursor: "pointer",
                        padding: "0 2px",
                      }}
                    >
                      <Volume2 size={13} />
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#64748b",
                        fontWeight: "bold",
                      }}
                    >
                      MR:
                    </span>
                    <span style={{ color: "#34d399", fontWeight: "500" }}>
                      {g.marathi}
                    </span>
                    <button
                      type="button"
                      onClick={() => speak(g.marathi, "mr")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#94a3b8",
                        cursor: "pointer",
                        padding: "0 2px",
                      }}
                    >
                      <Volume2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p
                  style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                    margin: 0,
                    lineHeight: "1.5",
                  }}
                >
                  {g.description}
                </p>
              </div>

              {/* Simulate / Buffer Sign Button */}
              <div
                style={{
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  paddingTop: "10px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleSimulateSign(g)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#38bdf8",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>Simulate / Buffer This Sign</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}