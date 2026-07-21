import type { VercelRequest, VercelResponse } from "@vercel/node";
import { kvIsConfigured, getSuggestions, addSuggestion, getConfig } from "../../lib/store";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!kvIsConfigured()) {
    return res.status(500).json({
      error:
        "No persistent storage is configured. Add the Vercel KV (or Upstash) integration to this project in Vercel Project Settings -> Storage, then redeploy.",
    });
  }

  if (req.method === "GET") {
    try {
      const [suggestions, config] = await Promise.all([getSuggestions(), getConfig()]);
      return res.status(200).json({
        suggestions,
        sheetWebhookUrl: config.sheetWebhookUrl || "",
        geminiApiKey: config.geminiApiKey || "",
      });
    } catch (error: any) {
      console.error("Fetch suggestions error:", error);
      return res.status(500).json({ error: "Failed to load suggestions: " + error.message });
    }
  }

  if (req.method === "POST") {
    const { name, email, phone, suggestion } = req.body || {};

    if (!name || !email || !phone || !suggestion) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const entry = {
      id: `sugg-${Date.now()}`,
      name,
      email,
      phone,
      suggestion,
      timestamp: new Date().toISOString(),
    };

    try {
      await addSuggestion(entry);

      // Best-effort forward to a configured Google Sheet webhook (Apps Script Web App URL).
      // Failures here should not block the submission from succeeding.
      try {
        const config = await getConfig();
        if (config.sheetWebhookUrl) {
          await fetch(config.sheetWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(entry),
          });
        }
      } catch (forwardError) {
        console.error("Sheet webhook forward failed:", forwardError);
      }

      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Save suggestion error:", error);
      return res.status(500).json({ error: "Failed to submit suggestion: " + error.message });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
