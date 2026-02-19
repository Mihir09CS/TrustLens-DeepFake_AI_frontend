import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ScanLine,
  History,
  FileBadge2,
  Layers,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
  Zap,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Helpers ──
const getUserData = () => {
  try {
    return JSON.parse(localStorage.getItem("sentinel_user"));
  } catch {
    return null;
  }
};

// ── Single nav item ──
function NavItem({ to, icon, label, collapsed, badge }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative ${
        isActive
          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 border border-transparent"
      }`}
    >
      {/* Active left bar */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-cyan-400 rounded-r-full" />
      )}

      <span
        className={`flex-shrink-0 ${isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"}`}
      >
        {icon}
      </span>

      {!collapsed && (
        <span className="text-sm font-medium truncate flex-grow">{label}</span>
      )}

      {/* Badge */}
      {!collapsed && badge && (
        <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
          {badge}
        </span>
      )}

      {/* Tooltip for collapsed mode */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-800 border border-slate-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg transition-opacity duration-150">
          {label}
          {badge && (
            <span className="ml-1.5 text-cyan-400 font-bold">{badge}</span>
          )}
          {/* Arrow */}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
        </div>
      )}
    </Link>
  );
}

// ── Section label ──
function SectionLabel({ label, collapsed }) {
  if (collapsed) {
    return <div className="my-2 border-t border-slate-800" />;
  }
  return (
    <p className="px-3 mb-1 mt-4 text-[10px] font-semibold uppercase tracking-widest text-slate-600 first:mt-2">
      {label}
    </p>
  );
}

export default function UserSidebar() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [engineStatus, setEngineStatus] = useState({
    audio: "unknown",
    image: "unknown",
    video: "unknown",
  });

  const user = getUserData();

  const handleLogout = () => {
    localStorage.removeItem("sentinel_token");
    localStorage.removeItem("sentinel_role");
    localStorage.removeItem("sentinel_user");
    navigate("/");
  };

  useEffect(() => {
    let active = true;

    const loadHealth = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`);
        const body = await res.json();
        const models = body?.data?.aiDetails?.models;
        if (!active || !models) return;
        setEngineStatus({
          audio: models.audioModelLoaded ? "ready" : "degraded",
          image: models.imageModelLoaded ? "ready" : "degraded",
          video: models.videoModelLoaded ? "ready" : "degraded",
        });
      } catch {
        if (!active) return;
        setEngineStatus({
          audio: "offline",
          image: "offline",
          video: "offline",
        });
      }
    };

    loadHealth();
    const intervalId = window.setInterval(loadHealth, 10000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <aside
      className={`relative flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out flex-shrink-0 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* ── Collapse toggle button ── */}
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-all shadow-md"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* ── Logo strip ── */}
      <div
        className={`flex items-center gap-2.5 h-16 border-b border-slate-800 px-4 flex-shrink-0 ${
          collapsed ? "justify-center px-0" : ""
        }`}
      >
        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
          <Shield size={15} className="text-cyan-400" />
        </div>
        {!collapsed && (
          <span className="text-white font-bold text-sm">
            TrustLens<span className="text-cyan-400">AI</span>
          </span>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-grow overflow-y-auto py-2 px-2 space-y-0.5">
        <SectionLabel label="Workspace" collapsed={collapsed} />

        <NavItem
          to="/dashboard"
          icon={<LayoutDashboard size={17} />}
          label="Dashboard"
          collapsed={collapsed}
        />

        <SectionLabel label="Detection" collapsed={collapsed} />

        <NavItem
          to="/scanner"
          icon={<ScanLine size={17} />}
          label="Scanner"
          collapsed={collapsed}
          badge="NEW"
        />

        <NavItem
          to="/scanner/bulk"
          icon={<Layers size={17} />}
          label="Bulk Analyzer"
          collapsed={collapsed}
        />

        <SectionLabel label="Forensics" collapsed={collapsed} />

        <NavItem
          to="/history"
          icon={<History size={17} />}
          label="Scan History"
          collapsed={collapsed}
        />
        <NavItem
          to="/reports"
          icon={<FileBadge2 size={17} />}
          label="Report Proofs"
          collapsed={collapsed}
        />
      </nav>

      {/* ── System status indicator ── */}
      {!collapsed && (
        <div className="mx-2 mb-2 px-3 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Zap size={11} className="text-cyan-400" />
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              AI Engine
            </span>
          </div>
          <div className="space-y-1">
            {[ 
              { label: "Audio Model", status: engineStatus.audio },
              { label: "Image Model", status: engineStatus.image },
              { label: "Video Model", status: engineStatus.video },
            ].map((m) => (
              <div key={m.label} className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500">{m.label}</span>
                <span
                  className={`flex items-center gap-1 text-[10px] ${
                    m.status === "ready"
                      ? "text-emerald-400"
                      : m.status === "degraded"
                        ? "text-amber-400"
                        : "text-red-400"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      m.status === "ready"
                        ? "bg-emerald-400 animate-pulse"
                        : m.status === "degraded"
                          ? "bg-amber-400 animate-pulse"
                          : "bg-red-400"
                    }`}
                  />
                  {m.status === "ready"
                    ? "Ready"
                    : m.status === "degraded"
                      ? "Degraded"
                      : "Offline"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collapsed status dot */}
      {collapsed && (
        <div className="flex justify-center mb-3">
          <div
            title="All models online"
            className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
          />
        </div>
      )}

      {/* ── User profile strip + logout ── */}
      <div className="border-t border-slate-800 p-2 flex-shrink-0">
        <div
          className={`flex items-center gap-2.5 px-2 py-2 rounded-lg ${
            collapsed ? "justify-center" : ""
          }`}
        >
          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || <User size={13} />}
          </div>
          {!collapsed && (
            <div className="flex-grow min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {user?.email || ""}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              title="Sign out"
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={13} />
            </button>
          )}
        </div>

        {/* Collapsed logout */}
        {collapsed && (
          <button
            onClick={handleLogout}
            title="Sign out"
            className="w-full mt-1 flex items-center justify-center py-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={14} />
          </button>
        )}
      </div>
    </aside>
  );
}


