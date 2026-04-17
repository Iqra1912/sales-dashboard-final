import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import { loginLocal, listUsers } from "../lib/auth";

const SLIDES = [
  {
    title: "Welcome back!",
    subtitle: "See revenue, inventory, and customer health in one calm workspace.",
  },
  {
    title: "Analytics that stay in sync",
    subtitle: "Upload spreadsheets or connect sources — charts update as your data does.",
  },
  {
    title: "Built for operators",
    subtitle: "Share dashboards, export reports, and keep your team aligned.",
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [slide, setSlide] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      localStorage.setItem("access_token", token);
      localStorage.setItem("token", token);
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async () => {
    setError("");
    setSubmitting(true);
    try {
      // Prefer local sign-in (matches the requested “saves sign in data” behavior).
      const users = listUsers();
      if (users.length > 0) {
        await loginLocal({ email, password });
        navigate("/dashboard");
        return;
      }

      // Fallback to server auth when no local users exist (keeps your backend login usable).
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Login failed");

      const t = data.access_token;
      localStorage.setItem("access_token", t);
      localStorage.setItem("token", t);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleLogin();
  };

  const nextSlide = () => setSlide((s) => (s + 1) % SLIDES.length);
  const prevSlide = () => setSlide((s) => (s - 1 + SLIDES.length) % SLIDES.length);

  return (
    <div className="flex min-h-screen bg-transparent text-[var(--app-fg)]">
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden px-10 py-10 lg:flex xl:px-16">
        <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-[var(--app-accent-2)]/35 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-10 h-72 w-72 rounded-full bg-[var(--app-primary)]/25 blur-3xl" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-accent)] text-white shadow-md shadow-black/10">
            <span className="text-lg font-bold">S</span>
          </div>
          <span className="text-xl font-bold tracking-tight">Shopeers</span>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-lg">
          <div className="relative mb-12 min-h-[220px]">
            <div className="absolute left-0 top-0 z-20 w-[88%] rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-lg shadow-black/10 backdrop-blur-xl">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--app-muted)]">
                Current balance
              </p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-[var(--app-primary)]">$24,359</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/5">
                <div className="h-full w-[72%] rounded-full bg-[var(--app-primary)]" />
              </div>
            </div>
            <div className="absolute right-0 top-24 z-30 w-[52%] rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-lg shadow-black/10 backdrop-blur-xl">
              <div className="relative mx-auto h-28 w-28">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="var(--app-primary)"
                    strokeWidth="12"
                    strokeDasharray={`${34 * 2.51} ${100 * 2.51}`}
                    strokeLinecap="round"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="var(--app-accent)"
                    strokeWidth="12"
                    strokeDasharray={`${22 * 2.51} ${100 * 2.51}`}
                    strokeDashoffset={-34 * 2.51}
                    strokeLinecap="round"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="12"
                    strokeDasharray={`${24 * 2.51} ${100 * 2.51}`}
                    strokeDashoffset={-56 * 2.51}
                    strokeLinecap="round"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="12"
                    strokeDasharray={`${20 * 2.51} ${100 * 2.51}`}
                    strokeDashoffset={-80 * 2.51}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-extrabold">34%</span>
                  <span className="text-[10px] font-medium text-[var(--app-subtle)]">Food</span>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-8 z-10 w-[70%] rounded-2xl border-2 border-dashed border-[var(--app-border)] bg-white/70 p-4 shadow-sm backdrop-blur-sm">
              <p className="text-xs font-semibold">New transaction</p>
              <p className="mt-1 text-[11px] text-[var(--app-subtle)]">Upload .xls or connect your bank feed.</p>
              <button
                type="button"
                className="mt-3 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-primary)] text-white shadow-md transition hover:bg-[var(--app-primary-2)]"
                aria-label="Add transaction"
              >
                +
              </button>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight transition-opacity duration-300">
              {SLIDES[slide].title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--app-subtle)]">{SLIDES[slide].subtitle}</p>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={prevSlide}
            className="grid h-10 w-10 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-subtle)] shadow-sm transition hover:bg-white/70"
            aria-label="Previous slide"
          >
            <FiArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSlide(i)}
                className={`h-2 rounded-full transition-all ${
                  i === slide ? "w-8 bg-[var(--app-primary)]" : "w-2 bg-black/15 hover:bg-black/25"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={nextSlide}
            className="grid h-10 w-10 place-items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-subtle)] shadow-sm transition hover:bg-white/70"
            aria-label="Next slide"
          >
            <FiArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:max-w-xl lg:px-12 xl:max-w-[520px]">
        <div className="mx-auto w-full max-w-[400px]">
          <div className="mb-10 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--app-primary)] text-sm font-bold text-white">
                S
              </div>
              <span className="text-lg font-bold">Shopeers</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
          <p className="mt-2 text-sm text-[var(--app-subtle)]">
            Sign in to continue to your sales dashboard and reports.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--app-subtle)]">Email</label>
              <div className="relative">
                <FiMail className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--app-muted)]" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-strong)] pl-11 pr-4 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-muted)] outline-none transition focus:border-[var(--app-border-2)] focus:bg-white/70 focus:ring-4 focus:ring-[var(--app-accent-2)]/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--app-subtle)]">Password</label>
              <div className="relative">
                <FiLock className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--app-muted)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-strong)] pl-11 pr-12 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-muted)] outline-none transition focus:border-[var(--app-border-2)] focus:bg-white/70 focus:ring-4 focus:ring-[var(--app-accent-2)]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--app-muted)] hover:bg-black/5"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff className="h-[18px] w-[18px]" /> : <FiEye className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm font-semibold text-[var(--app-primary)] hover:underline">
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="rounded-xl border border-[var(--app-border)] bg-white/60 px-4 py-3 text-sm text-[var(--app-accent)]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="h-12 w-full rounded-xl bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-accent)] text-sm font-semibold text-white shadow-md shadow-black/10 transition hover:brightness-110 disabled:opacity-60"
            >
              {submitting ? "Logging in..." : "Login"}
            </button>

            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-black/10" />
              <span className="text-xs font-medium text-[var(--app-muted)]">or</span>
              <div className="h-px flex-1 bg-black/10" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  window.location.href = "http://127.0.0.1:8000/api/auth/google/login";
                }}
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[var(--app-border)] bg-white/70 text-sm font-medium shadow-sm transition hover:bg-white"
              >
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => alert("Facebook sign-in is not configured for this project yet.")}
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[var(--app-border)] bg-white/70 text-sm font-medium shadow-sm transition hover:bg-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" aria-hidden>
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
            </div>

            <p className="text-center text-sm text-[var(--app-subtle)]">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="font-semibold text-[var(--app-primary)] hover:underline">
                Sign Up
              </Link>
            </p>
          </form>

          <p className="mt-12 text-center text-xs text-[var(--app-muted)]">© 2026 Shopeers. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
