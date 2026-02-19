import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ScanLine,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldAlert,
  Activity,
  Settings,
} from "lucide-react";

// ── Helpers ──
const getAdminData = () => {
  try {
    return JSON.parse(localStorage.getItem("sentinel_user"));
  } catch {
    return null;
  }
};

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Single nav item ──
function AdminNavItem({ to, icon, label, collapsed, danger }) {
  const location = useLocation();
  const isActive =
    location.pathname === to ||
    (to !== "/admin/dashboard" && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      title={collapsed ? label : undefined}
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
        danger
          ? "text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent"
          : isActive
            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 border border-transparent"
      }`}
    >
      {/* Active indicator */}
      {isActive && !danger && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-amber-400 rounded-r-full" />
      )}

      <span
        className={`flex-shrink-0 ${
          danger
            ? ""
            : isActive
              ? "text-amber-400"
              : "text-slate-500 group-hover:text-slate-300"
        }`}
      >
        {icon}
      </span>

      {!collapsed && (
        <span className="text-sm font-medium truncate">{label}</span>
      )}

      {/* Tooltip */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-800 border border-slate-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg transition-opacity">
          {label}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
        </div>
      )}
    </Link>
  );
}

// ── Section label ──
function SectionLabel({ label, collapsed }) {
  if (collapsed) return <div className="my-2 border-t border-slate-800/60" />;
  return (
    <p className="px-3 mb-1 mt-4 text-[10px] font-semibold uppercase tracking-widest text-slate-600 first:mt-2">
      {label}
    </p>
  );
}

// ── Stats mini card ──
function MiniStat({ label, value, color = "cyan" }) {
  const colors = {
    cyan: "text-cyan-400",
    amber: "text-amber-400",
    red: "text-red-400",
    emerald: "text-emerald-400",
  };
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-slate-500">{label}</span>
      <span className={`text-[10px] font-bold font-mono ${colors[color]}`}>
        {value}
      </span>
    </div>
  );
}

export default function AdminSidebar() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [platformStats, setPlatformStats] = useState({
    totalScans: "—",
    highRisk: "—",
    totalUsers: "—",
  });

  const admin = getAdminData();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = localStorage.getItem("sentinel_token");
        if (!token) return;
        const res = await fetch(`${API_BASE}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await res.json();
        if (!res.ok || !body?.data) return;
        setPlatformStats({
          totalScans: body.data.totalScans ?? "—",
          highRisk: body.data.highRisk ?? "—",
          totalUsers: body.data.totalUsers ?? "—",
        });
      } catch {
        // Keep default placeholder values when stats request fails.
      }
    };
    loadStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("sentinel_token");
    localStorage.removeItem("sentinel_role");
    localStorage.removeItem("sentinel_user");
    navigate("/auth/login");
  };

  return (
    <aside
      className={`relative flex flex-col bg-slate-950 border-r border-slate-800/60 transition-all duration-300 ease-in-out flex-shrink-0 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* ── Collapse toggle ── */}
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-amber-500/40 transition-all shadow-md"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* ── Logo strip ── */}
      <div
        className={`flex items-center gap-2.5 h-16 border-b border-slate-800/60 flex-shrink-0 ${
          collapsed ? "justify-center px-0" : "px-4"
        }`}
      >
        <div className="relative flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Shield size={15} className="text-amber-400" />
          </div>
          {/* Admin badge dot */}
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-none">
            <span className="text-white font-bold text-sm">
              Sentinel<span className="text-amber-400">AI</span>
            </span>
            <span className="text-amber-600 text-[9px] tracking-widest uppercase font-medium">
              Admin Console
            </span>
          </div>
        )}
      </div>

      {/* ── Alert banner (collapsed: dot only) ── */}
      {!collapsed && (
        <div className="mx-2 mt-3 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/15 flex items-center gap-2">
          <ShieldAlert size={13} className="text-amber-400 flex-shrink-0" />
          <span className="text-[10px] text-amber-400/80 font-medium">
            Admin Access — Handle with care
          </span>
        </div>
      )}

      {/* ── Navigation ── */}
      <nav className="flex-grow overflow-y-auto py-2 px-2 space-y-0.5">
        <SectionLabel label="Overview" collapsed={collapsed} />

        <AdminNavItem
          to="/admin/dashboard"
          icon={<LayoutDashboard size={17} />}
          label="Dashboard"
          collapsed={collapsed}
        />

        <SectionLabel label="Management" collapsed={collapsed} />

        <AdminNavItem
          to="/admin/users"
          icon={<Users size={17} />}
          label="Users"
          collapsed={collapsed}
        />

        <AdminNavItem
          to="/admin/scans"
          icon={<ScanLine size={17} />}
          label="All Scans"
          collapsed={collapsed}
        />

        <SectionLabel label="Intelligence" collapsed={collapsed} />

        <AdminNavItem
          to="/admin/analytics"
          icon={<BarChart3 size={17} />}
          label="Analytics"
          collapsed={collapsed}
        />

        <AdminNavItem
          to="/admin/system"
          icon={<Activity size={17} />}
          label="System Health"
          collapsed={collapsed}
        />
      </nav>

      {/* ── Platform quick stats ── */}
      {!collapsed && (
        <div className="mx-2 mb-2 px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-1.5 mb-2">
            <Activity size={11} className="text-amber-400" />
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              Platform Stats
            </span>
          </div>
          <div className="space-y-1.5">
            <MiniStat label="Total Scans" value={platformStats.totalScans} color="cyan" />
            <MiniStat label="High Risk" value={platformStats.highRisk} color="red" />
            <MiniStat label="Total Users" value={platformStats.totalUsers} color="emerald" />
          </div>
        </div>
      )}

      {/* ── Admin profile strip ── */}
      <div className="border-t border-slate-800/60 p-2 flex-shrink-0">
        <div
          className={`flex items-center gap-2.5 px-2 py-2 rounded-lg ${
            collapsed ? "justify-center" : ""
          }`}
        >
          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {admin?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          {!collapsed && (
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium text-slate-200 truncate">
                  {admin?.name || "Admin"}
                </p>
                <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20 flex-shrink-0">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate">
                {admin?.email || ""}
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
