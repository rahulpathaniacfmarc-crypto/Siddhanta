import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "50mb" }));

function getGeminiApiKey(): string {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY || "";
}

// Planet schema helper
const planetSchema = {
  type: "OBJECT",
  properties: {
    sign: { type: "STRING" },
    signNumber: { type: "INTEGER" },
    degree: { type: "NUMBER" },
    house: { type: "INTEGER" },
    nakshatra: { type: "STRING" },
    isRetrograde: { type: "BOOLEAN" }
  },
  required: ["sign", "signNumber", "degree", "house", "nakshatra"]
};

// Divisional Chart schema helper
const chartDetailsSchema = {
  type: "OBJECT",
  properties: {
    name: { type: "STRING" },
    description: { type: "STRING" },
    ascendant: { type: "STRING" }
  }
};

// Vedic Astrology JSON schema definition for calculation
const kundliSchema = {
  type: "OBJECT",
  properties: {
    birthInfo: {
      type: "OBJECT",
      properties: {
        name: { type: "STRING" },
        dob: { type: "STRING" },
        tob: { type: "STRING" },
        pob: { type: "STRING" },
        latitude: { type: "NUMBER" },
        longitude: { type: "NUMBER" },
        timezone: { type: "STRING" },
      },
      required: ["name", "dob", "tob", "pob"],
    },
    lagna: {
      type: "OBJECT",
      properties: {
        sign: { type: "STRING" },
        signNumber: { type: "INTEGER" },
        degree: { type: "NUMBER" },
        nakshatra: { type: "STRING" },
        nakshatraLord: { type: "STRING" },
      },
      required: ["sign", "signNumber", "degree", "nakshatra", "nakshatraLord"],
    },
    planets: {
      type: "OBJECT",
      properties: {
        Sun: planetSchema,
        Moon: planetSchema,
        Mars: planetSchema,
        Mercury: planetSchema,
        Jupiter: planetSchema,
        Venus: planetSchema,
        Saturn: planetSchema,
        Rahu: planetSchema,
        Ketu: planetSchema,
      },
      required: ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"],
    },
    divisionalCharts: {
      type: "OBJECT",
      properties: {
        D1: chartDetailsSchema,
        D9: chartDetailsSchema,
        D10: chartDetailsSchema,
      },
      required: ["D1", "D9", "D10"],
    },
    yogas: { type: "ARRAY", items: { type: "OBJECT" } },
    doshas: { type: "ARRAY", items: { type: "OBJECT" } },
    vimshottariDasha: { type: "ARRAY", items: { type: "OBJECT" } },
    shadbala: { type: "OBJECT" },
    ashtakavarga: { type: "OBJECT" }
  },
  required: ["birthInfo", "lagna", "planets", "divisionalCharts", "yogas", "doshas", "vimshottariDasha", "shadbala", "ashtakavarga"]
};

// API Route for calculating Horoscope using direct REST fetch to avoid SDK auth mismatch
app.post("/api/astrology/calculate", async (req, res) => {
  const activeKey = getGeminiApiKey();
  if (!activeKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing in Render." });
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

    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: kundliSchema,
            temperature: 0.2,
          },
        }),
      }
    );

    const result = await apiResponse.json();

    if (!apiResponse.ok) {
      throw new Error(result.error?.message || "Failed to communicate with Gemini API");
    }

    const candidateText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error("Empty response received from generation engine.");
    }

    const data = JSON.parse(candidateText.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Calculation Error:", error);
    res.status(500).json({ error: "Failed to calculate horoscope: " + error.message });
  }
});

// Static assets handling for production
const distPath = path.join(process.cwd(), "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
