import React, { useState } from "react";
import { VimshottariDasha } from "../types";
import { ChevronDown, ChevronRight, Calendar, Sparkles } from "lucide-react";

interface DashaTimelineProps {
  dashas: VimshottariDasha[];
}

export default function DashaTimeline({ dashas }: DashaTimelineProps) {
  const [expandedMahadasha, setExpandedMahadasha] = useState<string | null>(null);

  const toggleMahadasha = (planet: string) => {
    if (expandedMahadasha === planet) {
      setExpandedMahadasha(null);
    } else {
      setExpandedMahadasha(planet);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const isCurrentDasha = (startDateStr: string, endDateStr: string) => {
    try {
      const now = new Date();
      const start = new Date(startDateStr);
      const end = new Date(endDateStr);
      return now >= start && now <= end;
    } catch {
      return false;
    }
  };

  return (
    <div id="dasha-timeline" className="bg-[#1a1224]/90 border border-[#d8a53d]/30 rounded-none p-6 shadow-xl relative z-10">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-[#d8a53d]" />
        <h2 className="text-xs font-bold text-[#d8a53d] uppercase tracking-widest font-display">Vimshottari Dasha Periods</h2>
      </div>
      
      <p className="text-xs text-slate-300 mb-6 leading-relaxed font-serif">
        Vimshottari dasha represents the planetary timing cycles of your life. Expand each Mahadasha to inspect the corresponding 9 planetary Antardashas.
      </p>

      <div className="space-y-3">
        {dashas.map((dasha) => {
          const isCurrent = isCurrentDasha(dasha.startDate, dasha.endDate);
          const isExpanded = expandedMahadasha === dasha.planet;

          return (
            <div
              key={dasha.planet}
              className={`border rounded-none transition-all overflow-hidden ${
                isCurrent
                  ? "border-[#d8a53d] bg-[#241733] shadow-md"
                  : "border-[#d8a53d]/20 bg-[#160f1f] hover:border-[#d8a53d]/50"
              }`}
            >
              {/* Mahadasha Header */}
              <button
                onClick={() => toggleMahadasha(dasha.planet)}
                className="w-full flex items-center justify-between p-4 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-none flex items-center justify-center font-bold text-xs ${
                      isCurrent
                        ? "bg-gradient-to-r from-[#d8a53d] to-[#e08b2e] text-[#160f1f] shadow"
                        : "bg-[#241733] text-[#d8a53d] border border-[#d8a53d]/10"
                    }`}
                  >
                    {(dasha.planet || "").substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-xs uppercase tracking-wider font-display">{dasha.planet} Mahadasha</span>
                      {isCurrent && (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-none px-1.5 py-0.5 uppercase tracking-wider">
                          <Sparkles className="w-2.5 h-2.5" /> Active Now
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      {formatDate(dasha.startDate)} — {formatDate(dasha.endDate)}
                    </span>
                  </div>
                </div>
                <div className="text-slate-400 hover:text-[#d8a53d] transition-colors">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-[#d8a53d]" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </div>
              </button>

              {/* Antardashas List */}
              {isExpanded && (
                <div className="border-t border-[#d8a53d]/20 bg-[#1a1224] p-4 rounded-none">
                  <div className="text-[10px] font-bold text-[#d8a53d] tracking-widest uppercase mb-3 font-display">
                    Antardasha Sub-Periods
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {dasha.subDashas.map((sub) => {
                      const isSubActive = isCurrentDasha(sub.startDate, sub.endDate);
                      return (
                        <div
                          key={sub.planet}
                          className={`flex flex-col p-2.5 rounded-none border transition-all ${
                            isSubActive
                              ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-400"
                              : "border-[#d8a53d]/10 bg-[#160f1f] hover:border-[#d8a53d]/30 text-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">{dasha.planet} - {sub.planet}</span>
                            {isSubActive && (
                              <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/60 px-1 py-0.5 rounded-none border border-emerald-500/20">
                                Active
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 leading-tight">
                            {formatDate(sub.startDate)} - {formatDate(sub.endDate)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

