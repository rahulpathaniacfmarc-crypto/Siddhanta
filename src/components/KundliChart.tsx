import React from "react";
import { DivisionalChart } from "../types";

interface KundliChartProps {
  chartData: DivisionalChart;
  title: string;
}

// Map sign numbers to classical short Sanskrit/English names
const rashiNames: Record<number, { eng: string; sans: string; element: string }> = {
  1: { eng: "Aries", sans: "Mesha", element: "Fire" },
  2: { eng: "Taurus", sans: "Vrishabha", element: "Earth" },
  3: { eng: "Gemini", sans: "Mithuna", element: "Air" },
  4: { eng: "Cancer", sans: "Karka", element: "Water" },
  5: { eng: "Leo", sans: "Simha", element: "Fire" },
  6: { eng: "Virgo", sans: "Kanya", element: "Earth" },
  7: { eng: "Libra", sans: "Tula", element: "Air" },
  8: { eng: "Scorpio", sans: "Vrischika", element: "Water" },
  9: { eng: "Sagittarius", sans: "Dhanu", element: "Fire" },
  10: { eng: "Capricorn", sans: "Makara", element: "Earth" },
  11: { eng: "Aquarius", sans: "Kumbha", element: "Air" },
  12: { eng: "Pisces", sans: "Meena", element: "Water" },
};

export default function KundliChart({ chartData, title }: KundliChartProps) {
  const { lagna, ...planets } = chartData;

  // Group planets by their house relative to Lagna
  // house = ((planetSign - lagnaSign + 12) % 12) + 1
  const housePlanets: Record<number, string[]> = {};
  for (let i = 1; i <= 12; i++) {
    housePlanets[i] = [];
  }

  // Iterate over each planet
  Object.entries(planets).forEach(([planetName, signNumber]) => {
    const house = ((signNumber - lagna + 12) % 12) + 1;
    // Map standard names to traditional abbreviations
    const shortName = planetName === "Jupiter" ? "Jup" :
                      planetName === "Mercury" ? "Mer" :
                      planetName === "Saturn" ? "Sat" :
                      planetName === "Venus" ? "Ven" :
                      planetName.substring(0, 3);
    housePlanets[house].push(shortName);
  });

  // Calculate the rashi number for a given house
  const getRashiForHouse = (houseNumber: number) => {
    return ((lagna - 1 + (houseNumber - 1)) % 12) + 1;
  };

  // SVG Coordinates for labels and planet lists in a 400x400 frame
  const housePositions: Record<number, { r: { x: number; y: number }; p: { x: number; y: number } }> = {
    1: { r: { x: 200, y: 35 }, p: { x: 200, y: 75 } },
    2: { r: { x: 130, y: 30 }, p: { x: 120, y: 65 } },
    3: { r: { x: 45, y: 110 }, p: { x: 45, y: 145 } },
    4: { r: { x: 40, y: 205 }, p: { x: 80, y: 205 } },
    5: { r: { x: 45, y: 295 }, p: { x: 45, y: 260 } },
    6: { r: { x: 130, y: 380 }, p: { x: 120, y: 345 } },
    7: { r: { x: 200, y: 380 }, p: { x: 200, y: 325 } },
    8: { r: { x: 270, y: 380 }, p: { x: 280, y: 345 } },
    9: { r: { x: 355, y: 295 }, p: { x: 355, y: 260 } },
    10: { r: { x: 360, y: 205 }, p: { x: 320, y: 205 } },
    11: { r: { x: 355, y: 110 }, p: { x: 355, y: 145 } },
    12: { r: { x: 270, y: 30 }, p: { x: 280, y: 65 } },
  };

  return (
    <div id={`kundli-chart-${title.toLowerCase().replace(/\s+/g, "-")}`} className="flex flex-col items-center bg-[#1a1224]/80 border border-[#d8a53d]/30 rounded-none p-6 shadow-[0_0_30px_rgba(216,165,61,0.06)] relative z-10 backdrop-blur-md">
      <div className="text-xs font-bold text-[#d8a53d] uppercase tracking-widest mb-4 font-display">
        {title} Chart
      </div>
      
      <div className="relative w-full max-w-[340px] aspect-square">
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full stroke-[#d8a53d]/30 stroke-[1.5] fill-none"
        >
          {/* Main outer boundary */}
          <rect x="0" y="0" width="400" height="400" className="stroke-[#d8a53d]/80 stroke-2" />

          {/* Diagonals */}
          <line x1="0" y1="0" x2="400" y2="400" className="stroke-[#d8a53d]/30" />
          <line x1="400" y1="0" x2="0" y2="400" className="stroke-[#d8a53d]/30" />

          {/* Central diamond */}
          <polygon points="200,0 400,200 200,400 0,200" className="stroke-[#d8a53d]" />

          {/* Render houses (Rashi numbers & Planets) */}
          {Object.entries(housePositions).map(([houseStr, pos]) => {
            const houseNum = parseInt(houseStr);
            const rashiNum = getRashiForHouse(houseNum);
            const planetsInHouse = housePlanets[houseNum];

            return (
              <g key={houseNum}>
                {/* Rashi Number */}
                <text
                  x={pos.r.x}
                  y={pos.r.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-[#d8a53d]/80 font-mono text-xs font-bold select-none"
                >
                  {rashiNum}
                </text>

                {/* Planets List */}
                <text
                  x={pos.p.x}
                  y={pos.p.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-200 font-sans font-bold text-[11px] select-none tracking-wide"
                >
                  {planetsInHouse.length > 0 ? (
                    // Stagger planetary abbreviations if there are multiple
                    planetsInHouse.map((p, idx) => {
                      const isKetuOrRahu = p === "Rah" || p === "Ket";
                      const colorClass = isKetuOrRahu ? "fill-[#c76b8f]" : "fill-slate-200";
                      
                      // For horizontal or vertical listing
                      const offsetMultiplier = 14;
                      const startOffset = -((planetsInHouse.length - 1) / 2) * offsetMultiplier;
                      
                      // If house is left or right diamond, stack horizontally. Otherwise stack vertically/horizontally based on aesthetic
                      const isHorizontal = houseNum === 4 || houseNum === 10 || houseNum === 1 || houseNum === 7;
                      
                      return (
                        <tspan
                          key={p}
                          x={isHorizontal ? pos.p.x + startOffset + (idx * offsetMultiplier) : pos.p.x}
                          dy={!isHorizontal && idx > 0 ? "13" : "0"}
                          className={`${colorClass}`}
                        >
                          {p}
                        </tspan>
                      );
                    })
                  ) : null}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 justify-center text-[10px] text-slate-300 font-mono">
        <span className="flex items-center gap-1 border border-[#d8a53d]/20 rounded-none px-2 py-0.5 bg-[#160f1f]">
          <span className="text-[#d8a53d] font-bold">ASC:</span> {rashiNames[lagna]?.sans} ({rashiNames[lagna]?.eng})
        </span>
        <span className="flex items-center gap-1 border border-[#d8a53d]/20 rounded-none px-2 py-0.5 bg-[#160f1f]">
          <span className="text-[#d8a53d] font-bold">Pls:</span> 9 Grahas
        </span>
      </div>
    </div>
  );
}
