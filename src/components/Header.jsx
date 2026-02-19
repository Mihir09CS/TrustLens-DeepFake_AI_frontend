import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Shield,
  Menu,
  X,
  ChevronDown,
  LogOut,
  History,
  LayoutDashboard,
  ScanLine,
  Bell,
  Settings,
} from "lucide-react";

// ==================== HELPERS ====================
const getUserToken = () => localStorage.getItem("sentinel_token");
const getUserRole = () => localStorage.getItem("sentinel_role");
const getUserData = () => {
  try {
    return JSON.parse(localStorage.getItem("sentinel_user"));
  } catch {
    return null;
  }
};

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const profileRef = useRef(null);

  const token = getUserToken();
  const role = getUserRole();
  const user = getUserData();
  const isLoggedIn = !!token;
  const isAdmin = role === "admin";

  // ── scroll shadow effect ──
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── close profile dropdown on outside click ──
  useEffect(() => {
    const handleOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // ── close mobile menu on route change ──
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMobileOpen(false);
      setProfileOpen(false);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [location.pathname]);

  // ── logout ──
  const handleLogout = () => {
    localStorage.removeItem("sentinel_token");
    localStorage.removeItem("sentinel_role");
    localStorage.removeItem("sentinel_user");
    navigate("/");
  };

  // ── nav links (only shown when logged in) ──
  const navLinks = [
    {
      label: "Dashboard",
      to: "/dashboard",
      icon: <LayoutDashboard size={15} />,
    },
    {
      label: "Scanner",
      to: "/scanner",
      icon: <ScanLine size={15} />,
    },
    {
      label: "History",
      to: "/history",
      icon: <History size={15} />,
    },
  ];

  const publicNavLinks = [
    { label: "Home", to: "/" },
    { label: "Deepfake Detection Tools", to: "/scanner" },
    { label: "About", to: "/#about" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-slate-900/95 backdrop-blur-md shadow-lg shadow-black/20 border-b border-slate-700/50"
          : "bg-slate-900 border-b border-slate-800"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ── LOGO ── */}
          <Link
            to={isLoggedIn ? "/dashboard" : "/"}
            className="flex items-center gap-2.5 group flex-shrink-0"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center group-hover:border-cyan-400/60 group-hover:bg-cyan-500/20 transition-all duration-200">
                <Shield size={18} className="text-cyan-400" />
              </div>
              {/* pulse dot */}
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-white font-bold text-base tracking-wide">
                TrustLens
                <span className="text-cyan-400">AI</span>
              </span>
              <span className="text-slate-500 text-[9px] tracking-widest uppercase font-medium">
                Threat Intelligence
              </span>
            </div>
          </Link>

          {/* ── DESKTOP NAV (logged in only) ── */}
          {isLoggedIn ? (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive(link.to)
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all duration-150"
                >
                  <Settings size={15} />
                  Admin
                </Link>
              )}
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-1">
              {publicNavLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all duration-150"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* ── RIGHT SIDE ── */}
          <div className="flex items-center gap-2">
            {/* Not logged in → show auth buttons */}
            {!isLoggedIn && (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/auth/login"
                  className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/auth/register"
                  className="px-4 py-1.5 text-sm font-medium bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Logged in → notification bell + profile dropdown */}
            {isLoggedIn && (
              <>
                {/* Notification Bell (decorative / future) */}
                <button className="hidden sm:flex relative w-8 h-8 rounded-lg border border-slate-700 items-center justify-center text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all">
                  <Bell size={15} />
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                </button>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen((prev) => !prev)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 hover:bg-slate-800 transition-all"
                  >
                    {/* Avatar */}
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="hidden sm:block max-w-[180px] text-left">
                      <p className="truncate text-sm text-slate-300">
                        {user?.name || "User"}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">
                        {user?.email || "No email"}
                      </p>
                    </div>
                    <ChevronDown
                      size={13}
                      className={`text-slate-500 transition-transform duration-200 ${
                        profileOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-xl shadow-black/30 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-slate-700">
                        <p className="text-sm font-medium text-white truncate">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {user?.email || ""}
                        </p>
                        {/* Role badge */}
                        <span
                          className={`inline-flex items-center mt-1.5 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${
                            isAdmin
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                              : "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25"
                          }`}
                        >
                          {isAdmin ? "ADMIN" : "USER"}
                        </span>
                      </div>

                      {/* Menu items */}
                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
                        >
                          <LayoutDashboard
                            size={14}
                            className="text-slate-400"
                          />
                          Dashboard
                        </Link>
                        <Link
                          to="/scanner"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
                        >
                          <ScanLine size={14} className="text-slate-400" />
                          New Scan
                        </Link>
                        <Link
                          to="/history"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
                        >
                          <History size={14} className="text-slate-400" />
                          Scan History
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                          >
                            <Settings size={14} />
                            Admin Console
                          </Link>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-slate-700 py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── MOBILE MENU TOGGLE ── */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all"
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE MENU ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/98 backdrop-blur-md">
          <div className="px-4 py-3 space-y-1">
            {isLoggedIn ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.to)
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-400 hover:bg-amber-500/10"
                  >
                    <Settings size={15} />
                    Admin Console
                  </Link>
                )}
                <div className="pt-2 border-t border-slate-800 mt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 py-2">
                {publicNavLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="px-4 py-2.5 text-sm text-center font-medium text-slate-300 border border-slate-700 rounded-lg hover:border-slate-600 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/auth/login"
                  className="px-4 py-2.5 text-sm text-center font-medium text-slate-300 border border-slate-700 rounded-lg hover:border-slate-600 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/auth/register"
                  className="px-4 py-2.5 text-sm text-center font-medium bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
