import React, { useState, useEffect } from "react";
import { KundliData } from "../types";
import { BookOpen, Sparkles, Loader2, Printer, CheckCircle, ChevronRight, AlertCircle } from "lucide-react";

interface ReportViewerProps {
  kundliData: KundliData;
}

interface Chapter {
  id: number;
  title: string;
  status: "locked" | "loading" | "ready" | "failed";
  content: string;
  wordCount: number;
  errorMessage?: string;
}

const initialChapters: Omit<Chapter, "status" | "content" | "wordCount">[] = [
  { id: 1, title: "Vedic Identity, Temperament, and Mind Structure" },
  { id: 2, title: "Wealth, Property, Investments, and Debt" },
  { id: 3, title: "Career, Leadership, and Professional Path" },
  { id: 4, title: "Marriage, Relationships, and Spouse Profile" },
  { id: 5, title: "Family, Children, Siblings, and Social Sphere" },
  { id: 6, title: "Health, Longevity, Stress, and Obstacles" },
  { id: 7, title: "Travel, Foreign Settlement, and Spiritual Journey" },
  { id: 8, title: "Vimshottari Dasha & Transit Timing Deep Dive" },
  { id: 9, title: "Divisional Charts & Astrological Synthesis" },
];

export default function ReportViewer({ kundliData }: ReportViewerProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<number>(1);
  const [isCompilingAll, setIsCompilingAll] = useState(false);
  const [currentCompilingIndex, setCurrentCompilingIndex] = useState<number | null>(null);
  const [compilationProgress, setCompilationProgress] = useState(0);

  useEffect(() => {
    // Load cached chapters or initialize
    const cacheKey = `astrology_report_${kundliData.birthInfo.dob}_${kundliData.birthInfo.tob}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setChapters(JSON.parse(cached));
      } catch {
        initializeChapters();
      }
    } else {
      initializeChapters();
    }
  }, [kundliData]);

  const initializeChapters = () => {
    const list: Chapter[] = initialChapters.map((ch) => ({
      ...ch,
      status: "locked",
      content: "",
      wordCount: 0,
    }));
    // Unlock first chapter to let them trigger on-demand
    list[0].status = "locked"; // initially locked, ready to generate
    setChapters(list);
  };

  const saveToCache = (updatedChapters: Chapter[]) => {
    const cacheKey = `astrology_report_${kundliData.birthInfo.dob}_${kundliData.birthInfo.tob}`;
    localStorage.setItem(cacheKey, JSON.stringify(updatedChapters));
  };

  const generateChapter = async (id: number): Promise<string> => {
    // Update state to loading
    setChapters((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, status: "loading" } : ch))
    );

    try {
      const response = await fetch("/api/astrology/generate-chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterNumber: id,
          kundliData,
        }),
      });

      if (!response.ok) {
        let errMsg = "Server error generating chapter";
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (e) {}
        throw new Error(errMsg);
      }

      const resData = await response.json();
      const content = resData.content;
      const wordCount = content.split(/\s+/).filter(Boolean).length;

      let finalChapters: Chapter[] = [];
      setChapters((prev) => {
        finalChapters = prev.map((ch) =>
          ch.id === id
            ? { ...ch, status: "ready", content, wordCount, errorMessage: undefined }
            : ch
        );
        saveToCache(finalChapters);
        return finalChapters;
      });

      return content;
    } catch (error: any) {
      console.error(`Error generating chapter ${id}:`, error);
      setChapters((prev) =>
        prev.map((ch) => (ch.id === id ? { ...ch, status: "failed", errorMessage: error.message || String(error) } : ch))
      );
      throw error;
    }
  };

  const compileAllChapters = async () => {
    setIsCompilingAll(true);
    setCompilationProgress(0);

    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      if (chapter.status === "ready") {
        setCompilationProgress(((i + 1) / chapters.length) * 100);
        continue;
      }

      setCurrentCompilingIndex(i);
      setCompilationProgress((i / chapters.length) * 100);

      try {
        await generateChapter(chapter.id);
      } catch (error) {
        console.error("Compilation halted due to error on chapter", chapter.id);
        break; // Stop compiling further if one fails
      }
    }

    setIsCompilingAll(false);
    setCurrentCompilingIndex(null);
    setCompilationProgress(100);
  };

  const handlePrint = () => {
    const readyChapters = chapters.filter((c) => c.status === "ready");
    if (readyChapters.length === 0) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const contentHtml = readyChapters
      .map(
        (c) => `
        <div style="page-break-after: always; max-width: 800px; margin: 40px auto; font-family: 'Georgia', serif; line-height: 1.6; color: #111111;">
          <h1 style="border-bottom: 2px solid #1a1a1a; padding-bottom: 10px; color: #1a1a1a; font-family: 'Helvetica', sans-serif; text-transform: uppercase; font-size: 20px; letter-spacing: 0.1em; font-weight: bold;">
            Chapter ${c.id}: ${c.title}
          </h1>
          <div style="font-size: 15px; text-align: justify; white-space: pre-wrap;">${c.content}</div>
        </div>
      `
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Vedic Astrology Lifetime Consultation Report - ${kundliData.birthInfo.name}</title>
        </head>
        <body style="padding: 20px; font-family: serif; background: #fff;">
          <div style="text-align: center; margin-bottom: 100px; padding-top: 100px; border-bottom: 3px double #1a1a1a; padding-bottom: 50px;">
            <h1 style="font-size: 28px; color: #1a1a1a; text-transform: uppercase; font-family: 'Helvetica', sans-serif; letter-spacing: 0.1em; font-weight: bold;">Vedic Astrology Lifetime Guide</h1>
            <p style="font-size: 14px; font-style: italic; color: #707065;">Calculated According to Classical Sage Parashara's BPHS & Phaladeepika</p>
            <div style="margin: 40px 0; border: 1px solid #E5E5E0; display: inline-block; padding: 20px; text-align: left;">
              <p><strong>Native Name:</strong> ${kundliData.birthInfo.name}</p>
              <p><strong>Date of Birth:</strong> ${kundliData.birthInfo.dob}</p>
              <p><strong>Time of Birth:</strong> ${kundliData.birthInfo.tob}</p>
              <p><strong>Place of Birth:</strong> ${kundliData.birthInfo.pob}</p>
              <p><strong>Ascendant (Lagna):</strong> ${kundliData.lagna.sign} (${kundliData.lagna.degree.toFixed(2)}°)</p>
            </div>
            <p style="color: #A0A090; font-size: 11px; margin-top: 50px; text-transform: uppercase; letter-spacing: 0.05em;">This report is strictly an objective classical interpretation. It contains no spiritual prescriptions, remedies, or mantras.</p>
          </div>
          ${contentHtml}
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const totalWordCount = chapters.reduce((acc, c) => acc + c.wordCount, 0);
  const activeChapter = chapters.find((c) => c.id === activeChapterId);

  return (
    <div id="lifetime-report" className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
      {/* Sidebar: Navigation and Compilation Control */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-[#1a1224]/80 border border-[#d8a53d]/30 rounded-none p-5 shadow-[0_0_30px_rgba(216,165,61,0.06)] backdrop-blur-md">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-[#d8a53d]" />
            <h2 className="text-xs font-bold text-[#d8a53d] uppercase tracking-widest font-display">Horoscope Guide Chapters</h2>
          </div>
          <p className="text-[11px] text-slate-300 mb-4 leading-relaxed font-serif">
            Due to the extreme depth of analysis required (each chapter is written with classical rigor from classical texts), we generate these sections modularly. Compile the full report sequentially for a total of <strong className="text-[#d8a53d] font-bold">12,000+ words</strong>.
          </p>

          {/* Compile Progress / Button */}
          <div className="mb-6 p-4 bg-[#160f1f] border border-[#d8a53d]/20 rounded-none">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider text-[10px] font-display">Overall Guide Compile</span>
              <span className="text-xs font-mono text-[#d8a53d] font-bold">{totalWordCount} / 12,000+ words</span>
            </div>

            {isCompilingAll ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-200 font-medium font-serif">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d8a53d]" />
                  <span>Synthesizing Chapter {currentCompilingIndex !== null ? currentCompilingIndex + 1 : ""}...</span>
                </div>
                <div className="w-full h-1.5 bg-[#241733] rounded-none overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#d8a53d] to-[#e08b2e] transition-all duration-300"
                    style={{ width: `${compilationProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={compileAllChapters}
                className="w-full py-2 bg-gradient-to-r from-[#d8a53d] to-[#e08b2e] hover:from-[#e08b2e] hover:to-[#d8a53d] text-[#160f1f] text-xs font-bold rounded-none shadow-md transition-all flex items-center justify-center gap-1.5 uppercase tracking-widest"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {totalWordCount > 0 ? "Compile Remaining" : "Compile Full Guide"}
              </button>
            )}
          </div>

          {/* Chapters Navigation */}
          <div className="space-y-1.5">
            {chapters.map((ch) => {
              const isActive = ch.id === activeChapterId;
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChapterId(ch.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-none text-left transition-all ${
                    isActive
                      ? "bg-[#241733] text-[#d8a53d] border border-[#d8a53d]/30 shadow-sm"
                      : "text-slate-300 hover:text-slate-100 hover:bg-[#241733]/50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[9px] font-mono bg-[#160f1f] border border-[#d8a53d]/20 text-[#d8a53d] px-1.5 py-0.5 rounded-none">
                      Ch {ch.id}
                    </span>
                    <span className="text-xs font-medium truncate font-serif">{ch.title}</span>
                  </div>
                  <div className="shrink-0 ml-2">
                    {ch.status === "ready" && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 fill-[#160f1f]" />
                    )}
                    {ch.status === "loading" && (
                      <Loader2 className="w-3.5 h-3.5 text-[#d8a53d] animate-spin" />
                    )}
                    {ch.status === "failed" && (
                      <AlertCircle className="w-3.5 h-3.5 text-[#c76b8f]" />
                    )}
                    {ch.status === "locked" && (
                      <ChevronRight className="w-3.5 h-3.5 text-[#d8a53d]/60" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Controls */}
        <div className="bg-[#1a1224]/80 border border-[#d8a53d]/30 rounded-none p-4 shadow-[0_0_30px_rgba(216,165,61,0.06)] backdrop-blur-md flex gap-2">
          <button
            onClick={handlePrint}
            disabled={!chapters.some((c) => c.status === "ready")}
            className="flex-1 py-2 border border-[#d8a53d]/30 bg-[#241733] hover:bg-[#160f1f] disabled:opacity-40 disabled:cursor-not-allowed text-[#d8a53d] text-xs font-bold uppercase tracking-widest rounded-none transition-all flex items-center justify-center gap-1.5 shadow"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
        </div>
      </div>

      {/* Main Panel: Document Reader */}
      <div className="lg:col-span-8">
        <div className="bg-[#1a1224]/80 border border-[#d8a53d]/30 rounded-none p-6 lg:p-8 shadow-[0_0_30px_rgba(216,165,61,0.06)] backdrop-blur-md h-full flex flex-col min-h-[500px]">
          {activeChapter ? (
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="border-b border-[#d8a53d]/20 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-[#d8a53d]/80 uppercase font-mono">
                    Chapter {activeChapter.id} of 9
                  </span>
                  <h1 className="text-sm font-bold text-[#d8a53d] tracking-wider font-display uppercase">
                    {activeChapter.title}
                  </h1>
                </div>
                {activeChapter.status === "ready" && (
                  <span className="text-[10px] font-mono text-slate-200 bg-[#241733] px-2 py-1 rounded-none border border-[#d8a53d]/20 self-start sm:self-center font-bold">
                    {activeChapter.wordCount} words
                  </span>
                )}
              </div>

              {/* Content Body */}
              <div className="flex-1">
                {activeChapter.status === "ready" && (
                  <div className="prose max-w-none text-slate-200 font-serif leading-relaxed text-sm lg:text-[15px] space-y-6 text-justify whitespace-pre-wrap select-text">
                    {activeChapter.content}
                  </div>
                )}

                {activeChapter.status === "locked" && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 my-12">
                    <div className="w-12 h-12 rounded-none bg-[#160f1f] border border-[#d8a53d]/20 flex items-center justify-center mb-4">
                      <Sparkles className="w-6 h-6 text-[#d8a53d]" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200 mb-1 font-display">Chapter Ready for Synthesis</h3>
                    <p className="text-xs text-slate-300 max-w-md mb-5 leading-relaxed font-serif">
                      This chapter has not been generated yet. Trigger classical calculation using Sage Parashara's principles for this particular life dimension.
                    </p>
                    <button
                      onClick={() => generateChapter(activeChapter.id)}
                      className="px-5 py-2 bg-gradient-to-r from-[#d8a53d] to-[#e08b2e] hover:from-[#e08b2e] hover:to-[#d8a53d] text-[#160f1f] text-xs font-bold uppercase tracking-widest rounded-none shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Loader2 className="w-3.5 h-3.5 animate-pulse text-[#160f1f]" />
                      Synthesize Chapter {activeChapter.id}
                    </button>
                  </div>
                )}

                {activeChapter.status === "loading" && (
                  <div className="h-full flex flex-col items-center justify-center p-8 my-12">
                    <Loader2 className="w-8 h-8 text-[#d8a53d] animate-spin mb-4" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#d8a53d] mb-1 font-display">Reading Astral Grids...</h3>
                    <p className="text-xs text-slate-300 max-w-md text-center leading-relaxed font-serif animate-pulse">
                      Sage Parashara's formulas are being calculated... Interpreting planetary houses, signs, strengths, and sub-varga placements. This may take up to 20 seconds.
                    </p>
                  </div>
                )}
                 {activeChapter.status === "failed" && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 my-12">
                    <div className="w-12 h-12 rounded-none bg-[#a8452f]/10 border border-[#a8452f] flex items-center justify-center mb-4">
                      <AlertCircle className="w-6 h-6 text-[#c76b8f]" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#d8a53d] mb-1 font-display">Synthesis Failed</h3>
                    <p className="text-xs text-slate-300 max-w-md mb-2 font-serif">
                      Failed to compute planetary vectors for this chapter.
                    </p>
                    {activeChapter.errorMessage && (
                      <p className="text-[11px] text-[#c76b8f] bg-[#a8452f]/5 border border-[#a8452f]/20 px-3 py-1.5 max-w-md mb-5 font-mono rounded-none">
                        {activeChapter.errorMessage}
                      </p>
                    )}
                    <button
                      onClick={() => generateChapter(activeChapter.id)}
                      className="px-4 py-2 bg-[#a8452f]/10 border border-[#a8452f] text-[#c76b8f] text-xs font-bold uppercase tracking-widest rounded-none hover:bg-[#a8452f]/30 transition-all"
                    >
                      Retry Synthesis
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#d8a53d] font-mono text-xs uppercase tracking-wider">
              Select a chapter from the list to begin reading.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
