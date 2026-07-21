import type { VercelRequest, VercelResponse } from "@vercel/node";
import { kvIsConfigured, updateConfig } from "../../lib/store";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!kvIsConfigured()) {
    return res.status(500).json({
      error:
        "No persistent storage is configured. Add the Vercel KV (or Upstash) integration to this project in Vercel Project Settings -> Storage, then redeploy.",
    });
  }

  const { geminiApiKey, sheetWebhookUrl } = req.body || {};

  if (geminiApiKey === undefined && sheetWebhookUrl === undefined) {
    return res.status(400).json({ error: "Nothing to update. Provide geminiApiKey or sheetWebhookUrl." });
  }

  try {
    const partial: { geminiApiKey?: string; sheetWebhookUrl?: string } = {};
    if (geminiApiKey !== undefined) partial.geminiApiKey = geminiApiKey;
    if (sheetWebhookUrl !== undefined) partial.sheetWebhookUrl = sheetWebhookUrl;

    const updated = await updateConfig(partial);
    res.status(200).json({ success: true, config: updated });
  } catch (error: any) {
    console.error("Update config error:", error);
    res.status(500).json({ error: "Failed to save configuration: " + error.message });
  }
}
