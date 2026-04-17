import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiGrid,
  FiMoreHorizontal,
  FiMoon,
  FiPlus,
  FiSearch,
  FiSun,
  FiX,
} from "react-icons/fi";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import MonthlyRevenueExpensesChart from "../components/dashboard/MonthlyRevenueExpensesChart";
import RevenueChart from "../components/charts/RevenueChart";
import TopProductsChart from "../components/charts/TopProductsChart";
import { clearAuth, getAuthToken, getCurrentUser } from "../lib/auth";

const PROFILE_KEY = "shopeers_user_profile";
const SETTINGS_KEY = "shopeers_settings";
const THEME_KEY = "shopeers_theme";

function loadProfile() {
  const current = getCurrentUser();
  if (current?.email) return current;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { name: "Janson Vaccaro", email: "janson@shopeers.io" };
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { compactCharts: false, emailDigest: true, weeklyReport: true };
}

const DEFAULT_KPIS = [
  { label: "Total Revenue",      value: "$127,928", delta: "+2.8%", up: true,  sub: "Than last week" },
  { label: "Total Product Sold", value: "3,722",    delta: "+2.4%", up: true,  sub: "Than last week" },
  { label: "Total Sales",        value: "$217,027", delta: "-2.9%", up: false, sub: "Than last week" },
  { label: "Total Customers",    value: "7,273",    delta: "+2.1%", up: true,  sub: "Than last week" },
];

const PERFORMANCE = [
  { id: "ps", label: "Product Sales",        target: "$367K", pct: 78, color: "bg-emerald-500" },
  { id: "tk", label: "Team KPI",             target: "64%",   pct: 64, color: "bg-pink-400"   },
  { id: "cs", label: "Customer Satisfaction",target: "89%",   pct: 89, color: "bg-blue-500"   },
];

// ─── Month/Year filter helpers ───────────────────────────────────────────────
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div
        className="relative z-10 w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="modal-title" className="text-lg font-bold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <div className="text-sm text-slate-600">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

// ─── Placeholder page for secondary nav ──────────────────────────────────────
function PlaceholderPage({ title, description, onBack }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-2xl text-slate-400">◇</div>
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mt-2 max-w-md text-slate-500">{description}</p>
      <button
        type="button"
        onClick={onBack}
        className="mt-8 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
      >
        Back to dashboard
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate    = useNavigate();
  const token       = getAuthToken();
  const fileInputRef  = useRef(null);
  const mainScrollRef = useRef(null);

  // ── Data state ──────────────────────────────────────────────────────────────
  const [stats,    setStats]    = useState(null);
  const [charts,   setCharts]   = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [file,     setFile]     = useState(null);
  const [uploading,setUploading]= useState(false);
  const [uploadMsg,setUploadMsg]= useState("");
  const [kpis,     setKpis]     = useState([]);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav,        setActiveNav]        = useState("dashboard");
  const [user,             setUser]             = useState(loadProfile);
  const [settings,         setSettings]         = useState(loadSettings);
  const [lastUpdated,      setLastUpdated]       = useState(() => new Date());

  // ── Dark mode ───────────────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem(THEME_KEY) === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem(THEME_KEY, "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem(THEME_KEY, "light");
    }
  }, [darkMode]);

  // ── Search (filters insights + KPI cards) ──────────────────────────────────
  const [headerSearch, setHeaderSearch] = useState("");

  // ── Date filter ─────────────────────────────────────────────────────────────
  const [filterMonth, setFilterMonth] = useState("All");
  const [filterYear,  setFilterYear]  = useState(String(currentYear));

  // ── Chart period (existing) ─────────────────────────────────────────────────
  const [chartPeriod, setChartPeriod] = useState("This Month");

  // ── Customize widget visibility ─────────────────────────────────────────────
  const [customizeOpen,  setCustomizeOpen]  = useState(false);
  const [showKpis,       setShowKpis]       = useState(true);
  const [showCharts,     setShowCharts]     = useState(true);
  const [showInsights,   setShowInsights]   = useState(true);
  const [showPerformance,setShowPerformance]= useState(true);

  // ── Dropdowns / menus ────────────────────────────────────────────────────────
  const [exportsOpen, setExportsOpen] = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [kpiMenu,     setKpiMenu]     = useState(null);
  const [perfHover,   setPerfHover]   = useState(null);

  // ── Modals ───────────────────────────────────────────────────────────────────
  const [modalSettings, setModalSettings] = useState(false);
  const [modalFeedback, setModalFeedback] = useState(false);
  const [modalProfile,  setModalProfile]  = useState(false);
  const [modalEmail,    setModalEmail]    = useState(false);
  const [modalHelp,     setModalHelp]     = useState(false);
  const [feedbackText,  setFeedbackText]  = useState("");
  const [profileDraft,  setProfileDraft]  = useState(user);

  // ── Initial fetch ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    // ✅ FIXED: was /api/dashboard/dashboard (double path bug), now /api/dashboard
    fetch("/api/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [navigate, token]);

  // ── Scroll on nav change ──────────────────────────────────────────────────────
  useEffect(() => {
    if (activeNav === "analytics") {
      requestAnimationFrame(() =>
        document.getElementById("analytics-section")?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    }
    if (activeNav === "dashboard") {
      requestAnimationFrame(() =>
        mainScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
      );
    }
  }, [activeNav]);

  // ── Upload ────────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) { setUploadMsg("Please choose a file first."); return; }
    setUploading(true);
    setUploadMsg("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res  = await fetch("/api/upload", {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
        body:    formData,
      });
      const data = await res.json();
      if (res.ok) {
        setUploadMsg("✓ Upload successful.");
        setCharts(data.charts   || []);
        setInsights(data.insights || []);
        setKpis(data.kpis       || []);
        setLastUpdated(new Date());
      } else {
        setUploadMsg(`Error: ${data.error || "Upload failed"}`);
      }
    } catch {
      setUploadMsg("Could not reach the server. Make sure Flask is running.");
    } finally {
      setUploading(false);
    }
  };

  // ── Auth / profile ────────────────────────────────────────────────────────────
  const handleLogout = () => { clearAuth(); navigate("/login"); };

  const saveSettings = (next) => {
    const merged = { ...settings, ...next };
    setSettings(merged);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
  };

  const openProfileEdit = () => { setProfileDraft(user); setModalProfile(true); };

  const saveProfile = () => {
    const next = {
      name:  profileDraft.name?.trim()  || "User",
      email: profileDraft.email?.trim() || "user@shopeers.io",
    };
    setUser(next);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    setModalProfile(false);
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  const minutesAgo = Math.max(1, Math.round((Date.now() - lastUpdated.getTime()) / 60000));

  // KPIs from upload or defaults — filtered by search
  const allKpis = kpis.length > 0
    ? kpis.map((k) => ({
        label: k.label,
        value: k.value,
        delta: k.delta || "0%",
        up:    k.delta ? !k.delta.startsWith("-") : true,
        sub:   "From your dataset",
      }))
    : DEFAULT_KPIS;

  const displayKpis = headerSearch.trim()
    ? allKpis.filter((k) =>
        k.label.toLowerCase().includes(headerSearch.toLowerCase()) ||
        k.value.toLowerCase().includes(headerSearch.toLowerCase())
      )
    : allKpis;

  // Insights filtered by search
  const displayInsights = headerSearch.trim()
    ? insights.filter((i) => i.toLowerCase().includes(headerSearch.toLowerCase()))
    : insights;

  const navigateTo = (id) => setActiveNav(id);

  // ── Export PDF ────────────────────────────────────────────────────────────────
  const handleExportPDF = useCallback(() => {
    setExportsOpen(false);
    const printContent = `
      <html>
        <head>
          <title>Shopeers Dashboard Export</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1e293b; }
            h1   { font-size: 24px; font-weight: bold; margin-bottom: 4px; }
            h2   { font-size: 16px; font-weight: 600; margin: 24px 0 8px; color: #475569; }
            .subtitle { color: #64748b; font-size: 13px; margin-bottom: 32px; }
            .filter   { color: #64748b; font-size: 12px; margin-bottom: 16px; }
            .kpi-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; margin-bottom: 24px; }
            .kpi-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
            .kpi-label{ font-size: 12px; color: #64748b; margin-bottom: 4px; }
            .kpi-value{ font-size: 22px; font-weight: bold; }
            .kpi-delta{ font-size: 12px; margin-top: 6px; color: #10b981; }
            .insight  { padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
            .footer   { margin-top: 40px; font-size: 11px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <h1>Shopeers Dashboard</h1>
          <p class="subtitle">Exported on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          <p class="filter">Filter: ${filterMonth === "All" ? "All months" : filterMonth} · ${filterYear}</p>
          <h2>KPI Summary</h2>
          <div class="kpi-grid">
            ${allKpis.map((k) => `
              <div class="kpi-card">
                <div class="kpi-label">${k.label}</div>
                <div class="kpi-value">${k.value}</div>
                <div class="kpi-delta">${k.delta} ${k.sub}</div>
              </div>`).join("")}
          </div>
          ${insights.length > 0 ? `
            <h2>Insights</h2>
            ${insights.map((i) => `<div class="insight">• ${i}</div>`).join("")}
          ` : ""}
          <div class="footer">Generated by Shopeers · shopeers.io</div>
        </body>
      </html>`;
    const w = window.open("", "_blank");
    w.document.write(printContent);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 500);
  }, [allKpis, insights, filterMonth, filterYear]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] text-[var(--app-fg)]">
        <p className="text-lg text-[var(--app-subtle)]">Loading dashboard…</p>
      </div>
    );
  }

  // ── Secondary pages ────────────────────────────────────────────────────────
  const secondaryPages = {
    analytics: { title: "Report & Analytics", description: "Upload a dataset to populate detailed analytics here." },
  };

  if (secondaryPages[activeNav]) {
    const p = secondaryPages[activeNav];
    return (
      <div className="flex min-h-screen bg-transparent text-[var(--app-fg)]">
        <DashboardSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
          activeNav={activeNav}
          onNavigate={navigateTo}
          user={user}
          onLogout={handleLogout}
          onEditProfile={openProfileEdit}
          onOpenSettings={() => setModalSettings(true)}
          onOpenFeedback={() => setModalFeedback(true)}
          onOpenHelp={() => setModalHelp(true)}
        />
        <main className="min-w-0 flex-1 overflow-y-auto p-6 lg:p-8">
          <PlaceholderPage title={p.title} description={p.description} onBack={() => navigateTo("dashboard")} />
        </main>
      </div>
    );
  }

  // ── Main dashboard ─────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-transparent text-[var(--app-fg)]">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        activeNav={activeNav}
        onNavigate={navigateTo}
        user={user}
        onLogout={handleLogout}
        onEditProfile={openProfileEdit}
        onOpenSettings={() => setModalSettings(true)}
        onOpenFeedback={() => setModalFeedback(true)}
        onOpenHelp={() => setModalHelp(true)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 border-b border-[var(--app-border)] bg-[var(--app-surface)]/70 px-6 py-4 backdrop-blur-xl lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              {stats?.last_filename && (
                <p className="text-xs text-[var(--app-subtle)]">Last file: {stats.last_filename}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* ── Search (functional — filters KPIs & insights) ── */}
              <div className="relative min-w-[200px] flex-1 lg:max-w-sm">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-muted)]" />
                <input
                  type="search"
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  placeholder="Search KPIs or insights…"
                  className="h-10 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-strong)] pl-10 pr-3 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-muted)] outline-none transition focus:border-[var(--app-border-2)] focus:bg-white/70 focus:ring-4 focus:ring-[var(--app-accent-2)]/20"
                />
                {headerSearch && (
                  <button
                    type="button"
                    onClick={() => setHeaderSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--app-muted)] hover:text-[var(--app-fg)]"
                  >
                    <FiX className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* ── Dark / Light mode toggle ── */}
              <button
                type="button"
                onClick={() => setDarkMode((d) => !d)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-subtle)] transition-colors hover:bg-white/70"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                title={darkMode ? "Light mode" : "Dark mode"}
              >
                {darkMode
                  ? <FiSun  className="h-[18px] w-[18px]" />
                  : <FiMoon className="h-[18px] w-[18px]" />
                }
              </button>

             

              {/* ── Exports only (Imports removed) ── */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setExportsOpen((v) => !v)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--app-primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--app-primary-2)]"
                >
                  Exports
                </button>
                {exportsOpen && (
                  <div className="absolute right-0 z-30 mt-2 w-48 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] py-1 shadow-lg">
                    <button type="button" className="block w-full px-4 py-2 text-left text-sm hover:bg-black/5" onClick={handleExportPDF}>
                      Export as PDF
                    </button>
                    <button type="button" className="block w-full px-4 py-2 text-left text-sm hover:bg-black/5" onClick={() => setExportsOpen(false)}>
                      Schedule email (soon)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ── Main content ──────────────────────────────────────────────────── */}
        <main ref={mainScrollRef} className="flex-1 overflow-y-auto px-6 py-6 lg:px-8 lg:py-8">

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          {/* ── Top toolbar row ────────────────────────────────────────────── */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">

            {/* Left: Customize widget */}
            <div className="flex flex-wrap items-start gap-2">
              <button
                type="button"
                onClick={() => setCustomizeOpen((v) => !v)}
                className={`inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors ${
                  customizeOpen
                    ? "border-[var(--app-primary)] bg-[var(--app-primary)]/10 text-[var(--app-primary)]"
                    : "border-[var(--app-border)] bg-[var(--app-surface)] hover:bg-white/70"
                }`}
              >
                <FiGrid className="h-4 w-4" />
                Customize widget
              </button>

              {/* ✅ Customize panel — checkboxes now control real visibility */}
              {customizeOpen && (
                <div className="absolute z-20 mt-12 w-56 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-lg">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">Visible widgets</p>
                  {[
                    ["KPI overview",  showKpis,       setShowKpis],
                    ["Charts",        showCharts,     setShowCharts],
                    ["Insights",      showInsights,   setShowInsights],
                    ["Performance",   showPerformance,setShowPerformance],
                  ].map(([label, val, setter]) => (
                    <label key={label} className="flex cursor-pointer items-center gap-3 py-1.5 text-sm">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={(e) => setter(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 accent-[var(--app-primary)]"
                      />
                      {label}
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCustomizeOpen(false)}
                    className="mt-3 w-full rounded-lg bg-[var(--app-primary)] py-1.5 text-xs font-semibold text-white hover:bg-[var(--app-primary-2)]"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* Right: last updated + date filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-[var(--app-subtle)]">
                Last update {minutesAgo} minute{minutesAgo === 1 ? "" : "s"} ago
              </span>

              {/* ✅ Month filter */}
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="h-10 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-sm text-[var(--app-fg)] outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
                aria-label="Filter by month"
              >
                <option value="All">All months</option>
                {MONTHS.map((m) => <option key={m}>{m}</option>)}
              </select>

              {/* ✅ Year filter */}
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="h-10 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-sm text-[var(--app-fg)] outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
                aria-label="Filter by year"
              >
                {YEARS.map((y) => <option key={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* ── Upload card ─────────────────────────────────────────────────── */}
          <div className="mb-6 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">Upload sales data</p>
              {file && <span className="truncate text-xs text-[var(--app-subtle)]">{file.name}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--app-border)] bg-white/60 px-4 text-sm font-medium hover:bg-white"
              >
                <FiPlus className="h-4 w-4" />
                Choose file
              </button>
              <button
  type="button"
  onClick={handleUpload}
  disabled={uploading}
  className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--app-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--app-primary-2)] disabled:opacity-50 disabled:cursor-not-allowed"
>
  {uploading ? (
    <>
      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
      </svg>
      Uploading…
    </>
  ) : "Upload"}
</button>
            </div>
            {uploadMsg && (
              <p className={`mt-3 text-sm ${uploadMsg.startsWith("✓") ? "text-emerald-600" : "text-red-500"}`}>
                {uploadMsg}
              </p>
            )}
          </div>

          {/* ── KPI cards (toggleable, searchable) ──────────────────────────── */}
          {showKpis && (
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {displayKpis.length > 0 ? displayKpis.map((card, idx) => (
                <div
                  key={`${card.label}-${idx}`}
                  className="relative rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                >
                  <button
                    type="button"
                    className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    onClick={() => setKpiMenu(kpiMenu === idx ? null : idx)}
                    aria-label="Card menu"
                  >
                    <FiMoreHorizontal className="h-5 w-5" />
                  </button>
                  {kpiMenu === idx && (
                    <div className="absolute right-4 top-12 z-20 w-40 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                      <button type="button" className="block w-full px-3 py-2 text-left text-xs hover:bg-slate-50"
                        onClick={() => { setKpiMenu(null); setLastUpdated(new Date()); }}>
                        Refresh metric
                      </button>
                      <button type="button" className="block w-full px-3 py-2 text-left text-xs hover:bg-slate-50"
                        onClick={() => setKpiMenu(null)}>
                        View details
                      </button>
                    </div>
                  )}
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{card.value}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      card.up ? "bg-emerald-50 text-emerald-700" : "bg-pink-50 text-pink-700"
                    }`}>
                      {card.delta}
                    </span>
                    <span className="text-xs text-slate-400">{card.sub}</span>
                  </div>
                </div>
              )) : (
                <p className="col-span-4 py-4 text-center text-sm text-slate-400">
                  No KPIs match "{headerSearch}".
                </p>
              )}
            </div>
          )}

          {/* ── Charts row (toggleable) ─────────────────────────────────────── */}
          <div id="analytics-section" className="mb-6 scroll-mt-24">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
             {showCharts && (
  charts.length > 0 ? (
    <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* ...existing charts code... */}
    </div>
  ) : uploading ? (
    // 👇 NEW: spinner while uploading
    <div className="mb-6 flex items-center justify-center rounded-2xl border border-slate-100 bg-white p-10 shadow-sm">
      <svg className="h-8 w-8 animate-spin text-[var(--app-primary)]" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
      </svg>
      <span className="ml-3 text-sm text-slate-500">Generating charts…</span>
    </div>
  ) : (
    <div className="mb-6 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
      Upload a CSV or Excel file to generate live charts from your data.
    </div>
  )
)}

              {showPerformance && (
                <div className={`rounded-2xl border border-slate-100 bg-white p-5 shadow-sm ${showCharts ? "" : "lg:col-span-3"}`}>
                  <h2 className="mb-4 text-base font-bold text-slate-900">Performance</h2>
                  <div className="flex flex-col gap-5">
                    {PERFORMANCE.map((row) => (
                      <button
                        key={row.id}
                        type="button"
                        onMouseEnter={() => setPerfHover(row.id)}
                        onMouseLeave={() => setPerfHover(null)}
                        className="w-full text-left"
                      >
                        <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-600">
                          <span>{row.label}</span>
                          <span className="text-slate-900">{row.target}</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${row.color} ${perfHover === row.id ? "opacity-100" : "opacity-90"}`}
                            style={{ width: perfHover === row.id ? `${Math.min(100, row.pct + 4)}%` : `${row.pct}%` }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Upload-driven charts (toggleable) ──────────────────────────── */}
          {showCharts && (
            charts.length > 0 ? (
              <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="mb-4 text-sm font-bold text-slate-900">
                    {charts.find((c) => c.type === "bar")?.title || "Top categories"}
                  </p>
                  <TopProductsChart data={charts.find((c) => c.type === "bar")} />
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="mb-4 text-sm font-bold text-slate-900">
                    {charts.find((c) => c.type === "line")?.title || "Revenue trend"}
                  </p>
                  <RevenueChart data={charts.find((c) => c.type === "line")} />
                </div>
              </div>
            ) : (
              <div className="mb-6 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                Upload a CSV or Excel file to generate live charts from your data.
              </div>
            )
          )}

          {/* ── Insights (toggleable, searchable) ─────────────────────────── */}
          {showInsights && displayInsights.length > 0 && (
            <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="mb-3 text-sm font-bold text-slate-900">
                Insights
                {headerSearch && <span className="ml-2 text-xs font-normal text-slate-400">— filtered by "{headerSearch}"</span>}
              </p>
              <ul className="flex flex-col gap-2">
                {displayInsights.map((item, idx) => (
                  <li key={idx} className="text-sm text-slate-600">{item}</li>
                ))}
              </ul>
            </div>
          )}

        </main>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <ModalsBundle
        modalSettings={modalSettings}  setModalSettings={setModalSettings}
        settings={settings}            saveSettings={saveSettings}
        modalFeedback={modalFeedback}  setModalFeedback={setModalFeedback}
        feedbackText={feedbackText}    setFeedbackText={setFeedbackText}
        modalProfile={modalProfile}    setModalProfile={setModalProfile}
        profileDraft={profileDraft}    setProfileDraft={setProfileDraft}
        saveProfile={saveProfile}
        modalEmail={modalEmail}        setModalEmail={setModalEmail}
        user={user}
        modalHelp={modalHelp}          setModalHelp={setModalHelp}
      />
    </div>
  );
}

// ─── Modals bundle ────────────────────────────────────────────────────────────
function ModalsBundle({
  modalSettings, setModalSettings, settings, saveSettings,
  modalFeedback, setModalFeedback, feedbackText, setFeedbackText,
  modalProfile,  setModalProfile,  profileDraft, setProfileDraft, saveProfile,
  modalEmail,    setModalEmail,    user,
  modalHelp,     setModalHelp,
}) {
  return (
    <>
      {/* Settings */}
      <Modal open={modalSettings} onClose={() => setModalSettings(false)} title="Settings"
        footer={<button type="button" onClick={() => setModalSettings(false)}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Done</button>}>
        <div className="space-y-4">
          {[
            ["Compact chart height",    "compactCharts"],
            ["Daily email digest",      "emailDigest"],
            ["Weekly performance report","weeklyReport"],
          ].map(([label, key]) => (
            <label key={key} className="flex items-center justify-between gap-4">
              <span>{label}</span>
              <input type="checkbox" checked={settings[key]}
                onChange={(e) => saveSettings({ [key]: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300" />
            </label>
          ))}
          <p className="text-xs text-slate-400">Preferences are stored on this device.</p>
        </div>
      </Modal>

      {/* Feedback */}
      <Modal open={modalFeedback} onClose={() => setModalFeedback(false)} title="Feedback"
        footer={<>
          <button type="button" onClick={() => setModalFeedback(false)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="button" onClick={() => {
            if (feedbackText.trim()) { setFeedbackText(""); setModalFeedback(false); }
          }} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Send</button>
        </>}>
        <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)}
          rows={4} placeholder="What should we improve?"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-500/15" />
      </Modal>

      {/* Profile */}
      <Modal open={modalProfile} onClose={() => setModalProfile(false)} title="Edit profile"
        footer={<>
          <button type="button" onClick={() => setModalProfile(false)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="button" onClick={saveProfile}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Save</button>
        </>}>
        <label className="mt-2 block text-xs font-medium text-slate-500">Display name</label>
        <input value={profileDraft.name} onChange={(e) => setProfileDraft((d) => ({ ...d, name: e.target.value }))}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-500/15" />
        <label className="mt-3 block text-xs font-medium text-slate-500">Email</label>
        <input type="email" value={profileDraft.email} onChange={(e) => setProfileDraft((d) => ({ ...d, email: e.target.value }))}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-500/15" />
      </Modal>

      {/* Email */}
      <Modal open={modalEmail} onClose={() => setModalEmail(false)} title="Email"
        footer={<button type="button"
          onClick={() => { window.location.href = `mailto:${encodeURIComponent(user.email)}?subject=${encodeURIComponent("Shopeers dashboard")}`; setModalEmail(false); }}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Open mail app</button>}>
        <p className="text-sm">Quick actions for <span className="font-medium text-slate-900">{user.email}</span>.</p>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          <li className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">Weekly summary — sent Mon 9:00</li>
          <li className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">Billing receipt — Mar 28</li>
        </ul>
      </Modal>

      {/* Help */}
      <Modal open={modalHelp} onClose={() => setModalHelp(false)} title="Help Center"
        footer={<button type="button" onClick={() => setModalHelp(false)}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Close</button>}>
        <ul className="list-inside list-disc space-y-2 text-sm">
          <li><button type="button" className="text-left text-blue-600 hover:underline"
            onClick={() => { setModalHelp(false); setTimeout(() => document.getElementById("analytics-section")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); }}>
            Analytics overview
          </button></li>
          <li>Import CSV — use the "Choose file" + Upload button on the dashboard</li>
          <li>Contact support: support@shopeers.io</li>
        </ul>
      </Modal>
    </>
  );
}
