import React from "react";
import { ShadbalaInfo } from "../types";
import { Award, Zap } from "lucide-react";

interface ShadbalaChartProps {
  shadbala: ShadbalaInfo;
}

// Classical minimum Shadbala strengths in Shashtiamsas:
// Sun: 390, Moon: 360, Mars: 300, Mercury: 420, Jupiter: 395, Venus: 330, Saturn: 300
const minimumRequirements: Record<string, number> = {
  Sun: 390,
  Moon: 360,
  Mars: 300,
  Mercury: 420,
  Jupiter: 395,
  Venus: 330,
  Saturn: 300,
};

const planetFullNames: Record<string, string> = {
  Sun: "Sun (Surya)",
  Moon: "Moon (Chandra)",
  Mars: "Mars (Mangala)",
  Mercury: "Mercury (Budha)",
  Jupiter: "Jupiter (Guru)",
  Venus: "Venus (Shukra)",
  Saturn: "Saturn (Shani)",
};

export default function ShadbalaChart({ shadbala }: ShadbalaChartProps) {
  return (
    <div id="shadbala-chart" className="bg-[#1a1224]/80 border border-[#d8a53d]/30 rounded-none p-6 shadow-[0_0_30px_rgba(216,165,61,0.06)] h-full relative z-10 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-[#d8a53d]" />
        <h2 className="text-xs font-bold text-[#d8a53d] uppercase tracking-widest font-display">Planetary Strength (Shadbala)</h2>
      </div>

      <p className="text-xs text-slate-300 mb-6 leading-relaxed font-serif">
        Shadbala calculated in Shashtiamsas measures six different sources of strength. The solid bar is the actual strength; the dotted line represents the classical minimum threshold (Virupa).
      </p>

      <div className="space-y-4">
        {Object.entries(shadbala).map(([planet, strength]) => {
          const req = minimumRequirements[planet] || 300;
          const percentage = Math.min(100, (strength / 600) * 100);
          const reqPercentage = (req / 600) * 100;
          const ratio = (strength / req).toFixed(2);
          const isStrong = strength >= req;

          return (
            <div key={planet} className="group">
              <div className="flex justify-between items-end mb-1">
                <div>
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors font-sans">
                    {planetFullNames[planet] || planet}
                  </span>
                  <span className="text-[10px] text-[#d8a53d]/80 font-mono ml-2">
                    Min Req: {req}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#d8a53d]">{strength} <span className="text-[10px] font-normal text-slate-400">Virupa</span></span>
                  <span className={`text-[10px] ml-2 font-semibold ${isStrong ? "text-emerald-400" : "text-[#c76b8f]"}`}>
                    ({ratio}x)
                  </span>
                </div>
              </div>

              {/* Bar visualization */}
              <div className="relative w-full h-3 bg-[#241733] rounded-none border border-[#d8a53d]/20 overflow-hidden">
                {/* Min Req Dotted line marker */}
                <div 
                  className="absolute top-0 bottom-0 border-r border-dashed border-[#d8a53d]/70 z-10" 
                  style={{ left: `${reqPercentage}%` }}
                  title={`Minimum Required: ${req}`}
                />
                
                {/* Actual Strength */}
                <div
                  className={`h-full rounded-none transition-all duration-1000 ${
                    isStrong 
                      ? "bg-gradient-to-r from-[#d8a53d] to-[#e08b2e]" 
                      : "bg-slate-500"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-0.5">
                <span>0</span>
                <span>300</span>
                <span>600+</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-[#160f1f] border border-[#d8a53d]/20 rounded-none p-3 flex gap-2.5">
        <Zap className="w-4 h-4 text-[#d8a53d] shrink-0 mt-0.5" />
        <div className="text-[11px] text-slate-300 leading-normal font-serif">
          <span className="font-semibold text-[#d8a53d] font-sans">Astrological Note:</span> A planet with strength &gt; 1.0x minimum requirement possesses the power to deliver its natural significations (karakatwas) and house lordships effectively during its Dasha.
        </div>
      </div>
    </div>
  );
}

