import { useEffect, useRef, useState } from "react";
import {
  FiBarChart2,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiHelpCircle,
  FiMessageCircle,
  FiSettings,
} from "react-icons/fi";
import { HiOutlineViewGrid } from "react-icons/hi";

// ✅ Kept: Dashboard + Report & Analytics only
const PRIMARY_NAV = [
  { id: "dashboard", label: "Dashboard", Icon: HiOutlineViewGrid },
  { id: "analytics", label: "Report & Analytics", Icon: FiBarChart2 },
];

// ✅ Kept: Help Center + Feedback only (removed Settings from view)
const FOOTER_NAV = [
  { id: "help",     label: "Help Center", Icon: FiHelpCircle },
  { id: "feedback", label: "Feedback",    Icon: FiMessageCircle },
];

function NavButton({ item, active, collapsed, onClick }) {
  const Icon = item.Icon;
  return (
    <button
      type="button"
      onClick={() => onClick(item.id)}
      title={collapsed ? item.label : undefined}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
        active
          ? "bg-black/5 text-[var(--app-fg)]"
          : "text-[var(--app-subtle)] hover:bg-black/5"
      } ${collapsed ? "justify-center px-2" : ""}`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </button>
  );
}

export default function DashboardSidebar({
  collapsed,
  onToggleCollapse,
  activeNav,
  onNavigate,
  user,
  onLogout,
  onEditProfile,
  onOpenSettings,
  onOpenFeedback,
  onOpenHelp,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleFooter = (id) => {
    if (id === "help")     onOpenHelp?.();
    if (id === "feedback") onOpenFeedback?.();
  };

  return (
    <aside
      className={`flex h-screen shrink-0 flex-col border-r border-[var(--app-border)] bg-[var(--app-surface)]/70 backdrop-blur-xl transition-[width] duration-300 ease-out ${
        collapsed ? "w-[76px]" : "w-[260px]"
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-2 border-b border-[var(--app-border)] py-4 ${collapsed ? "justify-center px-2" : "px-5"}`}>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--app-primary)] text-white shadow-sm">
          <span className="text-lg font-bold leading-none">◇</span>
        </div>
        {!collapsed && (
          <span className="truncate text-lg font-bold tracking-tight">Shopeers</span>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className={`ml-auto grid h-8 w-8 place-items-center rounded-lg border border-[var(--app-border)] text-[var(--app-subtle)] transition-colors hover:bg-black/5 ${collapsed ? "hidden" : ""}`}
          aria-label="Collapse sidebar"
        >
          <FiChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="mx-auto mt-2 grid h-8 w-8 place-items-center rounded-lg border border-[var(--app-border)] text-[var(--app-subtle)] hover:bg-black/5"
          aria-label="Expand sidebar"
        >
          <FiChevronRight className="h-4 w-4" />
        </button>
      )}

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {/* Primary nav — Dashboard + Analytics */}
        <div className="space-y-0.5">
          {PRIMARY_NAV.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              collapsed={collapsed}
              active={activeNav === item.id}
              onClick={onNavigate}
            />
          ))}
        </div>

        {/* Footer nav — Help + Feedback pushed to bottom */}
        <div className="mt-auto space-y-0.5 pt-4">
          {!collapsed && (
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--app-muted)]">
              Support
            </p>
          )}
          {FOOTER_NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              title={collapsed ? item.label : undefined}
              onClick={() => handleFooter(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--app-subtle)] transition-colors hover:bg-black/5 ${
                collapsed ? "justify-center px-2" : ""
              }`}
            >
              <item.Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* Profile */}
      <div ref={profileRef} className="relative border-t border-[var(--app-border)] p-3">
        <button
          type="button"
          onClick={() => setProfileOpen((o) => !o)}
          className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-black/5 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-accent)] text-sm font-bold text-white">
            {user.name?.[0]?.toUpperCase() || "U"}
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-[var(--app-subtle)]">{user.email}</p>
              </div>
              <FiChevronDown
                className={`h-4 w-4 shrink-0 text-[var(--app-muted)] transition-transform ${profileOpen ? "rotate-180" : ""}`}
              />
            </>
          )}
        </button>

        {profileOpen && (
          <div className={`absolute bottom-full left-3 right-3 z-50 mb-2 overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] py-1 shadow-lg ${
            collapsed ? "left-2 right-auto w-48" : ""
          }`}>
            <button type="button" className="w-full px-4 py-2.5 text-left text-sm hover:bg-black/5"
              onClick={() => { setProfileOpen(false); onEditProfile(); }}>
              Edit profile
            </button>
            <button type="button" className="w-full px-4 py-2.5 text-left text-sm hover:bg-black/5"
              onClick={() => { setProfileOpen(false); onOpenFeedback?.(); }}>
              Send feedback
            </button>
            <button type="button" className="w-full px-4 py-2.5 text-left text-sm hover:bg-black/5"
              onClick={() => { setProfileOpen(false); onOpenSettings?.(); }}>
              Settings
            </button>
            <div className="my-1 border-t border-[var(--app-border)]" />
            <button type="button"
              className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              onClick={() => { setProfileOpen(false); onLogout(); }}>
              Log out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}