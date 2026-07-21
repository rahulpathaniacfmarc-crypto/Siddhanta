import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Compass,
  User,
  Calendar,
  Clock,
  MapPin,
  Globe,
  Loader2,
  Table,
  BookOpen,
  MessageSquare,
  BarChart3,
  RefreshCw,
  Sun,
  Moon,
  Info,
  X
} from "lucide-react";

import { KundliData, BirthInfo, PlanetInfo } from "./types";
import KundliChart from "./components/KundliChart";
import DashaTimeline from "./components/DashaTimeline";
import ShadbalaChart from "./components/ShadbalaChart";
import AshtakavargaTable from "./components/AshtakavargaTable";
import ReportViewer from "./components/ReportViewer";
import ConsultationChat from "./components/ConsultationChat";
import SuggestionsWidget from "./components/SuggestionsWidget";

const planetSanskritNames: Record<string, string> = {
  Sun: "Surya",
  Moon: "Chandra",
  Mars: "Mangala",
  Mercury: "Budha",
  Jupiter: "Guru",
  Venus: "Shukra",
  Saturn: "Shani",
  Rahu: "Rahu",
  Ketu: "Ketu",
};

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<"charts" | "report" | "chat" | "math">("charts");
  
  // Charts sub-selector
  const [activeChartType, setActiveChartType] = useState<"D1" | "D9" | "D10">("D1");

  // Horoscope state
  const [kundliData, setKundliData] = useState<KundliData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Legal & Info Modals
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(() => {
    try {
      return localStorage.getItem("pepl_siddhanta_terms_accepted") === "true";
    } catch {
      return false;
    }
  });
  const [termsChecked, setTermsChecked] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDob, setFormDob] = useState("");
  const [formTob, setFormTob] = useState("");
  const [formPob, setFormPob] = useState("");
  const [formTimezone, setFormTimezone] = useState("");

  // Set default timezone on mount
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setFormTimezone(tz || "UTC");
    } catch {
      setFormTimezone("UTC");
    }
  }, []);

  const handleCastHoroscope = async (e?: React.FormEvent, presetData?: Omit<BirthInfo, "timezone">) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = presetData 
      ? { ...presetData, timezone: "Auto-detect" }
      : {
          name: formName.trim(),
          dob: formDob,
          tob: formTob,
          pob: formPob.trim(),
          timezone: formTimezone,
        };

    if (!payload.name || !payload.dob || !payload.tob || !payload.pob) {
      setError("Please complete all birth details to cast the horoscope.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/astrology/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errMsg = "Failed to calculate horoscope with astronomical precision.";
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (e) {}
        throw new Error(errMsg);
      }

      const data: KundliData = await response.json();
      setKundliData(data);
      
      // Seed forms with the loaded preset data for display convenience
      if (presetData) {
        setFormName(data.birthInfo.name);
        setFormDob(data.birthInfo.dob);
        setFormTob(data.birthInfo.tob);
        setFormPob(data.birthInfo.pob);
        setFormTimezone(data.birthInfo.timezone || "Auto");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while casting your charts.");
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (preset: { name: string; dob: string; tob: string; pob: string }) => {
    handleCastHoroscope(undefined, preset);
  };

  const handleReset = () => {
    setKundliData(null);
    setFormName("");
    setFormDob("");
    setFormTob("");
    setFormPob("");
    setError(null);
    setActiveTab("charts");
  };

  if (!termsAccepted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#090514] to-[#1A0B2E] text-slate-100 flex flex-col justify-between font-sans select-none overflow-x-hidden antialiased relative">
        {/* Surreal background glowing auroras / nebula effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[#F59E0B]/8 blur-[120px] mix-blend-screen animate-pulse duration-[6000ms]" />
          <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[130px] mix-blend-screen animate-pulse duration-[4000ms]" />
          <div className="absolute top-[40%] left-[30%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-purple-500/5 blur-[150px] mix-blend-screen" />
        </div>

        {/* Background Rotating Mandalas */}
        <div className="fixed -bottom-40 -right-40 w-96 h-96 pointer-events-none opacity-20 z-0 animate-spin-slow">
          <svg className="w-full h-full text-[#d8a53d]/5" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="0.5">
            <circle cx="100" cy="100" r="90" strokeDasharray="2,2"/>
            <circle cx="100" cy="100" r="80" strokeWidth="0.75"/>
            <circle cx="100" cy="100" r="70" strokeDasharray="4,2"/>
            <circle cx="100" cy="100" r="50"/>
            <circle cx="100" cy="100" r="30"/>
            <circle cx="100" cy="100" r="10"/>
            <path d="M100 10 L100 190 M10 100 L190 100" strokeWidth="0.5" strokeDasharray="5,5"/>
            <path d="M36.36 36.36 L163.64 163.64 M36.36 163.64 L163.64 36.36" strokeWidth="0.5" strokeDasharray="5,5"/>
          </svg>
        </div>
        <div className="fixed -top-40 -left-40 w-96 h-96 pointer-events-none opacity-10 z-0 animate-spin-reverse">
          <svg className="w-full h-full text-[#d8a53d]/5" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="0.5">
            <circle cx="100" cy="100" r="90" strokeDasharray="2,2"/>
            <circle cx="100" cy="100" r="80" strokeWidth="0.75"/>
            <circle cx="100" cy="100" r="70" strokeDasharray="4,2"/>
            <circle cx="100" cy="100" r="50"/>
            <circle cx="100" cy="100" r="30"/>
            <circle cx="100" cy="100" r="10"/>
          </svg>
        </div>

        {/* Very light slowly rotating background Om that stays */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden select-none">
          <span className="text-[24rem] md:text-[36rem] lg:text-[45rem] font-traditional text-[#d8a53d]/[0.015] select-none animate-spin-slow">
            ॐ
          </span>
        </div>

        {/* Header inside Gate */}
        <header className="h-20 border-b border-[#d8a53d]/10 flex items-center justify-center px-6 bg-[#0a050f]/60 backdrop-blur-md shrink-0 z-10 relative">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#d8a53d] to-[#e08b2e] rounded-full flex items-center justify-center border border-[#d8a53d]/30 shadow-[0_0_15px_rgba(216,165,61,0.2)] shrink-0">
              <span className="text-base text-[#160f1f] font-bold font-traditional">ॐ</span>
            </div>
            <div className="text-left">
              <h1 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#d8a53d] font-display">
                Siddhanta Analytical Engine
              </h1>
              <p className="text-[9px] text-slate-400 font-mono tracking-wider">
                Vedic Horoscopic Systems &bull; v4.2.0 by PEPL
              </p>
            </div>
          </div>
        </header>

        {/* Main Onboarding Gate Box */}
        <div className="flex-grow flex items-center justify-center p-4 md:p-8 z-10 relative">
          <div className="max-w-xl w-full bg-white/[0.04] backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-8 md:p-10 shadow-[0_0_50px_rgba(245,158,11,0.12)] relative text-left">
            <div className="text-center mb-6">
              <span className="text-[#d8a53d]/90 font-semibold text-3xl block mb-2 font-traditional tracking-wide animate-pulse">ॐ</span>
              <h2 className="text-base font-medium text-[#d8a53d] tracking-[0.2em] uppercase font-display">
                Terms & Conditions Gate
              </h2>
              <p className="text-[9px] text-slate-400 font-mono tracking-widest uppercase mt-1">
                Pathania Enterprise Private Limited (PEPL)
              </p>
            </div>

            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 border-y border-[#d8a53d]/10 py-4 text-xs text-slate-300 font-serif leading-relaxed custom-scrollbar">
              <p className="font-sans text-[10px] text-slate-400 uppercase tracking-widest border-b border-[#d8a53d]/10 pb-2 mb-3">
                System Verification Protocol
              </p>
              <div>
                <strong className="text-[#d8a53d] font-sans text-[10px] uppercase tracking-wider block mb-1">1. Mathematical Ephemeris Framework</strong>
                <p className="text-slate-300 text-[11px] leading-relaxed">The planetary coordinates, dashas, and divisional charts (D1, D9, D10) calculated by this platform are based on classical Indian Jyotish mathematics. They are intended for educational and research purposes only.</p>
              </div>
              <div>
                <strong className="text-[#d8a53d] font-sans text-[10px] uppercase tracking-wider block mb-1">2. Complete Transient Data Policy</strong>
                <p className="text-slate-300 text-[11px] leading-relaxed">PEPL guarantees absolute transient processing. Your birth details (name, date, time, and location) are never stored, tracked, or sent to any central tracking repository. All computational operations reside within your browser session memory.</p>
              </div>
              <div>
                <strong className="text-[#d8a53d] font-sans text-[10px] uppercase tracking-wider block mb-1">3. Non-Remedial Academic Scope</strong>
                <p className="text-slate-300 text-[11px] leading-relaxed">This workspace adheres strictly to scholarly analysis. It excludes secondary remedial marketing (gemstones, expensive yagnas, paid ritual solutions). It provides mathematics and traditional planetary positions without commercial prescriptions.</p>
              </div>
              <div>
                <strong className="text-[#d8a53d] font-sans text-[10px] uppercase tracking-wider block mb-1">4. No Liability Disclaimer</strong>
                <p className="text-slate-300 text-[11px] leading-relaxed">Vedic astrological outputs are interpretive models. Under no circumstances shall PEPL or its creators be held liable for any personal or financial actions taken by users based on output cycles or synthesized guidance.</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-5">
              <div className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  id="agree-tc" 
                  checked={termsChecked}
                  onChange={(e) => setTermsChecked(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded-none border-[#d8a53d]/30 bg-[#160f1f] text-[#d8a53d] focus:ring-0 cursor-pointer accent-[#d8a53d]"
                />
                <label htmlFor="agree-tc" className="text-[11px] text-slate-300 leading-relaxed cursor-pointer select-none font-sans">
                  I accept the Terms, Conditions, and Privacy Policy of Pathania Enterprise Private Limited (PEPL).
                </label>
              </div>

              <button 
                disabled={!termsChecked}
                onClick={() => {
                  localStorage.setItem("pepl_siddhanta_terms_accepted", "true");
                  setTermsAccepted(true);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-[#d8a53d] to-[#e08b2e] disabled:opacity-30 disabled:pointer-events-none text-[#160f1f] text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer shadow-[0_4px_20px_rgba(216,165,61,0.15)] hover:shadow-[0_4px_25px_rgba(216,165,61,0.3)] active:scale-[0.99] rounded-xl"
              >
                Enter Engine
              </button>
            </div>
          </div>
        </div>

        {/* Footer inside Gate */}
        <footer className="h-14 border-t border-[#d8a53d]/10 bg-[#07030b] px-6 text-center shrink-0 z-10 relative flex items-center justify-center">
          <p className="text-[10px] text-slate-500 tracking-wider">
            &copy; 2026 Pathania Enterprise Private Limited. All Rights Reserved.
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090514] to-[#1A0B2E] text-slate-100 flex flex-col font-sans select-none overflow-x-hidden antialiased relative">
      
      {/* Surreal background glowing auroras / nebula effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[25%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#F59E0B]/10 blur-[130px] mix-blend-screen animate-pulse duration-[6000ms]" />
        <div className="absolute top-[45%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-purple-600/12 blur-[150px] mix-blend-screen animate-pulse duration-[8000ms]" />
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-[#F59E0B]/5 blur-[120px] mix-blend-screen" />
      </div>

      {/* Background Rotating Mandalas */}
      <div className="fixed -bottom-40 -right-40 w-96 h-96 pointer-events-none opacity-20 z-0 animate-spin-slow">
        <svg className="w-full h-full text-[#d8a53d]/10" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="0.5">
          <circle cx="100" cy="100" r="90" strokeDasharray="2,2"/>
          <circle cx="100" cy="100" r="80" strokeWidth="0.75"/>
          <circle cx="100" cy="100" r="70" strokeDasharray="4,2"/>
          <circle cx="100" cy="100" r="50"/>
          <circle cx="100" cy="100" r="30"/>
          <circle cx="100" cy="100" r="10"/>
          <path d="M100 10 L100 190 M10 100 L190 100" strokeWidth="0.5" strokeDasharray="5,5"/>
          <path d="M36.36 36.36 L163.64 163.64 M36.36 163.64 L163.64 36.36" strokeWidth="0.5" strokeDasharray="5,5"/>
          <path d="M100 10 C110 30 110 70 100 100 C90 70 90 30 100 10 Z" fill="currentColor" fillOpacity="0.02"/>
          <path d="M100 100 C110 130 110 170 100 190 C90 170 90 130 100 100 Z" fill="currentColor" fillOpacity="0.02"/>
          <path d="M10 100 C30 110 70 110 100 100 C70 90 30 90 10 100 Z" fill="currentColor" fillOpacity="0.02"/>
          <path d="M100 100 C130 110 170 110 190 100 C170 90 130 90 100 100 Z" fill="currentColor" fillOpacity="0.02"/>
          <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1,5"/>
        </svg>
      </div>
      <div className="fixed -top-40 -left-40 w-96 h-96 pointer-events-none opacity-10 z-0 animate-spin-reverse">
        <svg className="w-full h-full text-[#d8a53d]/10" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="0.5">
          <circle cx="100" cy="100" r="90" strokeDasharray="2,2"/>
          <circle cx="100" cy="100" r="80" strokeWidth="0.75"/>
          <circle cx="100" cy="100" r="70" strokeDasharray="4,2"/>
          <circle cx="100" cy="100" r="50"/>
          <circle cx="100" cy="100" r="30"/>
          <circle cx="100" cy="100" r="10"/>
          <path d="M100 10 L100 190 M10 100 L190 100" strokeWidth="0.5" strokeDasharray="5,5"/>
          <path d="M36.36 36.36 L163.64 163.64 M36.36 163.64 L163.64 36.36" strokeWidth="0.5" strokeDasharray="5,5"/>
          <path d="M100 10 C110 30 110 70 100 100 C90 70 90 30 100 10 Z" fill="currentColor" fillOpacity="0.02"/>
          <path d="M100 100 C110 130 110 170 100 190 C90 170 90 130 100 100 Z" fill="currentColor" fillOpacity="0.02"/>
          <path d="M10 100 C30 110 70 110 100 100 C70 90 30 90 10 100 Z" fill="currentColor" fillOpacity="0.02"/>
          <path d="M100 100 C130 110 170 110 190 100 C170 90 130 90 100 100 Z" fill="currentColor" fillOpacity="0.02"/>
          <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1,5"/>
        </svg>
      </div>

      {/* Top Header */}
      <header className="h-20 border-b border-[#d8a53d]/10 flex items-center justify-between px-6 lg:px-8 bg-[#0a050f]/60 backdrop-blur-md shrink-0 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#d8a53d] to-[#e08b2e] rounded-full flex items-center justify-center border border-[#d8a53d]/30 shadow-[0_0_15px_rgba(216,165,61,0.25)] shrink-0 animate-pulse">
            <span className="text-xl text-[#160f1f] font-bold font-traditional">ॐ</span>
          </div>
          <div>
            <h1 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#d8a53d] font-display">
              Siddhanta Analytical Engine
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider -mt-0.5">
              Parashari Lifetime Horoscope Guide &bull; v4.2.0
            </p>
          </div>
        </div>

        {kundliData ? (
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex gap-8 text-[10px] font-bold uppercase tracking-widest text-[#d8a53d]/80">
              <span>Ayanamsa: Lahiri</span>
              <span className="border-l border-[#d8a53d]/20 pl-4">Standard: BPHS Hybrid</span>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 border border-[#d8a53d]/30 bg-white/[0.02] hover:bg-[#d8a53d]/10 text-[#d8a53d] text-xs font-bold uppercase tracking-[0.15em] transition-all rounded-xl shadow-md cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Engine
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-[#d8a53d]/10 rounded-full text-[9px] font-sans font-medium uppercase tracking-[0.15em] text-[#d8a53d]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            No-Remedy Protocol Active
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 flex flex-col z-10 relative">
        {loading ? (
          /* High-Quality Astronomical Cast Loading screen */
          <div className="flex-1 flex flex-col items-center justify-center p-8 my-12 text-center select-none">
            <div className="relative w-28 h-28 mb-6">
              {/* Spinning star mandala rings */}
              <div className="absolute inset-0 rounded-full border border-dashed border-[#d8a53d]/40 animate-spin-slow" />
              <div className="absolute inset-3 rounded-full border border-double border-[#d8a53d]/30 animate-spin-reverse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl text-[#d8a53d] font-bold animate-pulse">ॐ</span>
              </div>
            </div>
            <h2 className="text-sm font-bold text-[#d8a53d] font-display tracking-widest uppercase mb-2">
              Aligning Planetary Orbits
            </h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed font-serif italic">
              "Srishti sthiti vinashanam karta khechara bhumaya..." <br />
              <span className="text-[11px] text-[#d8a53d]/80 font-sans font-medium not-italic block mt-2.5">
                Computing precise houses, sub-vargas, and Vimshottari cycles based strictly on Brihat Parashara Hora Shastra and Jaimini Sutras...
              </span>
            </p>
          </div>
        ) : !kundliData ? (
          /* Casting Input Portal */
          <div className="flex-1 flex flex-col items-center justify-center p-2 lg:p-6 relative overflow-hidden min-h-[600px] w-full">
            {/* Very light slowly rotating background Om that stays */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden select-none">
              <span className="text-[24rem] md:text-[36rem] lg:text-[45rem] font-traditional text-[#d8a53d]/[0.015] select-none animate-spin-slow">
                ॐ
              </span>
            </div>

            <div className="w-full max-w-md bg-white/[0.04] backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-8 md:p-10 shadow-[0_0_50px_rgba(245,158,11,0.12)] relative z-10">
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#d8a53d]/10 to-[#e08b2e]/20 rounded-full flex items-center justify-center mx-auto mb-5 border border-[#d8a53d]/30 shadow-[0_0_20px_rgba(216,165,61,0.3)] relative group animate-pulse">
                  <span className="text-2xl text-[#d8a53d] font-traditional select-none">ॐ</span>
                  {/* Soft pulsing external halo */}
                  <div className="absolute inset-0 rounded-full border border-[#d8a53d]/20 animate-ping opacity-40 pointer-events-none" />
                </div>
                <h2 className="text-xl font-medium bg-gradient-to-r from-amber-200 via-amber-400 to-[#e08b2e] bg-clip-text text-transparent tracking-widest uppercase font-display">
                  Cast Birth Horoscope
                </h2>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed font-sans max-w-xs mx-auto">
                  A proprietary precision Vedic framework by <span className="text-slate-300 font-medium">Pathania Enterprise Private Limited</span>. Computes D1, D9, and D10 charts.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 border border-[#a8452f]/30 bg-[#a8452f]/5 text-slate-300 text-xs rounded-2xl flex items-start gap-2">
                  <span className="font-bold font-mono text-[9px] bg-[#a8452f]/20 border border-[#a8452f]/30 text-[#c76b8f] px-1.5 py-0.5 rounded shrink-0">
                    ERR
                  </span>
                  <p className="leading-relaxed font-sans">{error}</p>
                </div>
              )}

              <form onSubmit={handleCastHoroscope} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-amber-300 uppercase tracking-[0.15em] font-sans">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-amber-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-white/[0.06] border border-white/15 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-zinc-400 transition-all duration-300 font-sans"
                    />
                  </div>
                </div>

                {/* Date and Time Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-amber-300 uppercase tracking-[0.15em] font-sans">
                      Birth Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Calendar className="w-4 h-4 text-amber-400" />
                      </div>
                      <input
                        type="date"
                        required
                        value={formDob}
                        onChange={(e) => setFormDob(e.target.value)}
                        className="w-full bg-white/[0.06] border border-white/15 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-zinc-400 transition-all duration-300 font-sans [color-scheme:dark]"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-amber-300 uppercase tracking-[0.15em] font-sans">
                      Birth Time
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Clock className="w-4 h-4 text-amber-400" />
                      </div>
                      <input
                        type="time"
                        required
                        value={formTob}
                        onChange={(e) => setFormTob(e.target.value)}
                        className="w-full bg-white/[0.06] border border-white/15 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-zinc-400 transition-all duration-300 font-sans [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>

                {/* Place and Timezone */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-amber-300 uppercase tracking-[0.15em] font-sans">
                    Place of Birth
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MapPin className="w-4 h-4 text-amber-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formPob}
                      onChange={(e) => setFormPob(e.target.value)}
                      placeholder="e.g. New Delhi, India"
                      className="w-full bg-white/[0.06] border border-white/15 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-zinc-400 transition-all duration-300 font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-amber-300 uppercase tracking-[0.15em] font-sans">
                    Timezone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Globe className="w-4 h-4 text-amber-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formTimezone}
                      onChange={(e) => setFormTimezone(e.target.value)}
                      placeholder="e.g. Asia/Kolkata"
                      className="w-full bg-white/[0.06] border border-white/15 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-zinc-400 transition-all duration-300 font-sans"
                    />
                  </div>
                </div>

                {/* Cast Button */}
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-[#d8a53d] to-[#e08b2e] hover:from-[#e08b2e] hover:to-[#d8a53d] text-[#160f1f] font-bold text-xs rounded-2xl transition-all duration-300 uppercase tracking-[0.2em] flex items-center justify-center gap-2 mt-6 shadow-[0_4px_25px_rgba(216,165,61,0.2)] hover:shadow-[0_4px_35px_rgba(216,165,61,0.4)] active:scale-[0.98] cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" /> Cast Kundli & Guide
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* CASTED PORTAL INSIDE DASHBOARD */
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Native Meta Header */}
            <div className="p-4 lg:p-5 bg-[#1a1224]/80 border border-[#d8a53d]/30 rounded-none flex flex-wrap items-center justify-between gap-4 shadow-[0_0_30px_rgba(216,165,61,0.06)] backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-none bg-[#241733] border border-[#d8a53d]/30 flex items-center justify-center text-[#d8a53d] shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-bold text-[#d8a53d] uppercase tracking-wide font-display">{kundliData.birthInfo.name}</h2>
                    <span className="text-[9px] font-mono font-bold text-[#d8a53d] bg-[#241733] border border-[#d8a53d]/30 px-1.5 py-0.5 rounded-none uppercase">
                      Lagna: {kundliData.lagna.sign}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-serif">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#d8a53d]" /> {kundliData.birthInfo.dob}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#d8a53d]" /> {kundliData.birthInfo.tob}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#d8a53d]" /> {kundliData.birthInfo.pob}</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-[10px] font-mono text-slate-300 border border-[#d8a53d]/20 bg-[#160f1f] px-2.5 py-1 rounded-none">
                  TZ: {kundliData.birthInfo.timezone || "Auto"}
                </span>
              </div>
            </div>

            {/* Dashboard Tabs Navigation */}
            <div className="flex border-b border-[#d8a53d]/20 gap-1 overflow-x-auto pb-px">
              <button
                onClick={() => setActiveTab("charts")}
                className={`py-2.5 px-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 shrink-0 flex items-center gap-2 ${
                  activeTab === "charts"
                    ? "border-[#d8a53d] text-[#d8a53d]"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Table className="w-4 h-4" />
                Kundli & Planets
              </button>
              <button
                onClick={() => setActiveTab("report")}
                className={`py-2.5 px-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 shrink-0 flex items-center gap-2 ${
                  activeTab === "report"
                    ? "border-[#d8a53d] text-[#d8a53d]"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Lifetime Guide Report
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`py-2.5 px-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 shrink-0 flex items-center gap-2 ${
                  activeTab === "chat"
                    ? "border-[#d8a53d] text-[#d8a53d]"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Consultation Chat
              </button>
              <button
                onClick={() => setActiveTab("math")}
                className={`py-2.5 px-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 shrink-0 flex items-center gap-2 ${
                  activeTab === "math"
                    ? "border-[#d8a53d] text-[#d8a53d]"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Vargas & Shadbala
              </button>
            </div>

            {/* Dashboard Content Container */}
            <div className="flex-1 select-text">
              {/* TAB 1: KUNDLI & PLANETS */}
              {activeTab === "charts" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Kundli SVG Section */}
                  <div className="lg:col-span-5 flex flex-col gap-4">
                    <div className="flex bg-[#241733] p-1 border border-[#d8a53d]/30 rounded-none">
                      <button
                        onClick={() => setActiveChartType("D1")}
                        className={`flex-1 py-1.5 text-center text-[10px] font-bold uppercase rounded-none tracking-widest transition-all ${
                          activeChartType === "D1"
                            ? "bg-[#d8a53d] text-[#160f1f] shadow-sm font-bold"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        D1 Lagna
                      </button>
                      <button
                        onClick={() => setActiveChartType("D9")}
                        className={`flex-1 py-1.5 text-center text-[10px] font-bold uppercase rounded-none tracking-widest transition-all ${
                          activeChartType === "D9"
                            ? "bg-[#d8a53d] text-[#160f1f] shadow-sm font-bold"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        D9 Navamsha
                      </button>
                      <button
                        onClick={() => setActiveChartType("D10")}
                        className={`flex-1 py-1.5 text-center text-[10px] font-bold uppercase rounded-none tracking-widest transition-all ${
                          activeChartType === "D10"
                            ? "bg-[#d8a53d] text-[#160f1f] shadow-sm font-bold"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        D10 Dashamsha
                      </button>
                    </div>

                    <KundliChart
                      chartData={kundliData.divisionalCharts[activeChartType]}
                      title={activeChartType}
                    />

                    {/* Vedic Yogas Mini Grid */}
                    <div className="bg-[#1a1224]/90 border border-[#d8a53d]/30 rounded-none p-5 shadow-xl">
                      <h3 className="text-xs font-bold text-[#d8a53d] uppercase tracking-widest mb-3 font-display">Major Active Yogas</h3>
                      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                        {kundliData.yogas.map((yoga, idx) => (
                          <div key={idx} className="p-2.5 rounded-none bg-[#160f1f] border border-[#d8a53d]/15 hover:border-[#d8a53d]/40 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-[#d8a53d] uppercase tracking-wide font-display">{yoga.name}</span>
                              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">{yoga.type}</span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-normal font-serif">{yoga.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Planet Tables Section */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="bg-[#1a1224]/90 border border-[#d8a53d]/30 rounded-none p-5 shadow-xl overflow-hidden">
                      <div className="flex items-center gap-2 mb-4">
                        <Table className="w-5 h-5 text-[#d8a53d]" />
                        <h2 className="text-xs font-bold text-[#d8a53d] uppercase tracking-widest font-display">Astronomical Planetary Placements</h2>
                      </div>

                      <div className="overflow-x-auto rounded-none border border-[#d8a53d]/20 bg-[#160f1f]">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-[#d8a53d]/20 bg-[#241733] text-slate-300 font-bold text-[10px] uppercase tracking-wider">
                              <th className="p-3">Graha (Planet)</th>
                              <th className="p-3">Longitude</th>
                              <th className="p-3">Rashi (Sign)</th>
                              <th className="p-3 text-center">Bhava (House)</th>
                              <th className="p-3">Nakshatra</th>
                              <th className="p-3">Dignity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Lagna / Ascendant first */}
                            <tr className="border-b border-[#d8a53d]/20 hover:bg-[#241733]/50 transition-colors font-bold text-slate-100">
                              <td className="p-3 flex items-center gap-1">Lagna (Ascendant)</td>
                              <td className="p-3 font-mono text-[#d8a53d]">{kundliData.lagna.degree.toFixed(2)}°</td>
                              <td className="p-3">{kundliData.lagna.sign}</td>
                              <td className="p-3 text-center font-mono">1</td>
                              <td className="p-3 font-mono text-[11px] text-slate-300">{kundliData.lagna.nakshatra} ({kundliData.lagna.nakshatraLord.substring(0,3)})</td>
                              <td className="p-3 text-slate-400">—</td>
                            </tr>
                            
                            {/* Core 9 planets */}
                            {(Object.entries(kundliData.planets) as [string, PlanetInfo][]).map(([name, info]) => (
                              <tr key={name} className="border-b border-[#d8a53d]/10 hover:bg-[#241733]/50 transition-colors text-slate-200">
                                <td className="p-3 flex flex-col">
                                  <span className="font-semibold text-slate-100">{name} {info.isRetrograde && <span className="text-[9px] text-[#c76b8f] font-mono italic font-bold ml-1">(R)</span>}</span>
                                  <span className="text-[10px] text-slate-400 font-mono italic">{planetSanskritNames[name] || ""}</span>
                                </td>
                                <td className="p-3 font-mono text-[#d8a53d]">{info.degree.toFixed(2)}°</td>
                                <td className="p-3 text-slate-200">{info.sign}</td>
                                <td className="p-3 text-center font-mono text-slate-200">{info.house}</td>
                                <td className="p-3 font-mono text-[11px] text-slate-300">
                                  {info.nakshatra} <span className="text-slate-400 text-[10px]">({info.nakshatraLord.substring(0,3)})</span>
                                </td>
                                <td className={`p-3 font-bold ${
                                  info.dignity === "Exalted" ? "text-emerald-400" :
                                  info.dignity === "Debilitated" ? "text-[#c76b8f]" :
                                  info.dignity === "Own House" ? "text-[#d8a53d]" : "text-slate-400 font-normal"
                                }`}>
                                  {info.dignity}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Dasha Timeline summary */}
                    <DashaTimeline dashas={kundliData.vimshottariDasha} />
                  </div>
                </div>
              )}

              {/* TAB 2: LIFETIME HOROSCOPE GUIDE */}
              {activeTab === "report" && (
                <ReportViewer kundliData={kundliData} />
              )}

              {/* TAB 3: CONSULTATION CHAT */}
              {activeTab === "chat" && (
                <ConsultationChat kundliData={kundliData} />
              )}

              {/* TAB 4: VARGAS & SHADBALA */}
              {activeTab === "math" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Shadbala chart */}
                  <ShadbalaChart shadbala={kundliData.shadbala} />
                  
                  {/* Ashtakavarga table */}
                  <AshtakavargaTable ashtakavarga={kundliData.ashtakavarga} />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer copyright */}
      <footer className="border-t border-[#d8a53d]/20 bg-[#100a16] px-6 py-6 text-center shrink-0 z-10 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[11px] text-slate-400 text-center md:text-left">
            <p className="font-semibold text-slate-300 flex items-center justify-center md:justify-start gap-1">
              Siddhanta Analytical Engine <span className="text-[9px] text-[#d8a53d]/70 font-mono">v4.2.0</span>
            </p>
            <p className="mt-0.5 text-[10px]">
              &copy; 2026 <span className="text-[#d8a53d] font-semibold">Pathania Enterprise Private Limited (PEPL)</span>. All Rights Reserved.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-slate-400">
            <span className="px-2 py-0.5 bg-[#160f1f] border border-[#d8a53d]/10 text-slate-300 font-mono text-[9px]">
              BPHS / Jaimini Hybrid
            </span>
            <span className="px-2 py-0.5 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 font-semibold font-sans uppercase text-[9px] tracking-wider">
              Non-Remedial Analysis Only
            </span>
          </div>

          <div className="flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-wider">
            <button 
              onClick={() => setShowPrivacy(true)}
              className="text-[#d8a53d] hover:text-[#e08b2e] hover:underline transition-all cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-slate-600">|</span>
            <button 
              onClick={() => setShowTerms(true)}
              className="text-[#d8a53d] hover:text-[#e08b2e] hover:underline transition-all cursor-pointer"
            >
              Terms & Conditions
            </button>
            <span className="text-slate-600">|</span>
            <button 
              onClick={() => setShowAbout(true)}
              className="text-[#d8a53d] hover:text-[#e08b2e] hover:underline transition-all cursor-pointer"
            >
              About PEPL
            </button>
          </div>
        </div>
      </footer>

      {/* PRIVACY POLICY MODAL */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1224] border-2 border-[#d8a53d]/40 max-w-lg w-full p-6 relative max-h-[85vh] overflow-y-auto shadow-2xl text-left">
            <button 
              onClick={() => setShowPrivacy(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-[#d8a53d] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#d8a53d]/20">
              <span className="text-[#d8a53d] font-bold text-lg">ॐ</span>
              <div>
                <h3 className="text-xs font-bold text-[#d8a53d] uppercase tracking-widest font-display">Privacy Policy</h3>
                <p className="text-[9px] text-slate-400 font-mono">PEPL Siddhanta Safeguards</p>
              </div>
            </div>
            <div className="space-y-4 text-xs text-slate-300 font-serif leading-relaxed">
              <p>
                <strong className="text-[#d8a53d] font-sans text-[10px] uppercase block mb-1">1. Transient Parameter Processing</strong>
                Pathania Enterprise Private Limited (PEPL) is committed to absolute data confidentiality. Any birth details (Name, Date of Birth, Time of Birth, and Place of Birth) entered into the Siddhanta Analytical Engine are processed transiently to construct planetary divisional charts and time cycles.
              </p>
              <p>
                <strong className="text-[#d8a53d] font-sans text-[10px] uppercase block mb-1">2. No Persistent Tracking</strong>
                We do not save, distribute, or store your specific birth coordinates or birth times in any central tracking database. All calculations are executed strictly inside your active browser session.
              </p>
              <p>
                <strong className="text-[#d8a53d] font-sans text-[10px] uppercase block mb-1">3. Consultation Logs</strong>
                The Vedic Consultation Chat utilizes secure API routes server-side to proxy requests to Google Gemini model services. These chat inputs are transiently processed to synthesize answers and are never retained for commercial profiling or external marketing.
              </p>
              <p>
                <strong className="text-[#d8a53d] font-sans text-[10px] uppercase block mb-1">4. No Ad Cookies</strong>
                This application does not deploy advertising trackers or external pixel trackers. Your path into classical self-understanding remains clean, private, and secure.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#d8a53d]/20 flex justify-end">
              <button 
                onClick={() => setShowPrivacy(false)}
                className="px-4 py-1.5 bg-[#d8a53d] hover:bg-[#e08b2e] text-[#160f1f] text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                Close Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TERMS & CONDITIONS MODAL */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1224] border-2 border-[#d8a53d]/40 max-w-lg w-full p-6 relative max-h-[85vh] overflow-y-auto shadow-2xl text-left">
            <button 
              onClick={() => setShowTerms(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-[#d8a53d] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#d8a53d]/20">
              <span className="text-[#d8a53d] font-bold text-lg">ॐ</span>
              <div>
                <h3 className="text-xs font-bold text-[#d8a53d] uppercase tracking-widest font-display">Terms & Conditions</h3>
                <p className="text-[9px] text-slate-400 font-mono">Astrological Interpretative Standards</p>
              </div>
            </div>
            <div className="space-y-4 text-xs text-slate-300 font-serif leading-relaxed">
              <p>
                <strong className="text-[#d8a53d] font-sans text-[10px] uppercase block mb-1">1. Interpretive Service Only</strong>
                The calculations, astronomical coordinates, Vimshottari timings, Ashtakavarga scores, and textual syntheses provided by the Siddhanta Analytical Engine are designed strictly as an interpretative guidance system based on traditional Indian scriptures (Brihat Parashara Hora Shastra, Jaimini Sutras).
              </p>
              <p>
                <strong className="text-[#d8a53d] font-sans text-[10px] uppercase block mb-1">2. Guidance Disclaimer</strong>
                Vedic astrological guidance is not a substitute for legal, financial, mental health, or medical advice. Pathania Enterprise Private Limited (PEPL) makes no guarantees regarding the real-world predictability or empirical applicability of the synthesized trends.
              </p>
              <p>
                <strong className="text-[#d8a53d] font-sans text-[10px] uppercase block mb-1">3. Strict Non-Remedial Standards</strong>
                In adherence to classical rigor, this engine deliberately excludes gemstones, rituals, commercial mantras, or secondary remedial prescriptions. You use this service with full knowledge that its scope is mathematical and interpretive analysis only.
              </p>
              <p>
                <strong className="text-[#d8a53d] font-sans text-[10px] uppercase block mb-1">4. Limitation of Liability</strong>
                Under no circumstances shall PEPL or its affiliates be held liable for any decisions made or actions taken by the user in connection with the output of this application.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#d8a53d]/20 flex justify-end">
              <button 
                onClick={() => setShowTerms(false)}
                className="px-4 py-1.5 bg-[#d8a53d] hover:bg-[#e08b2e] text-[#160f1f] text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                Accept Terms
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABOUT PEPL MODAL */}
      {showAbout && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1224] border-2 border-[#d8a53d]/40 max-w-lg w-full p-6 relative max-h-[85vh] overflow-y-auto shadow-2xl text-left">
            <button 
              onClick={() => setShowAbout(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-[#d8a53d] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#d8a53d]/20">
              <span className="text-[#d8a53d] font-bold text-lg">ॐ</span>
              <div>
                <h3 className="text-xs font-bold text-[#d8a53d] uppercase tracking-widest font-display">About PEPL</h3>
                <p className="text-[9px] text-slate-400 font-mono">Academic Vedic Synthesis</p>
              </div>
            </div>
            <div className="space-y-4 text-xs text-slate-300 font-serif leading-relaxed">
              <p>
                <span className="text-[#d8a53d] font-semibold">Pathania Enterprise Private Limited (PEPL)</span> is an avant-garde enterprise dedicated to the digital preservation, rigorous mathematical modeling, and computational translation of classical ancient texts.
              </p>
              <p>
                Through the <span className="text-slate-100 italic">Siddhanta Analytical Engine</span>, PEPL integrates pure Indian mathematical astronomy (Siddhanta) with state-of-the-art semantic text compilation. By strictly adhering to the classical manuscripts without diluting the methodology with commercial remedial structures, PEPL sets a gold standard for digital astrological inquiry.
              </p>
              <div className="p-3 bg-[#160f1f] border border-[#d8a53d]/25 text-[11px] font-sans text-slate-400 space-y-1">
                <p className="font-semibold text-slate-200">PEPL Astrology & Astronomy Division</p>
                <p>Director of Engineering & Systems: Rahul Pathania</p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#d8a53d]/20 flex justify-end">
              <button 
                onClick={() => setShowAbout(false)}
                className="px-4 py-1.5 bg-[#d8a53d] hover:bg-[#e08b2e] text-[#160f1f] text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                Close Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Suggestions and Excel Integration Widget */}
      <SuggestionsWidget />
    </div>
  );
}

