import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiShield,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";

const FEATURES = [
  {
    Icon: FiBarChart2,
    title: "Smart Analytics",
    desc: "Upload any CSV and get instant charts, KPIs, and trend analysis.",
  },
  {
    Icon: FiTrendingUp,
    title: "Revenue Tracking",
    desc: "Monitor profit, expenses, and net income with real-time updates.",
  },
  {
    Icon: FiShield,
    title: "Secure & Private",
    desc: "Your data stays under your control. No unnecessary third-party sharing.",
  },
  {
    Icon: FiZap,
    title: "Instant Insights",
    desc: "Column detection helps populate your dashboard so you can explore faster.",
  },
];

const STATS = [
  { value: "50K+", label: "Businesses" },
  { value: "2M+", label: "Rows Processed" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9", label: "User Rating", star: true },
];

const KPI_CARDS = [
  { label: "Page Views", value: "16,431", up: true, pct: "+15.5%" },
  { label: "Visitors", value: "6,225", up: true, pct: "+8.4%" },
  { label: "Click", value: "2,832", up: false, pct: "-10.5%" },
  { label: "Orders", value: "1,224", up: true, pct: "+4.4%" },
];

const TESTIMONIALS = [
  {
    name: "Rama",
    role: "Ops Lead at SkyFleet",
    text: "From tracking to reporting, Shopeers simplifies it all. Game-changer for our workflow.",
  },
  {
    name: "Alice K.",
    role: "Finance Director",
    text: "I uploaded our Q4 data and had a full dashboard in 30 seconds. Absolutely incredible.",
  },
  {
    name: "James T.",
    role: "E-commerce Founder",
    text: "The auto-detection of columns saves us hours every single week.",
  },
];

const BAR_HEIGHTS = [30, 50, 40, 70, 55, 80, 65, 90, 75, 85, 95, 88];

export default function HeroPage() {
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [selectedKpi, setSelectedKpi] = useState(0);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [barHover, setBarHover] = useState(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  const onHeroPointer = useCallback((e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    setParallax({
      x: (e.clientX - cx) / cx,
      y: (e.clientY - cy) / cy,
    });
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsVisible(true);
      },
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent text-[var(--app-fg)]">
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-[var(--app-border)] bg-[var(--app-surface)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--app-primary)]">
              <FiBarChart2 className="text-lg text-white" aria-hidden />
            </div>
            <span className="text-lg font-bold tracking-tight">Shopeers</span>
          </Link>
          <div className="hidden items-center gap-8 text-sm font-medium text-[var(--app-subtle)] md:flex">
            <a href="#features" className="transition-colors hover:text-[var(--app-fg)]">
              Features
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-[var(--app-fg)]">
              How it works
            </a>
            <a href="#testimonials" className="transition-colors hover:text-[var(--app-fg)]">
              Stories
            </a>
            <Link to="/dashboard" className="transition-colors hover:text-[var(--app-fg)]">
              Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-3 py-2 text-sm font-medium text-[var(--app-subtle)] transition-colors hover:text-[var(--app-fg)]"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section
        className="relative overflow-hidden px-6 pb-16 pt-32"
        onMouseMove={onHeroPointer}
        onMouseLeave={() => setParallax({ x: 0, y: 0 })}
      >
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[700px] w-[700px] rounded-full bg-[var(--app-primary)]/10 opacity-70 blur-3xl transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${parallax.x * 28}px, ${parallax.y * 22}px)`,
          }}
        />
        <div
          className="pointer-events-none absolute left-[-40%] top-60 h-[500px] w-[500px] rounded-full bg-[var(--app-accent)]/10 opacity-50 blur-3xl transition-transform duration-300 ease-out md:left-[-10%]"
          style={{
            transform: `translate(${parallax.x * -20}px, ${parallax.y * -16}px)`,
          }}
        />

        <div className="relative mx-auto max-w-7xl text-center">
          <div
            className="mb-8 inline-flex animate-hero-fade-up items-center gap-2 rounded-full border border-[var(--app-border)] bg-white/60 px-4 py-2 text-xs font-semibold text-[var(--app-primary)]"
            style={{ animationDelay: "0.05s" }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--app-accent)]" />
            Now with AI-powered column detection
          </div>

          <h1
            className="mb-6 animate-hero-fade-up text-5xl font-extrabold leading-none tracking-tight md:text-7xl"
            style={{ animationDelay: "0.12s" }}
          >
            Smart Dashboard
            <br />
            <span className="bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-accent)] bg-clip-text text-transparent">
              for Every Business
            </span>
          </h1>

          <p
            className="mx-auto mb-10 max-w-2xl animate-hero-fade-up text-xl text-[var(--app-subtle)]"
            style={{ animationDelay: "0.2s" }}
          >
            Upload your CSV and get instant analytics — revenue charts, KPI cards, product rankings,
            and transaction tables. No setup. No code.
          </p>

          <div
            className="mb-16 flex animate-hero-fade-up flex-col items-center justify-center gap-4 sm:flex-row"
            style={{ animationDelay: "0.28s" }}
          >
            <Link
              to="/signup"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-accent)] px-8 py-4 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg hover:shadow-black/10"
            >
              Explore for Free <FiArrowRight className="text-lg" aria-hidden />
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 rounded-xl border-2 border-[var(--app-border)] bg-[var(--app-surface)] px-8 py-4 text-base font-semibold transition-all hover:bg-white/80 hover:shadow-md"
            >
              View Demo Dashboard
            </Link>
          </div>

          <div className="relative mx-auto max-w-5xl">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-[var(--app-bg)] to-transparent" />
            <div className="animate-hero-float overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-2xl shadow-black/10">
              <div className="flex items-center gap-2 border-b border-[var(--app-border)] bg-white/40 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 rounded-md border border-[var(--app-border)] bg-white/60 px-3 py-1 font-mono text-xs text-[var(--app-subtle)]">
                  app.shopeers.io/dashboard
                </div>
              </div>
              <div className="bg-white/30 p-4">
                <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {KPI_CARDS.map((c, i) => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => setSelectedKpi(i)}
                      className={`rounded-xl border p-3 text-left transition-all duration-200 ${
                        selectedKpi === i
                          ? "border-[var(--app-accent)] bg-white/70 shadow-md ring-2 ring-[var(--app-accent)]/15"
                          : "border-[var(--app-border)] bg-white/60 hover:bg-white/75 hover:shadow-sm"
                      }`}
                    >
                      <div className="mb-1 text-[10px] text-[var(--app-muted)]">{c.label}</div>
                      <div className="text-sm font-bold">{c.value}</div>
                      <div
                        className={`mt-0.5 text-[10px] font-semibold ${
                          c.up ? "text-emerald-500" : "text-red-500"
                        }`}
                      >
                        {c.pct}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-[var(--app-border)] bg-white/60 p-3 md:col-span-2">
                    <div className="mb-2 text-[10px] font-semibold text-[var(--app-subtle)]">
                      Total Profit
                      {selectedKpi >= 0 && (
                        <span className="ml-2 font-normal text-[var(--app-muted)]">
                          · highlighting {KPI_CARDS[selectedKpi].label}
                        </span>
                      )}
                    </div>
                    <div className="mb-3 text-xl font-extrabold">$446.7K</div>
                    <div className="flex h-10 items-end gap-1">
                      {BAR_HEIGHTS.map((h, i) => (
                        <button
                          key={i}
                          type="button"
                          className="min-h-[8px] flex-1 rounded-sm transition-all duration-150"
                          style={{
                            height: `${h}%`,
                            background:
                              barHover === i
                                ? "var(--app-primary-2)"
                                : i === 7
                                  ? "var(--app-primary)"
                                  : "rgba(223, 182, 178, 0.55)",
                            transform: barHover === i ? "scaleY(1.08)" : "scaleY(1)",
                            transformOrigin: "bottom",
                          }}
                          onMouseEnter={() => setBarHover(i)}
                          onMouseLeave={() => setBarHover(null)}
                          aria-label={`Bar ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[var(--app-border)] bg-white/60 p-3">
                    <div className="mb-3 text-[10px] font-semibold text-[var(--app-subtle)]">Customers</div>
                    {[
                      { label: "Retailers", val: "2,884", w: "80%", color: "bg-[var(--app-primary)]" },
                      { label: "Distribut.", val: "1,432", w: "50%", color: "bg-emerald-400" },
                      { label: "Wholesal.", val: "562", w: "25%", color: "bg-amber-400" },
                    ].map((s) => (
                      <div key={s.label} className="mb-2">
                        <div className="mb-1 flex justify-between text-[9px] text-[var(--app-subtle)]">
                          <span>{s.label}</span>
                          <span className="font-semibold">{s.val}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-black/5">
                          <div
                            className={`h-full rounded-full ${s.color} transition-all duration-500`}
                            style={{ width: s.w }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={statsRef} className="bg-[var(--app-ink)] py-14">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`text-center transition-all duration-700 ${
                statsVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="mb-1 flex items-center justify-center gap-1 text-3xl font-extrabold text-white">
                {s.value}
                {s.star && (
                  <FaStar className="text-amber-400" aria-hidden title="star rating" />
                )}
              </div>
              <div className="text-sm text-[var(--app-muted)]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="scroll-mt-20 bg-[var(--app-bg)] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-extrabold">
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="mx-auto max-w-xl text-lg text-[var(--app-subtle)]">
              A focused tool built for business owners who want insights fast.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => {
              const active = hoveredFeature === i;
              const Icon = f.Icon;
              return (
                <div
                  key={f.title}
                  role="button"
                  tabIndex={0}
                  className={`cursor-pointer rounded-2xl border p-6 transition-all duration-200 ${
                    active
                      ? "-translate-y-1 border-[var(--app-primary)] bg-[var(--app-primary)] shadow-xl shadow-black/10"
                      : "border-[var(--app-border)] bg-[var(--app-surface)] hover:bg-white/70"
                  }`}
                  onMouseEnter={() => setHoveredFeature(i)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  onFocus={() => setHoveredFeature(i)}
                  onBlur={() => setHoveredFeature(null)}
                >
                  <div
                    className={`mb-4 grid h-10 w-10 place-items-center rounded-xl ${
                      active ? "bg-white/20" : "bg-white/50"
                    }`}
                  >
                    <Icon className={`text-xl ${active ? "text-white" : "text-[var(--app-primary)]"}`} />
                  </div>
                  <h3 className={`mb-2 font-bold ${active ? "text-white" : "text-[var(--app-fg)]"}`}>
                    {f.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${active ? "text-white/80" : "text-[var(--app-subtle)]"}`}>
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 bg-white/30 px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-16 text-4xl font-extrabold">Up and running in 3 steps</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Upload CSV",
                desc: "Drag & drop any spreadsheet — sales, inventory, or finance data.",
              },
              {
                step: "02",
                title: "Auto-Detect",
                desc: "Columns are instantly classified and mapped to dashboard widgets.",
              },
              {
                step: "03",
                title: "Explore & Export",
                desc: "Interact with charts, search records, and export as PDF or PNG.",
              },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-[var(--app-primary)] text-xl font-extrabold text-white shadow-lg shadow-black/10">
                  {s.step}
                </div>
                <h3 className="mb-2 font-bold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--app-subtle)]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="scroll-mt-20 bg-[var(--app-bg)] px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-16 text-center text-4xl font-extrabold">
            Loved by teams worldwide
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-2xl border border-[var(--app-border)] bg-white/40 p-6">
                <div className="mb-4 flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-sm text-amber-400" aria-hidden />
                  ))}
                </div>
                <p className="mb-5 text-sm leading-relaxed text-[var(--app-subtle)]">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--app-primary)] text-xs font-bold text-white">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-[var(--app-muted)]">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--app-primary)] px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-4xl font-extrabold text-white">Ready to see your data clearly?</h2>
          <p className="mb-8 text-lg text-white/80">
            Join thousands of businesses that turned spreadsheets into insight.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/signup"
              className="flex items-center justify-center gap-2 rounded-xl bg-[var(--app-paper)] px-8 py-4 font-bold text-[var(--app-ink)] transition-colors hover:bg-white"
            >
              Start Free <FiArrowRight className="text-lg" aria-hidden />
            </Link>
            <Link
              to="/dashboard"
              className="rounded-xl border-2 border-white/30 px-8 py-4 font-semibold text-white transition-colors hover:bg-white/10"
            >
              View Dashboard
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white/80">
            {["No credit card", "Free forever plan", "Cancel anytime"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <FiCheckCircle className="shrink-0" aria-hidden />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[var(--app-ink)] px-6 py-10 text-center text-sm text-[var(--app-muted)]">
        <div className="mb-3 flex items-center justify-center gap-2">
          <div className="grid h-6 w-6 place-items-center rounded-md bg-[var(--app-primary)]">
            <FiBarChart2 className="text-sm text-white" aria-hidden />
          </div>
          <span className="font-bold text-white">Shopeers</span>
        </div>
        <p>© 2026 Shopeers. All rights reserved.</p>
      </footer>
    </div>
  );
}
