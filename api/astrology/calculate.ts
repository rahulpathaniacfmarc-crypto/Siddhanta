import type { VercelRequest, VercelResponse } from "@vercel/node";

function getGeminiApiKey(): string {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY || "";
}

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
        Sun: { type: "OBJECT" },
        Moon: { type: "OBJECT" },
        Mars: { type: "OBJECT" },
        Mercury: { type: "OBJECT" },
        Jupiter: { type: "OBJECT" },
        Venus: { type: "OBJECT" },
        Saturn: { type: "OBJECT" },
        Rahu: { type: "OBJECT" },
        Ketu: { type: "OBJECT" },
      },
      required: ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"],
    },
    divisionalCharts: { type: "OBJECT", required: ["D1", "D9", "D10"] },
    yogas: { type: "ARRAY", items: { type: "OBJECT" } },
    doshas: { type: "ARRAY", items: { type: "OBJECT" } },
    vimshottariDasha: { type: "ARRAY", items: { type: "OBJECT" } },
    shadbala: { type: "OBJECT" },
    ashtakavarga: { type: "OBJECT" },
  },
  required: [
    "birthInfo",
    "lagna",
    "planets",
    "divisionalCharts",
    "yogas",
    "doshas",
    "vimshottariDasha",
    "shadbala",
    "ashtakavarga",
  ],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const activeKey = getGeminiApiKey();
  if (!activeKey) {
    return res
      .status(500)
      .json({ error: "GEMINI_API_KEY environment variable is missing in Vercel Project Settings." });
  }

  const { name, dob, tob, pob, timezone } = req.body || {};

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
    res.status(200).json(data);
  } catch (error: any) {
    console.error("Calculation Error:", error);
    res.status(500).json({ error: "Failed to calculate horoscope: " + error.message });
  }
}
