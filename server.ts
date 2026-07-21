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

// Initialize CONFIG_FILE path in /tmp for serverless read/write safety
const CONFIG_FILE = path.join("/tmp", "sheet-config.json");
const SUGGESTIONS_FILE = path.join("/tmp", "suggestions.json");

// Helper to resolve the active Gemini API Key
function getGeminiApiKey(): string {
  const envKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY;
  if (envKey) return envKey;

  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
      if (config && config.geminiApiKey) return config.geminiApiKey;
    }
  } catch (err) {
    console.error("Error reading geminiApiKey from config:", err);
  }

  return "";
}

// Lazy helper to instantiate GoogleGenAI client with current active key
function getAiClient() {
  const activeKey = getGeminiApiKey();
  return new GoogleGenAI({
    apiKey: activeKey,
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
          properties: { sign: { type: Type.STRING }, signNumber: { type: Type.INTEGER }, degree: { type: Type.NUMBER }, house: { type: Type.INTEGER }, nakshatra: { type: Type.STRING }, nakshatraLord: { type: Type.STRING }, dignity: { type: Type.STRING }, isRetrograde: { type: Type.BOOLEAN }, isCombust: { type: Type.BOOLEAN } },
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
            Sun: { type: Type.INTEGER },
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
            Sun: { type: Type.INTEGER },
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
            Sun: { type: Type.INTEGER },
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
          type: { type: Type.STRING },
          description: { type: Type.STRING },
          astrologicalRule: { type: Type.STRING },
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
        Sun: { type: Type.NUMBER },
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
        Sun: { type: Type.ARRAY, items: { type: Type.INTEGER } },
        Moon: { type: Type.ARRAY, items: { type: Type.INTEGER } },
        Mars: { type: Type.ARRAY, items: { type: Type.INTEGER } },
        Mercury: { type: Type.ARRAY, items: { type: Type.INTEGER } },
        Jupiter: { type: Type.ARRAY, items: { type: Type.INTEGER } },
        Venus: { type: Type.ARRAY, items: { type: Type.INTEGER } },
        Saturn: { type: Type.ARRAY, items: { type: Type.INTEGER } },
        Sarvashtakavarga: { type: Type.ARRAY, items: { type: Type.INTEGER } }
      },
      required: ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Sarvashtakavarga"]
    }
  },
  required: ["birthInfo", "lagna", "planets", "divisionalCharts", "yogas", "doshas", "vimshottariDasha", "shadbala", "ashtakavarga"]
};

// API Route for calculating Horoscope
app.post("/api/astrology/calculate", async (req, res) => {
  const activeKey = getGeminiApiKey();
  if (!activeKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is missing. Please set GEMINI_API_KEY in Vercel Environment Variables." });
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

Perform the exact astronomical math based on Lahiri Ayanamsha for calculating Lagna, planets, nakshatras, degrees, Yogas, Dashas, Shadbala, Ashtakavarga, and divisional charts. Return strictly valid JSON conforming to the requested schema.`;

    const response = await getAiClient().models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: kundliSchema,
        temperature: 0.2,
      },
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Calculation Error:", error);
    res.status(500).json({ error: "Failed to calculate horoscope: " + error.message });
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
