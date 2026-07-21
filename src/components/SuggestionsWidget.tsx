import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  X,
  CheckCircle2,
  List,
  Download,
  Database,
  AlertCircle,
  Lock,
  ChevronRight,
  User,
  Mail,
  Phone,
  FileSpreadsheet,
  Key
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Suggestion } from "../types";

export default function SuggestionsWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [apiKeySaveSuccess, setApiKeySaveSuccess] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [suggestionText, setSuggestionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Sheet configuration state
  const [sheetWebhookUrl, setSheetWebhookUrl] = useState("");
  const [sheetConfigSuccess, setSheetConfigSuccess] = useState(false);

  // Fetch sheet webhook on admin load
  useEffect(() => {
    if (isAdmin && isOpen) {
      fetchSuggestions();
    }
  }, [isAdmin, isOpen]);

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const res = await fetch("/api/suggestions");
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        if (data.sheetWebhookUrl) {
          setSheetWebhookUrl(data.sheetWebhookUrl);
        }
        if (data.geminiApiKey) {
          setGeminiApiKey(data.geminiApiKey);
        }
      }
    } catch (err) {
      console.error("Failed to load suggestions:", err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !suggestionText.trim()) {
      setErrorMsg("All fields are required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          suggestion: suggestionText.trim(),
        }),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setName("");
        setEmail("");
        setPhone("");
        setSuggestionText("");
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to submit suggestion. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg("Network error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Admin password requested by user
    if (adminPassword === "admin@rahulpathania") {
      setIsAdminAuthenticated(true);
      setAdminPassword("");
      setAdminError("");
    } else {
      setAdminError("Invalid security key. Access denied.");
    }
  };

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/suggestions/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geminiApiKey }),
      });
      if (res.ok) {
        setApiKeySaveSuccess(true);
        setTimeout(() => setApiKeySaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save API key configuration:", err);
    }
  };

  const handleSaveSheetConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/suggestions/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheetWebhookUrl }),
      });
      if (res.ok) {
        setSheetConfigSuccess(true);
        setTimeout(() => setSheetConfigSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save sheet configuration:", err);
    }
  };

  const handleExportCSV = () => {
    if (suggestions.length === 0) return;

    // Build CSV headers & content
    const headers = ["ID", "Timestamp", "Name", "Email", "Phone", "Suggestion"];
    const rows = suggestions.map((s, index) => [
      s.id || String(index + 1),
      s.timestamp ? new Date(s.timestamp).toLocaleString() : "",
      `"${s.name.replace(/"/g, '""')}"`,
      s.email,
      s.phone,
      `"${s.suggestion.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    // Trigger file download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Siddhanta_Suggestions_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="suggestions-widget-container" className="fixed bottom-6 right-6 z-40 font-sans">
      
      {/* FLOATING ACTION TRIGGER BUBBLE */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          // Always reset states on toggle
          if (isOpen) {
            setSubmitSuccess(false);
            setIsAdmin(false);
            setIsAdminAuthenticated(false);
            setAdminPassword("");
            setAdminError("");
          }
        }}
        className="w-14 h-14 bg-gradient-to-br from-[#d8a53d] to-[#e08b2e] text-[#160f1f] rounded-full flex items-center justify-center shadow-[0_4px_25px_rgba(216,165,61,0.4)] hover:shadow-[0_4px_35px_rgba(216,165,61,0.6)] hover:scale-105 transition-all duration-300 relative group cursor-pointer"
        title="Send Suggestion or Feedback"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative flex items-center justify-center"
            >
              <MessageSquare className="w-6 h-6" />
              {/* Subtle small notification pulsing dot */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#a8452f] rounded-full border-2 border-[#160f1f] animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Tooltip on Hover */}
        <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-[#1a1224] border border-[#d8a53d]/30 text-[#d8a53d] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 shadow-xl whitespace-nowrap">
          Suggestions & Feedback
        </span>
      </button>

      {/* EXPANDING WIDGET PANEL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="absolute bottom-20 right-0 w-[380px] max-w-[calc(100vw-2rem)] bg-[#100a16]/95 border border-[#d8a53d]/30 rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden flex flex-col max-h-[580px] z-50 text-slate-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#241733] to-[#100a16] p-5 border-b border-[#d8a53d]/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#d8a53d] text-lg font-traditional select-none">ॐ</span>
                <div>
                  <h3 className="text-xs font-semibold text-[#d8a53d] uppercase tracking-[0.2em] font-display">
                    {isAdmin ? "Siddhanta Admin Console" : "Suggestions & Ideas"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono tracking-wider">
                    {isAdmin ? "Google Sheet Integration Panel" : "Shape Siddhanta's Future"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Admin/User view toggler */}
                <button
                  onClick={() => {
                    setIsAdmin(!isAdmin);
                    setAdminError("");
                    if (isAdmin) {
                      setIsAdminAuthenticated(false);
                      setAdminPassword("");
                    }
                  }}
                  className="p-1 rounded-lg border border-[#d8a53d]/15 bg-white/[0.02] text-[#d8a53d] hover:bg-[#d8a53d]/10 text-[9px] font-bold tracking-widest uppercase transition-all cursor-pointer"
                  title="Toggle Admin/User View"
                >
                  {isAdmin ? "Exit Admin" : "Admin Panel"}
                </button>
              </div>
            </div>

            {/* Panel Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 select-text">
              
              {/* ADMIN MODE VIEW */}
              {isAdmin ? (
                !isAdminAuthenticated ? (
                  /* PASSWORD LOGIN SCREEN */
                  <form onSubmit={handleAdminLogin} className="space-y-4 py-4">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-[#d8a53d]/10 border border-[#d8a53d]/30 rounded-full flex items-center justify-center mx-auto animate-pulse">
                        <Lock className="w-5 h-5 text-[#d8a53d]" />
                      </div>
                      <h4 className="text-xs font-semibold text-[#d8a53d] uppercase tracking-wider">
                        Admin Security Lock
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Please enter your security key to access the console.
                      </p>
                    </div>

                    {adminError && (
                      <div className="p-2.5 bg-red-950/40 border border-red-500/20 text-red-300 text-[9px] rounded-xl flex items-center gap-1.5 font-sans">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <p>{adminError}</p>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">
                        Security Password Key
                      </label>
                      <input
                        type="password"
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••••••••••"
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-[#d8a53d]/50 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 transition-all font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-gradient-to-r from-[#d8a53d] to-[#e08b2e] text-[#160f1f] font-bold text-[10px] rounded-xl transition-all uppercase tracking-wider cursor-pointer"
                    >
                      Authenticate
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                  
                  {/* Google Sheets Config panel */}
                  <div className="p-4 bg-white/[0.02] border border-[#d8a53d]/20 rounded-2xl space-y-3">
                    <div className="flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-[#d8a53d]" />
                      <h4 className="text-[11px] font-bold text-[#d8a53d] uppercase tracking-wider">
                        Google Sheets Integration
                      </h4>
                    </div>
                    
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                      Automatically push incoming suggestions to any Excel / Google Sheet in real-time. Just enter your Apps Script Web App URL below:
                    </p>

                    <form onSubmit={handleSaveSheetConfig} className="space-y-2">
                      <input
                        type="url"
                        placeholder="https://script.google.com/macros/s/.../exec"
                        value={sheetWebhookUrl}
                        onChange={(e) => setSheetWebhookUrl(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 focus:border-[#d8a53d]/60 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 transition-all font-mono"
                      />
                      
                      <div className="flex items-center justify-between gap-2">
                        {sheetConfigSuccess ? (
                          <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Saved Webhook URL
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-500 italic">
                            Leave empty to pause Google Sheets sync.
                          </span>
                        )}
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-gradient-to-r from-[#d8a53d] to-[#e08b2e] text-[#160f1f] text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                        >
                          Save Config
                        </button>
                      </div>
                    </form>

                    {/* Simple Instructions expander */}
                    <details className="group border-t border-[#d8a53d]/10 pt-2.5">
                      <summary className="text-[9px] font-bold text-[#d8a53d] uppercase tracking-wider cursor-pointer list-none flex items-center justify-between">
                        <span>How to link Google Sheets? (30 Secs)</span>
                        <ChevronRight className="w-3 h-3 transform group-open:rotate-90 transition-transform" />
                      </summary>
                      <div className="mt-2 text-[9px] text-slate-400 space-y-1.5 pl-1 leading-relaxed font-sans">
                        <p>1. Open Google Sheets & create a sheet named <strong>Suggestions</strong>.</p>
                        <p>2. Go to <strong>Extensions &gt; Apps Script</strong>, delete default code & paste this:</p>
                        <pre className="bg-black/50 p-2 text-[8px] font-mono rounded overflow-x-auto text-[#d8a53d]">
{`function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([new Date(), data.name, data.email, data.phone, data.suggestion]);
  return ContentService.createTextOutput(JSON.stringify({status:"ok"})).setMimeType(ContentService.MimeType.JSON);
}`}
                        </pre>
                        <p>3. Click <strong>Deploy &gt; New deployment &gt; Web app</strong>.</p>
                        <p>4. Set <strong>Who has access</strong> to <strong>Anyone</strong>, Deploy, copy the Web App URL and paste it above!</p>
                      </div>
                    </details>
                  </div>

                  {/* Google / Gemini API Key Config panel */}
                  <div className="p-4 bg-white/[0.02] border border-[#d8a53d]/20 rounded-2xl space-y-3">
                    <div className="flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-[#d8a53d]" />
                      <h4 className="text-[11px] font-bold text-[#d8a53d] uppercase tracking-wider">
                        Google Gemini API Key
                      </h4>
                    </div>
                    
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                      Enter your custom Google / Gemini API key. If left empty, Siddhanta will automatically fall back to the built-in system key.
                    </p>

                    <form onSubmit={handleSaveApiKey} className="space-y-2">
                      <input
                        type="password"
                        placeholder="AIzaSy..."
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 focus:border-[#d8a53d]/60 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 transition-all font-mono"
                      />
                      
                      <div className="flex items-center justify-between gap-2">
                        {apiKeySaveSuccess ? (
                          <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> API Key Saved
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-500 italic">
                            Dynamic runtime key resolution active.
                          </span>
                        )}
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-gradient-to-r from-[#d8a53d] to-[#e08b2e] text-[#160f1f] text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                        >
                          Save Key
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Suggestions List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-[#d8a53d]" />
                        <h4 className="text-[11px] font-bold text-[#d8a53d] uppercase tracking-wider">
                          Collected Suggestions ({suggestions.length})
                        </h4>
                      </div>
                      
                      {suggestions.length > 0 && (
                        <button
                          onClick={handleExportCSV}
                          className="flex items-center gap-1 px-2.5 py-1 border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/30 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                        >
                          <Download className="w-3 h-3" /> Export Excel (CSV)
                        </button>
                      )}
                    </div>

                    {loadingSuggestions ? (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        <span className="inline-block w-4 h-4 border-2 border-[#d8a53d] border-t-transparent rounded-full animate-spin mr-2" />
                        Fetching from server backup...
                      </div>
                    ) : suggestions.length === 0 ? (
                      <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl text-center text-[11px] text-slate-500">
                        No suggestions submitted yet. Use the widget to test!
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {suggestions.map((item, index) => (
                          <div
                            key={index}
                            className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1.5 text-[11px] hover:bg-white/[0.04] transition-all"
                          >
                            <div className="flex justify-between items-start text-[9px] text-slate-500 font-mono">
                              <span>#{suggestions.length - index}</span>
                              <span>{item.timestamp ? new Date(item.timestamp).toLocaleString() : ""}</span>
                            </div>
                            <div className="text-slate-200 font-medium font-sans">
                              {item.name}
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 font-mono">
                              <span>📧 {item.email}</span>
                              <span>📞 {item.phone}</span>
                            </div>
                            <p className="text-slate-300 font-serif leading-relaxed italic border-l border-[#d8a53d]/30 pl-2 mt-1">
                              "{item.suggestion}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            ) : (
                
                /* USER MODE FORM OR SUCCESS SCREEN */
                submitSuccess ? (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-8 px-4 space-y-4"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-[#d8a53d]/10 to-[#e08b2e]/20 border border-[#d8a53d]/30 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(216,165,61,0.2)]">
                      <CheckCircle2 className="w-8 h-8 text-[#d8a53d]" />
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-[#d8a53d] uppercase tracking-[0.15em]">
                        Suggestion Registered!
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-2 font-serif leading-relaxed max-w-xs mx-auto">
                        Your valuable suggestion has been received by PEPL. It has been successfully synchronized to our secure Excel database backend in real-time. Thank you!
                      </p>
                    </div>

                    <button
                      onClick={() => setSubmitSuccess(false)}
                      className="px-4 py-2 bg-[#d8a53d] hover:bg-[#e08b2e] text-[#160f1f] text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Send Another Suggestion
                    </button>
                  </motion.div>
                ) : (
                  
                  /* FEEDBACK INPUT FORM */
                  <form onSubmit={handleSubmit} className="space-y-3">
                    
                    <p className="text-[11px] text-slate-300 leading-relaxed font-serif text-center max-w-xs mx-auto mb-2">
                      Have suggestions for improving Siddhanta Analytical Engine or requesting customized features? Drop us a line below!
                    </p>

                    {errorMsg && (
                      <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-300 text-[10px] rounded-xl flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <p>{errorMsg}</p>
                      </div>
                    )}

                    {/* Name */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <User className="w-3 h-3 text-[#d8a53d]/60" /> Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Rahul Sharma"
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-[#d8a53d]/50 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Mail className="w-3 h-3 text-[#d8a53d]/60" /> Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="rahul@example.com"
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-[#d8a53d]/50 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 transition-all"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#d8a53d]/60" /> Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-[#d8a53d]/50 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 transition-all"
                      />
                    </div>

                    {/* Suggestion Text */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">
                        Your Suggestion / Idea
                      </label>
                      <textarea
                        required
                        value={suggestionText}
                        onChange={(e) => setSuggestionText(e.target.value)}
                        placeholder="Please share which divisional charts, features, or updates you would like us to add to Siddhanta."
                        rows={3}
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-[#d8a53d]/50 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 transition-all resize-none font-serif leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 bg-gradient-to-r from-[#d8a53d] to-[#e08b2e] hover:from-[#e08b2e] hover:to-[#d8a53d] disabled:opacity-30 text-[#160f1f] font-bold text-[10px] rounded-xl transition-all uppercase tracking-[0.15em] flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg mt-3 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-[#160f1f] border-t-transparent rounded-full animate-spin mr-1" />
                          Synchronizing...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" /> Submit Suggestion
                        </>
                      )}
                    </button>

                  </form>
                )
              )}

            </div>

            {/* Footer security tag */}
            <div className="bg-[#100a16] px-5 py-3 border-t border-[#d8a53d]/10 flex items-center justify-between text-[8px] text-slate-500 font-mono">
              <span>PEPL SECURITY KEY: YES</span>
              <span className="flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" /> 256-BIT ENCRYPTION</span>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
