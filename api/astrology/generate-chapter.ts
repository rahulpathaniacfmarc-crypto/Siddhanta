import type { VercelRequest, VercelResponse } from "@vercel/node";

function getGeminiApiKey(): string {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY || "";
}

// Must stay in sync with `initialChapters` in src/components/ReportViewer.tsx
const CHAPTER_TITLES: Record<number, string> = {
  1: "Vedic Identity, Temperament, and Mind Structure",
  2: "Wealth, Property, Investments, and Debt",
  3: "Career, Leadership, and Professional Path",
  4: "Marriage, Relationships, and Spouse Profile",
  5: "Family, Children, Siblings, and Social Sphere",
  6: "Health, Longevity, Stress, and Obstacles",
  7: "Travel, Foreign Settlement, and Spiritual Journey",
  8: "Vimshottari Dasha & Transit Timing Deep Dive",
  9: "Divisional Charts & Astrological Synthesis",
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

  const { chapterNumber, kundliData } = req.body || {};
  const title = CHAPTER_TITLES[chapterNumber];

  if (!title || !kundliData) {
    return res.status(400).json({ error: "Missing or invalid chapterNumber/kundliData in request." });
  }

  try {
    const prompt = `You are an elite Vedic Astrologer writing a formal chapter of a Parashari horoscope report.

Chapter ${chapterNumber} of 9: "${title}"

Write this chapter using ONLY the birth chart JSON provided below. Reference specific planets, houses, signs, nakshatras, yogas, doshas, dasha periods, and divisional charts (D1/D9/D10) that are actually relevant to this chapter's theme. Do not invent data not present in the chart. Do not recommend remedies, rituals, gemstones, or mantras — this report strictly provides objective interpretation.

Write 500-800 words in flowing prose with occasional Markdown subheaders (###) to break up sections. Be specific and grounded rather than generic.

BIRTH CHART DATA (JSON):
${JSON.stringify(kundliData)}`;

    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
          },
        }),
      }
    );

    const result = await apiResponse.json();

    if (!apiResponse.ok) {
      throw new Error(result.error?.message || "Failed to communicate with Gemini API");
    }

    const content = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      throw new Error("Empty response received from the report engine.");
    }

    res.status(200).json({ content });
  } catch (error: any) {
    console.error("Chapter Generation Error:", error);
    res.status(500).json({ error: "Server error generating chapter: " + error.message });
  }
}
