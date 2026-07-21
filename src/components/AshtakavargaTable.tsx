import React from "react";
import { AshtakavargaInfo } from "../types";
import { Grid3X3, Info } from "lucide-react";

interface AshtakavargaTableProps {
  ashtakavarga: AshtakavargaInfo;
}

const rashis = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export default function AshtakavargaTable({ ashtakavarga }: AshtakavargaTableProps) {
  const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

  // Heatmap helper for Sarvashtakavarga (SAV) points
  // SAV average is 28. High is >32 (exquisite), low is <25 (challenging).
  const getSAVColor = (points: number) => {
    if (points >= 32) return "bg-emerald-950/40 text-emerald-400 border-emerald-900/40";
    if (points >= 28) return "bg-[#160f1f] text-slate-100 border-[#d8a53d]/20";
    if (points >= 25) return "bg-[#160f1f] text-slate-400 border-[#d8a53d]/10";
    return "bg-[#a8452f]/15 text-[#c76b8f] border-[#a8452f]/30";
  };

  return (
    <div id="ashtakavarga-table" className="bg-[#1a1224]/80 border border-[#d8a53d]/30 rounded-none p-6 shadow-[0_0_30px_rgba(216,165,61,0.06)] overflow-hidden relative z-10 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-4">
        <Grid3X3 className="w-5 h-5 text-[#d8a53d]" />
        <h2 className="text-xs font-bold text-[#d8a53d] uppercase tracking-widest font-display">Ashtakavarga Points</h2>
      </div>

      <p className="text-xs text-slate-300 mb-6 leading-relaxed font-serif">
        Ashtakavarga scores represent the bindus (points) contributed by planets in each of the 12 Rashis. The Sarvashtakavarga (SAV) represents total energy; scores above 28 are exceptionally auspicious for transits.
      </p>

      {/* Responsive horizontal scroll container */}
      <div className="overflow-x-auto rounded-none border border-[#d8a53d]/20 bg-[#160f1f]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#d8a53d]/20 bg-[#241733] text-slate-300 uppercase text-[10px] tracking-wider">
              <th className="p-3 font-bold font-sans text-[#d8a53d]">Graha / Rashi</th>
              {rashis.map((rashi, idx) => (
                <th key={rashi} className="p-3 text-center font-semibold font-mono text-[#d8a53d]/80">
                  {idx + 1} <span className="text-[10px] text-slate-400 font-normal">({rashi.substring(0, 3)})</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {planets.map((planet) => {
              const scores = (ashtakavarga as any)?.[planet] || Array(12).fill(4);
              return (
                <tr key={planet} className="border-b border-[#d8a53d]/10 hover:bg-[#241733]/40 transition-colors text-slate-200">
                  <td className="p-3 font-semibold text-slate-200">{planet}</td>
                  {scores.map((score: number, idx: number) => {
                    const isHigh = score >= 5;
                    const isLow = score <= 2;
                    return (
                      <td
                        key={idx}
                        className={`p-3 text-center font-mono ${
                          isHigh ? "text-emerald-400 font-bold" : isLow ? "text-[#c76b8f]" : "text-slate-300"
                        }`}
                      >
                        {score}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            
            {/* SAV Row */}
            <tr className="bg-[#241733]/40">
              <td className="p-3 font-bold text-[#d8a53d] tracking-wider uppercase text-[10px] font-display">SAV (Total)</td>
              {(ashtakavarga?.Sarvashtakavarga || []).map((score: number, idx: number) => (
                <td
                  key={idx}
                  className={`p-3 text-center font-mono font-bold border-t border-b ${getSAVColor(score)}`}
                >
                  {score}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex gap-2 p-3 bg-[#160f1f] rounded-none border border-[#d8a53d]/20 text-[10px] text-slate-300">
        <Info className="w-4 h-4 text-[#d8a53d] shrink-0" />
        <div className="leading-relaxed font-serif">
          <span className="font-semibold text-[#d8a53d] font-sans">Ashtakavarga Key:</span> SAV points reflect the net support a house provides. Whenever transiting slow-moving planets (Saturn, Jupiter) pass through houses with high SAV points (&gt; 30), they deliver outstanding career, financial, or personal breaks.
        </div>
      </div>
    </div>
  );
}
