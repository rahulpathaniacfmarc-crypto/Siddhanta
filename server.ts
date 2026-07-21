import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Initialize CONFIG_FILE path early
const CONFIG_FILE = process.env.VERCEL
  ? path.join("/tmp", "sheet-config.json")
  : path.join(process.cwd(), "sheet-config.json");

// Helper to resolve the active Gemini API Key
function getGeminiApiKey(): string {
  // Always prioritize environment variables first, especially critical for Vercel/production
  const envKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY;
  if (envKey) {
    return envKey;
  }

  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
      if (config && config.geminiApiKey) {
        return config.geminiApiKey;
      }
    }
  } catch (err) {
    console.error("Error reading geminiApiKey from config:", err);
  }

  // Fallback to the user-supplied default Google API Key
  return "AQ.Ab8RN6JkkD4S_T60gWvQB1siV-MeOdbGvOJwZUuaZ7mgQ5qm_g";
}

// Lazy helper to instantiate GoogleGenAI client with current active key
function getAiClient() {
  const activeKey = getGeminiApiKey();
  return new GoogleGenAI({
    apiKey: activeKey || "MISSING",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Vedic Astrology JSON schema definition for calculation
const kundliSchema = {
  type: Type.OBJECT,
  properties: {
    birthInfo: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        dob: { type: Type.STRING },
        tob: { type: Type.STRING },
        pob: { type: Type.STRING },
        latitude: { type: Type.NUMBER },
        longitude: { type: Type.NUMBER },
        timezone: { type: Type.STRING },
      },
      required: ["name", "dob", "tob", "pob"],
    },
    lagna: {
      type: Type.OBJECT,
      properties: {
        sign: { type: Type.STRING },
        signNumber: { type: Type.INTEGER, description: "Aries=1, Taurus=2, ..., Pisces=12" },
        degree: { type: Type.NUMBER },
        nakshatra: { type: Type.STRING },
        nakshatraLord: { type: Type.STRING },
      },
      required: ["sign", "signNumber", "degree", "nakshatra", "nakshatraLord"],
    },
    planets: {
      type: Type.OBJECT,
      properties: {
        Sun: {
          type: Type.OBJECT,
          properties: { sign: { type: Type.STRING }, signNumber: { type: Type.INTEGER }, degree: { type: Type.NUMBER }, house: { type: Type.INTEGER }, nakshatra: { type: Type.STRING }, nakshatraLord: { type: Type.STRING }, dignity: { type: Type.STRING, description: "Exalted, Debilitated, Moolatrikona, Own House, Great Friend, Friend, Neutral, Enemy, Bitter Enemy" }, isRetrograde: { type: Type.BOOLEAN }, isCombust: { type: Type.BOOLEAN } },
          required: ["sign", "signNumber", "degree", "house", "nakshatra", "nakshatraLord", "dignity", "isRetrograde", "isCombust"]
        },
        Moon: {
          type: Type.OBJECT,
          properties: { sign: { type: Type.STRING }, signNumber: { type: Type.INTEGER }, degree: { type: Type.NUMBER }, house: { type: Type.INTEGER }, nakshatra: { type: Type.STRING }, nakshatraLord: { type: Type.STRING }, dignity: { type: Type.STRING }, isRetrograde: { type: Type.BOOLEAN }, isCombust: { type: Type.BOOLEAN } },
          required: ["sign", "signNumber", "degree", "house", "nakshatra", "nakshatraLord", "dignity", "isRetrograde", "isCombust"]
        },
        Mars: {
          type: Type.OBJECT,
          properties: { sign: { type: Type.STRING }, signNumber: { type: Type.INTEGER }, degree: { type: Type.NUMBER }, house: { type: Type.INTEGER }, nakshatra: { type: Type.STRING }, nakshatraLord: { type: Type.STRING }, dignity: { type: Type.STRING }, isRetrograde: { type: Type.BOOLEAN }, isCombust: { type: Type.BOOLEAN } },
          required: ["sign", "signNumber", "degree", "house", "nakshatra", "nakshatraLord", "dignity", "isRetrograde", "isCombust"]
        },
        Mercury: {
          type: Type.OBJECT,
          properties: { sign: { type: Type.STRING }, signNumber: { type: Type.INTEGER }, degree: { type: Type.NUMBER }, house: { type: Type.INTEGER }, nakshatra: { type: Type.STRING }, nakshatraLord: { type: Type.STRING }, dignity: { type: Type.STRING }, isRetrograde: { type: Type.BOOLEAN }, isCombust: { type: Type.BOOLEAN } },
          required: ["sign", "signNumber", "degree", "house", "nakshatra", "nakshatraLord", "dignity", "isRetrograde", "isCombust"]
        },
        Jupiter: {
          type: Type.OBJECT,
          properties: { sign: { type: Type.STRING }, signNumber: { type: Type.INTEGER }, degree: { type: Type.NUMBER }, house: { type: Type.INTEGER }, nakshatra: { type: Type.STRING }, nakshatraLord: { type: Type.STRING }, dignity: { type: Type.STRING }, isRetrograde: { type: Type.BOOLEAN }, isCombust: { type: Type.BOOLEAN } },
          required: ["sign", "signNumber", "degree", "house", "nakshatra", "nakshatraLord", "dignity", "isRetrograde", "isCombust"]
        },
        Venus: {
          type: Type.OBJECT,
          properties: { sign: { type: Type.STRING }, signNumber: { type: Type.INTEGER }, degree: { type: Type.NUMBER }, house: { type: Type.INTEGER }, nakshatra: { type: Type.STRING }, nakshatraLord: { type: Type.STRING }, dignity: { type: Type.STRING }, isRetrograde: { type: Type.BOOLEAN }, isCombust: { type: Type.BOOLEAN } },
          required: ["sign", "signNumber", "degree", "house", "nakshatra", "nakshatraLord", "dignity", "isRetrograde", "isCombust"]
        },
        Saturn: {
          type: Type.OBJECT,
          properties: { sign: { type: Type.STRING }, signNumber: { type: Type.INTEGER }, degree: { type: Type.NUMBER }, house: { type: Type.INTEGER }, nakshatra: { type: Type.STRING }, nakshatraLord: { type: Type.STRING }, dignity: { type: Type.STRING }, isRetrograde: { type: Type.BOOLEAN }, isCombust: { type: Type.BOOLEAN } },
          required: ["sign", "signNumber", "degree", "house", "nakshatra", "nakshatraLord", "dignity", "isRetrograde", "isCombust"]
        },
        Rahu: {
          type: Type.OBJECT,
          properties: { sign: { type: Type.STRING }, signNumber: { type: Type.INTEGER }, degree: { type: Type.NUMBER }, house: { type: Type.INTEGER }, nakshatra: { type: Type.STRING }, nakshatraLord: { type: Type.STRING }, dignity: { type: Type.STRING }, isRetrograde: { type: Type.BOOLEAN }, isCombust: { type: Type.BOOLEAN } },
          required: ["sign", "signNumber", "degree", "house", "nakshatra", "nakshatraLord", "dignity", "isRetrograde", "isCombust"]
        },
        Ketu: {
          type: Type.OBJECT,
          properties: { sign: { type: Type.STRING }, signNumber: { type: Type.INTEGER }, degree: { type: Type.NUMBER }, house: { type: Type.INTEGER }, nakshatra: { type: Type.STRING }, nakshatraLord: { type: Type.STRING }, dignity: { type: Type.STRING }, isRetrograde: { type: Type.BOOLEAN }, isCombust: { type: Type.BOOLEAN } },
          required: ["sign", "signNumber", "degree", "house", "nakshatra", "nakshatraLord", "dignity", "isRetrograde", "isCombust"]
        },
      },
      required: ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"],
    },
    divisionalCharts: {
      type: Type.OBJECT,
      properties: {
        D1: {
          type: Type.OBJECT,
          properties: {
            lagna: { type: Type.INTEGER },
            Sun: { type: Type.INTEGER, description: "Sign number (1-12) in D1" },
            Moon: { type: Type.INTEGER },
            Mars: { type: Type.INTEGER },
            Mercury: { type: Type.INTEGER },
            Jupiter: { type: Type.INTEGER },
            Venus: { type: Type.INTEGER },
            Saturn: { type: Type.INTEGER },
            Rahu: { type: Type.INTEGER },
            Ketu: { type: Type.INTEGER },
          },
          required: ["lagna", "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]
        },
        D9: {
          type: Type.OBJECT,
          properties: {
            lagna: { type: Type.INTEGER },
            Sun: { type: Type.INTEGER, description: "Sign number (1-12) in D9" },
            Moon: { type: Type.INTEGER },
            Mars: { type: Type.INTEGER },
            Mercury: { type: Type.INTEGER },
            Jupiter: { type: Type.INTEGER },
            Venus: { type: Type.INTEGER },
            Saturn: { type: Type.INTEGER },
            Rahu: { type: Type.INTEGER },
            Ketu: { type: Type.INTEGER },
          },
          required: ["lagna", "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]
        },
        D10: {
          type: Type.OBJECT,
          properties: {
            lagna: { type: Type.INTEGER },
            Sun: { type: Type.INTEGER, description: "Sign number (1-12) in D10" },
            Moon: { type: Type.INTEGER },
            Mars: { type: Type.INTEGER },
            Mercury: { type: Type.INTEGER },
            Jupiter: { type: Type.INTEGER },
            Venus: { type: Type.INTEGER },
            Saturn: { type: Type.INTEGER },
            Rahu: { type: Type.INTEGER },
            Ketu: { type: Type.INTEGER },
          },
          required: ["lagna", "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]
        }
      },
      required: ["D1", "D9", "D10"]
    },
    yogas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          type: { type: Type.STRING, description: "Raja Yoga, Dhana Yoga, Panch Mahapurusha, Nabhasa, etc." },
          description: { type: Type.STRING },
          astrologicalRule: { type: Type.STRING, description: "e.g., Lord of 9th and 10th in conjunction" },
          impact: { type: Type.STRING }
        },
        required: ["name", "type", "description", "astrologicalRule", "impact"]
      }
    },
    doshas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          impact: { type: Type.STRING }
        },
        required: ["name", "description", "impact"]
      }
    },
    vimshottariDasha: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          planet: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          subDashas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                planet: { type: Type.STRING },
                startDate: { type: Type.STRING },
                endDate: { type: Type.STRING }
              },
              required: ["planet", "startDate", "endDate"]
            }
          }
        },
        required: ["planet", "startDate", "endDate", "subDashas"]
      }
    },
    shadbala: {
      type: Type.OBJECT,
      properties: {
        Sun: { type: Type.NUMBER, description: "Shashtiamsas (e.g. 300-600)" },
        Moon: { type: Type.NUMBER },
        Mars: { type: Type.NUMBER },
        Mercury: { type: Type.NUMBER },
        Jupiter: { type: Type.NUMBER },
        Venus: { type: Type.NUMBER },
        Saturn: { type: Type.NUMBER }
      },
      required: ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
    },
    ashtakavarga: {
      type: Type.OBJECT,
      properties: {
        Sun: { type: Type.ARRAY, items: { type: Type.INTEGER }, description: "12 integers representing points in 12 rashis" },
        Moon: { type: Type.ARRAY, items: { type: Type.INTEGER } },
        Mars: { type: Type.ARRAY, items: { type: Type.INTEGER } },
        Mercury: { type: Type.ARRAY, items: { type: Type.INTEGER } },
        Jupiter: { type: Type.ARRAY, items: { type: Type.INTEGER } },
        Venus: { type: Type.ARRAY, items: { type: Type.INTEGER } },
        Saturn: { type: Type.ARRAY, items: { type: Type.INTEGER } },
        Sarvashtakavarga: { type: Type.ARRAY, items: { type: Type.INTEGER }, description: "Total points (SAV) in 12 rashis" }
      },
      required: ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Sarvashtakavarga"]
    }
  },
  required: ["birthInfo", "lagna", "planets", "divisionalCharts", "yogas", "doshas", "vimshottariDasha", "shadbala", "ashtakavarga"]
};

// API Route for calculating Horoscope
app.post("/api/astrology/calculate", async (req, res) => {
  const activeKey = getGeminiApiKey();
  if (!activeKey || activeKey === "MISSING") {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured. Please configure your API key in the Admin Panel to enable astrology calculations." });
  }

  const { name, dob, tob, pob, timezone } = req.body;

  if (!name || !dob || !tob || !pob) {
    return res.status(400).json({ error: "Missing required birth details" });
  }

  try {
    const prompt = `You are an elite Vedic astronomy calculator engine.
Calculate the highly precise and astrologically correct Vedic horoscope for the following birth details:
Name: ${name}
Date of Birth: ${dob} (YYYY-MM-DD)
Time of Birth: ${tob} (24-hour HH:MM)
Place of Birth: ${pob}
Timezone: ${timezone || "Auto-detect based on POB"}

Perform the exact astronomical math based on the Lahiri Ayanamsha (Chitra Paksha) for calculating the Lagna (Ascendant), the nine grahas (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu), and their precise nakshatras, quarters (padas), degrees, and sign placements.
Include:
1. D1 Lagna chart rashi numbers and placements (Lagna degree and sign).
2. D9 Navamsha chart rashi placements for all planets and Lagna.
3. D10 Dashamsha chart rashi placements for all planets and Lagna.
4. Classical major yogas (e.g. Panch Mahapurusha, Gaja Kesari, Budhaditya, Adhi, Sunapha, Anapha, Durudhara, Raja Yogas, Dhana Yogas, Vipreet Raja Yogas) mathematically present in this chart.
5. Vimshottari Dasha timeline from birth nakshatra spanning at least 100 years, detailing Mahadashas and their respective 9 Antardashas.
6. Shadbala strengths in Shashtiamsas.
7. Ashtakavarga points for all 7 key planets and the Sarvashtakavarga (SAV) points.

Return strictly valid JSON conforming to the requested schema. Ensure the calculations are highly accurate according to historical planetary positions for ${dob} at ${tob}.`;

    const response = await getAiClient().models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: kundliSchema,
        temperature: 0.2, // Low temperature for high calculation consistency
      },
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Calculation Error:", error);
    res.status(500).json({ error: "Failed to calculate horoscope: " + error.message });
  }
});

// API Route for generating a massive chapter of the Lifetime Guide (modular to ensure 12,000+ words across all sections)
app.post("/api/astrology/generate-chapter", async (req, res) => {
  const activeKey = getGeminiApiKey();
  if (!activeKey || activeKey === "MISSING") {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured. Please configure your API key in the Admin Panel to enable astrology calculations." });
  }

  const { chapterNumber, kundliData } = req.body;

  if (!chapterNumber || !kundliData) {
    return res.status(400).json({ error: "Missing chapter number or horoscope data" });
  }

  const chaptersMap: Record<number, { title: string; prompt: string }> = {
    1: {
      title: "Vedic Identity, Temperament, and Mind Structure",
      prompt: `Analyze the native's core identity, physical traits, basic temperament, thinking patterns, learning abilities, and mental strength. 
Provide a deep interpretation referencing the Ascendant (Lagna) sign, lord, its placement, Nakshatra of Lagna, Moon sign and Nakshatra, and aspects on the 1st, 5th, and 9th houses. Highlight specific classical yogas or combinations from BPHS and Saravali that govern personality. Keep the tone professional, objective, and deeply technical (always explain the "why" by stating house lordships, planetary degrees, and aspects). Do NOT provide remedies. Length: ~1,500 words.`
    },
    2: {
      title: "Wealth, Property, Investments, and Debt",
      prompt: `Analyze the native's financial potential, including salary growth, business revenue, investments, property ownership, vehicles, loans, debt, and litigation.
Examine the 2nd (wealth), 11th (gains), 8th (unearned wealth, inheritance), 12th (losses), and 6th (debts, litigation) houses. Analyze the planetary placements in these houses, their lords, and aspects. Identify any Dhana Yogas or Daridra Yogas. Discuss the native's capacity for asset building and warnings about financial risks. Always explain the "why" with astronomical placements and rules. Do NOT provide remedies. Length: ~1,500 words.`
    },
    3: {
      title: "Career, Leadership, and Professional Path",
      prompt: `Analyze the native's professional journey, including Government jobs vs. Private sector, Business, Entrepreneurship, leadership capacity, public reputation, and foreign career potential.
Examine the 10th house (Karma), its lord, its placements in D1 and D10 (Dashamsha varga), and major aspects. Discuss the planetary influences governing professional titles, fame, and executive authority. Point out specific Panch Mahapurusha yogas or career-enhancing combinations. Explain the mathematical logic behind every conclusion. Do NOT provide remedies. Length: ~1,500 words.`
    },
    4: {
      title: "Marriage, Relationships, and Spouse Profile",
      prompt: `Analyze the native's marital path, marriage timing, stability, romance, and the psychological and physical profile of the spouse.
Examine the 7th house (partnership), its lord, its placement in D1 and D9 (Navamsha varga), Venus (kalatrakaraka) or Jupiter, and any planetary influences (especially Saturn, Mars, Rahu, or Ketu). Discuss compatibility inclinations, emotional depth in relationships, and potential turning points. Explain the "why" referencing precise vargas and dignities. Do NOT provide remedies. Length: ~1,500 words.`
    },
    5: {
      title: "Family, Children, Siblings, and Social Sphere",
      prompt: `Analyze the native's relationship with parents, siblings, children, friends, and the broader social circle.
Examine the 9th/4th houses (parents/home), 3rd house (siblings), 5th house (children), and 11th house (social network, friends). Look at the lords of these houses and their dignities, along with relevant significators (Sun/Moon for parents, Mars for siblings, Jupiter for children). Support each point with classic astrological rules. Do NOT provide remedies. Length: ~1,500 words.`
    },
    6: {
      title: "Health, Longevity, Stress, and Obstacles",
      prompt: `Analyze the native's health, tendencies toward chronic issues, accident vulnerabilities, sleep quality, stress tolerance, and major life hurdles.
Examine the 6th house (disease), 8th house (longevity, sudden events), 12th house (hospitalization, sleep), and the position of the Lagna lord. Analyze the planetary aspects and any Arishta Yogas or weak planetary placements. Discuss physical and psychological vulnerabilities purely from an objective Vedic medical astrology standpoint. Do NOT provide remedies. Length: ~1,500 words.`
    },
    7: {
      title: "Travel, Foreign Settlement, and Spiritual Journey",
      prompt: `Analyze the native's travel inclinations, long-distance journeys, foreign settlement, immigration, and spiritual inclination.
Examine the 9th house (long journeys, higher wisdom), 12th house (foreign lands, solitude), and 3rd/7th houses. Discuss spiritual maturity, interest in deep philosophical texts (BPHS, Jaimini Sutras), and inclination toward renunciation or deep contemplation, referencing Ketu and Jupiter. Support your conclusions with chart logic. Do NOT provide remedies. Length: ~1,500 words.`
    },
    8: {
      title: "Vimshottari Dasha & Transit Timing Deep Dive",
      prompt: `Analyze the major Vimshottari Mahadashas and Antardashas governing the native's lifetime, focusing on current and upcoming periods.
Cross-reference these dashas with major planetary transits (especially Saturn's Sade Sati, Jupiter's transits, and Rahu/Ketu transits). Predict key turning points, critical ages, fortunate windows, and challenging periods. Explain how the dasha lords' house ownership, placements, and strength (Shadbala) dictate the quality of their eras. Maintain strict astrological reasoning. Do NOT provide remedies. Length: ~1,500 words.`
    },
    9: {
      title: "Divisional Charts & Astrological Synthesis",
      prompt: `Synthesize the entire horoscope by reviewing the key Vargas (D1 Lagna, D9 Navamsha, D10 Dashamsha) and planetary strengths (Shadbala, Ashtakavarga).
Explain how hidden strengths in divisional charts can override apparent weaknesses in the D1 chart (Neecha Bhanga Raja Yogas, Vargottama planets). State the overall life purpose, major life lessons, and critical milestones. Conclude with a master synthesis of the horoscope, following the strict rules of classical texts (BPHS, Phaladeepika, Saravali). Length: ~1,500 words.`
    }
  };

  const selectedChapter = chaptersMap[chapterNumber];
  if (!selectedChapter) {
    return res.status(400).json({ error: "Invalid chapter number" });
  }

  try {
    const prompt = `You are a world-class Vedic Astrologer carrying out an exhaustive, lifetime consultation.
You must write a deeply technical, classic Vedic text-based chapter for the native's lifetime horoscope guide.

Horoscope Data:
${JSON.stringify(kundliData, null, 2)}

Chapter: ${selectedChapter.title}
Instructions:
${selectedChapter.prompt}

CRITICAL RULES:
1. Do NOT recommend any remedies (gemstones, mantras, donations, rituals, poojas, temples, remedies of any kind).
2. If remedies are requested or if you are tempted to write them, do NOT write them. Stick entirely to objective analysis and interpretation of the planetary configurations.
3. Every single paragraph must directly reference Vedic Astrology elements: Houses, Signs, Lords, Planetary dignity, Planetary strength, Yogas, Dashas, Vargas, or Transits.
4. Explain the exact mathematical/astrological reason for every conclusion. Never write generic, motivational, or hand-waving statements. Write with the depth of Phaladeepika and Brihat Parashara Hora Shastra.
5. The length must be massive, highly detailed, and thoroughly analytical (~1,500 words). Use clean, professional headings and formatting.`;

    const response = await getAiClient().models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.6,
      },
    });

    res.json({
      chapterNumber,
      title: selectedChapter.title,
      content: response.text?.trim() || "",
    });
  } catch (error: any) {
    console.error("Chapter Generation Error:", error);
    res.status(500).json({ error: "Failed to generate chapter: " + error.message });
  }
});

// API Route for asking any question (minimum 1,000 words output with strict structure)
app.post("/api/astrology/ask-question", async (req, res) => {
  const activeKey = getGeminiApiKey();
  if (!activeKey || activeKey === "MISSING") {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured. Please configure your API key in the Admin Panel to enable astrology calculations." });
  }

  const { question, kundliData, history } = req.body;

  if (!question || !kundliData) {
    return res.status(400).json({ error: "Missing question or horoscope data" });
  }

  try {
    const prompt = `You are a world-class Vedic Astrologer answering a native's specific life question.
Question: "${question}"

Horoscope Data:
${JSON.stringify(kundliData, null, 2)}

Previous Conversation History:
${JSON.stringify(history || [], null, 2)}

CRITICAL FORMATTING & CONTENT RULES:
1. Your response MUST be highly detailed, exhaustive, and contain at least 1,000 words.
2. You must analyze the birth chart first and explain the astrological mechanisms before delivering any answers.
3. You must structure your response exactly with the following sections (use markdown headings):
   - **Summary**: Concise high-level summary of the answer.
   - **Detailed Astrological Analysis**: The core deep dive, detailing houses, signs, lords, aspects, and planetary strengths.
   - **Relevant Houses, Signs, and Planets**: List and explain the role of each house (e.g. 10th house for career, 7th for marriage), sign, and planet involved.
   - **Planetary Strength**: Detail the Shadbala, Ashtakavarga, or dignity (exaltation, debilitation) of the relevant planets.
   - **Relevant Yogas and Doshas**: Explain any yogas or doshas influencing the query.
   - **Current Mahadasha and Antardasha**: Analyze how the current Vimshottari dasha lords affect the timing and outcome of this matter.
   - **Transit Influence**: Analyze current and near-future planetary transits (e.g., Jupiter, Saturn, Rahu/Ketu) affecting the houses in question.
   - **Supporting Factors vs. Conflicting Factors**: Explicitly weigh positive aspects/dignities against negative ones.
   - **Probability Assessment & Expected Time Window**: Give a clear, astrology-supported percentage probability (e.g. 75% probability) and a precise expected time window (e.g., September 2026 - March 2027) based on dashas/transits.
   - **Overall Conclusion**: A highly professional, definitive concluding advice strictly based on planetary parameters.
   - **Confidence Level**: Specify your astrological confidence (e.g., Confidence Level: 85%) based on the strength of chart indicators.
4. ABSOLUTE REMEDY BAN: Do NOT recommend gemstones, mantras, rituals, poojas, temples, donations, or remedies of any kind. If the user's question explicitly asks for remedies, you must politely write:
   "This platform is designed exclusively for objective astrological analysis and interpretation. It intentionally does not recommend remedies, rituals, gemstones, or spiritual prescriptions."
5. Never write generic, motivational, or non-astrological advice. Every paragraph must stand on houses, signs, lords, yogas, or dashas.`;

    const response = await getAiClient().models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.5,
      },
    });

    res.json({
      answer: response.text?.trim() || "",
    });
  } catch (error: any) {
    console.error("Q&A Error:", error);
    res.status(500).json({ error: "Failed to answer question: " + error.message });
  }
});

// Suggestions and Feedback Paths
const SUGGESTIONS_FILE = process.env.VERCEL
  ? path.join("/tmp", "suggestions.json")
  : path.join(process.cwd(), "suggestions.json");

// Helper to get configured Webhook URL
function getSheetWebhookUrl(): string {
  // Always prioritize environment variables first
  if (process.env.SUGGESTIONS_SHEET_URL) {
    return process.env.SUGGESTIONS_SHEET_URL;
  }

  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
      if (config && config.sheetWebhookUrl) {
        return config.sheetWebhookUrl;
      }
    }
  } catch (err) {
    console.error("Error reading sheet config:", err);
  }
  return "";
}

// POST: Submit a new suggestion
app.post("/api/suggestions", async (req, res) => {
  const { name, email, phone, suggestion } = req.body;

  if (!name || !email || !phone || !suggestion) {
    return res.status(400).json({ error: "Missing required feedback fields" });
  }

  try {
    // 1. Read existing suggestions
    let suggestions = [];
    if (fs.existsSync(SUGGESTIONS_FILE)) {
      try {
        suggestions = JSON.parse(fs.readFileSync(SUGGESTIONS_FILE, "utf-8"));
      } catch (e) {
        suggestions = [];
      }
    }

    // 2. Append new suggestion
    const newSuggestion = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      suggestion,
      timestamp: new Date().toISOString()
    };

    suggestions.push(newSuggestion);

    // 3. Write back to local backup file
    fs.writeFileSync(SUGGESTIONS_FILE, JSON.stringify(suggestions, null, 2), "utf-8");

    // 4. Asynchronously attempt to sync to Google Sheet webhook if configured
    const webhookUrl = getSheetWebhookUrl();
    if (webhookUrl) {
      // Run fetch in background so we don't delay user response
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSuggestion)
      })
      .then(async (sheetResponse) => {
        if (!sheetResponse.ok) {
          console.error("Google Sheet Sync status error:", sheetResponse.status);
        } else {
          console.log("Successfully synced suggestion to Google Sheet!");
        }
      })
      .catch((sheetError) => {
        console.error("Google Sheet Sync failed:", sheetError);
      });
    }

    res.json({ status: "success", suggestion: newSuggestion });
  } catch (error: any) {
    console.error("Suggestions submit error:", error);
    res.status(500).json({ error: "Failed to save suggestion: " + error.message });
  }
});

// GET: Fetch all suggestions (Admin Panel)
app.get("/api/suggestions", (req, res) => {
  try {
    let suggestions = [];
    if (fs.existsSync(SUGGESTIONS_FILE)) {
      try {
        suggestions = JSON.parse(fs.readFileSync(SUGGESTIONS_FILE, "utf-8"));
      } catch (e) {
        suggestions = [];
      }
    }

    // Return descending by timestamp (newest first)
    suggestions.sort((a: any, b: any) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    res.json({
      suggestions,
      sheetWebhookUrl: getSheetWebhookUrl(),
      geminiApiKey: getGeminiApiKey()
    });
  } catch (error: any) {
    console.error("Fetch suggestions error:", error);
    res.status(500).json({ error: "Failed to retrieve suggestions" });
  }
});

// POST: Save sheet webhook configuration & Gemini API Key
app.post("/api/suggestions/config", (req, res) => {
  const { sheetWebhookUrl, geminiApiKey } = req.body;
  try {
    let currentConfig: any = {};
    if (fs.existsSync(CONFIG_FILE)) {
      try {
        currentConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
      } catch (err) {
        currentConfig = {};
      }
    }
    
    currentConfig.sheetWebhookUrl = sheetWebhookUrl !== undefined ? sheetWebhookUrl : (currentConfig.sheetWebhookUrl || "");
    if (geminiApiKey !== undefined) {
      currentConfig.geminiApiKey = geminiApiKey || "";
    }

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(currentConfig, null, 2), "utf-8");
    res.json({ status: "success" });
  } catch (error: any) {
    console.error("Save config error:", error);
    res.status(500).json({ error: "Failed to save configuration" });
  }
});

// Setup Vite Dev Server / Static Ingress
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
