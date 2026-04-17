import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock, FiMail, FiUser } from "react-icons/fi";
import { registerUser } from "../lib/auth";

export default function SignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    return (
      name.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length >= 8 &&
      confirm.length >= 8 &&
      password === confirm &&
      !submitting
    );
  }, [name, email, password, confirm, submitting]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await registerUser({ name, email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "Could not create account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-transparent text-[var(--app-fg)]">
      <div className="relative hidden flex-1 overflow-hidden px-10 py-10 lg:flex xl:px-16">
        <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-[var(--app-accent-2)]/35 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-10 h-72 w-72 rounded-full bg-[var(--app-primary)]/25 blur-3xl" />

        <div className="relative z-10 flex w-full flex-col justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-accent)] text-white shadow-md shadow-black/10">
              <span className="text-lg font-bold">S</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Shopeers</span>
          </div>

          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
              Welcome
            </p>
            <h2 className="mt-3 text-4xl font-extrabold leading-tight">
              Create your account and start exploring insights.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--app-subtle)]">
              Your registration is saved on this device for this demo. You can sign in any time using the same email.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: "Private by default", value: "Data stays local" },
                { label: "Fast setup", value: "Less than 1 minute" },
                { label: "Modern UI", value: "Clean, calm theme" },
                { label: "Exports", value: "PDF / email soon" },
              ].map((c) => (
                <div key={c.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                  <div className="text-sm font-semibold">{c.label}</div>
                  <div className="mt-1 text-xs text-[var(--app-subtle)]">{c.value}</div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-[var(--app-muted)]">© 2026 Shopeers</p>
        </div>
      </div>

      <div className="flex w-full flex-1 items-center justify-center px-6 py-12 sm:px-10 lg:max-w-xl lg:px-12 xl:max-w-[520px]">
        <div className="w-full max-w-[420px] rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-xl shadow-black/10 backdrop-blur-xl">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--app-primary)] text-sm font-bold text-white">
                S
              </div>
              <span className="text-lg font-bold">Shopeers</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">Create account</h1>
          <p className="mt-2 text-sm text-[var(--app-subtle)]">
            Start with a free local account. You can connect OAuth later.
          </p>

          <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--app-subtle)]">Name</label>
              <div className="relative">
                <FiUser className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--app-muted)]" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="h-12 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-strong)] pl-11 pr-4 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-muted)] outline-none transition focus:border-[var(--app-border-2)] focus:bg-white/70 focus:ring-4 focus:ring-[var(--app-accent-2)]/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--app-subtle)]">Email</label>
              <div className="relative">
                <FiMail className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--app-muted)]" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
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
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="h-12 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-strong)] pl-11 pr-12 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-muted)] outline-none transition focus:border-[var(--app-border-2)] focus:bg-white/70 focus:ring-4 focus:ring-[var(--app-accent-2)]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--app-muted)] hover:bg-black/5"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff className="h-[18px] w-[18px]" /> : <FiEye className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--app-subtle)]">Confirm password</label>
              <div className="relative">
                <FiLock className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--app-muted)]" />
                <input
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  className="h-12 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-strong)] pl-11 pr-12 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-muted)] outline-none transition focus:border-[var(--app-border-2)] focus:bg-white/70 focus:ring-4 focus:ring-[var(--app-accent-2)]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--app-muted)] hover:bg-black/5"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <FiEyeOff className="h-[18px] w-[18px]" /> : <FiEye className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-[var(--app-border)] bg-white/60 px-4 py-3 text-sm text-[var(--app-accent)]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-2 h-12 w-full rounded-xl bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-accent)] text-sm font-semibold text-white shadow-md shadow-black/10 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create account"}
            </button>

            <p className="text-center text-sm text-[var(--app-subtle)]">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-[var(--app-primary)] hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

