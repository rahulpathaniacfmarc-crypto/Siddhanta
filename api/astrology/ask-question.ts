import type { VercelRequest, VercelResponse } from "@vercel/node";

function getGeminiApiKey(): string {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY || "";
}

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

  const { question, kundliData, history } = req.body || {};

  if (!question || !kundliData) {
    return res.status(400).json({ error: "Missing question or kundliData in request." });
  }

  try {
    const systemPreamble = `You are a strict, classical Vedic Astrologer bound by Parashari and Jaimini principles.
You must answer ONLY using the birth chart data provided below as JSON. Do not invent facts not derivable from this chart.
Do NOT recommend remedies, rituals, gemstones, mantras, or spiritual prescriptions of any kind — this platform strictly provides objective planetary interpretation.
Answer using Markdown with short headers (##, ###) and bullet points where useful. Keep the tone precise, classical, and grounded in the chart's actual planetary positions, yogas, doshas, dashas, and divisional charts.

BIRTH CHART DATA (JSON):
${JSON.stringify(kundliData)}`;

    const contextHistory = Array.isArray(history) ? history : [];

    const contents = [
      { role: "user", parts: [{ text: systemPreamble }] },
      { role: "model", parts: [{ text: "Understood. I will answer strictly from this chart's data, in Markdown, without prescribing remedies." }] },
      ...contextHistory,
      { role: "user", parts: [{ text: question }] },
    ];

    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.4,
          },
        }),
      }
    );

    const result = await apiResponse.json();

    if (!apiResponse.ok) {
      throw new Error(result.error?.message || "Failed to communicate with Gemini API");
    }

    const answer = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!answer) {
      throw new Error("Empty response received from the consultation engine.");
    }

    res.status(200).json({ answer });
  } catch (error: any) {
    console.error("Consultation Error:", error);
    res.status(500).json({ error: "Failed to consult the planetary grids: " + error.message });
  }
}
