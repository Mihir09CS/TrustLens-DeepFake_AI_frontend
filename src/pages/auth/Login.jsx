import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  Chrome,
} from "lucide-react";

// ==================== API BASE ====================
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function loadGoogleIdentityScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google);
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(window.google), {
        once: true,
      });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity script"));
    document.head.appendChild(script);
  });
}

// ==================== SMALL COMPONENTS ====================

// Input field wrapper
function InputField({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  rightElement,
  error,
  disabled,
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-slate-400 uppercase tracking-widest"
      >
        {label}
      </label>
      <div className="relative">
        {/* Left icon */}
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full bg-slate-800/60 border rounded-lg py-2.5 text-sm text-slate-200 placeholder-slate-600 transition-all duration-150 outline-none
            ${icon ? "pl-10" : "pl-4"}
            ${rightElement ? "pr-10" : "pr-4"}
            ${
              error
                ? "border-red-500/60 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                : "border-slate-700 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/15"
            }
            disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        {/* Right element */}
        {rightElement && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </span>
        )}
      </div>
      {/* Inline error */}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}

// Alert banner
function AlertBanner({ message, type = "error" }) {
  if (!message) return null;
  const styles = {
    error: "bg-red-500/10 border-red-500/25 text-red-400",
    success: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400",
  };
  return (
    <div
      className={`flex items-start gap-2.5 px-4 py-3 rounded-lg border text-sm ${styles[type]}`}
    >
      <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

// Divider
function OrDivider() {
  return (
    <div className="relative flex items-center gap-3">
      <div className="flex-grow border-t border-slate-800" />
      <span className="text-xs text-slate-600 font-medium flex-shrink-0">
        OR CONTINUE WITH
      </span>
      <div className="flex-grow border-t border-slate-800" />
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
export default function Login({ forcedMode = null }) {
  const navigate = useNavigate();
  const googleInitializedRef = useRef(false);
  const googleTokenClientRef = useRef(null);
  const normalizedForcedMode =
    forcedMode === "admin" || forcedMode === "user" ? forcedMode : null;

  // ── Form state ──
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loginMode, setLoginMode] = useState(normalizedForcedMode || "user");

  useEffect(() => {
    setLoginMode(normalizedForcedMode || "user");
  }, [normalizedForcedMode]);

  const isAdminMode = loginMode === "admin";

  // ── Handle input change ──
  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear field error on type
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (error) setError("");
  };

  // ── Client-side validation ──
  const validate = () => {
    const errs = {};
    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Enter a valid email address";
    }
    if (!form.password) {
      errs.password = "Password is required";
    } else if (form.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    return errs;
  };

  // ── Save auth data helper ──
  const saveAuthData = ({ token, user }) => {
    localStorage.setItem("sentinel_token", token);
    localStorage.setItem("sentinel_role", user.role);
    localStorage.setItem("sentinel_user", JSON.stringify(user));
  };

  const completeLoginWithToken = async (token, options = {}) => {
    const { requireAdmin = false } = options;
    const meRes = await fetch(`${API_BASE}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const meData = await meRes.json();

    if (!meRes.ok || !meData?.data?.user) {
      throw new Error(
        meData?.error || meData?.message || "Failed to fetch user profile.",
      );
    }

    const user = meData.data.user;
    if (requireAdmin && user.role !== "admin") {
      throw new Error("This account does not have admin access.");
    }
    saveAuthData({ token, user });

    if (user.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  // ── Submit handler ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const endpoint = isAdminMode ? "/api/admin/login" : "/api/auth/login";
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || "Login failed. Please try again.");
        return;
      }

      const token = data?.data?.token || data?.token;
      if (!token) {
        setError("Invalid login response from server.");
        return;
      }

      await completeLoginWithToken(token, { requireAdmin: isAdminMode });
    } catch (err) {
      setError(
        err?.message || "Network error. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth handler ──
  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);

    if (!GOOGLE_CLIENT_ID) {
      setError("Google login is not configured. Missing VITE_GOOGLE_CLIENT_ID.");
      setGoogleLoading(false);
      return;
    }

    try {
      const google = await loadGoogleIdentityScript();
      if (!google?.accounts?.oauth2) {
        throw new Error("Google Identity API unavailable.");
      }

      if (!googleInitializedRef.current) {
        googleTokenClientRef.current = google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: "openid email profile",
          callback: async (response) => {
            try {
              if (response?.error) {
                throw new Error(response.error);
              }

              const oauthToken = response?.access_token;
              if (!oauthToken) {
                throw new Error("Google did not return a valid token.");
              }

              const authRes = await fetch(`${API_BASE}/api/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: oauthToken }),
              });
              const authData = await authRes.json();

              if (!authRes.ok) {
                throw new Error(
                  authData?.error ||
                    authData?.message ||
                    "Google authentication failed.",
                );
              }

              const appToken = authData?.data?.token || authData?.token;
              if (!appToken) {
                throw new Error("Invalid token received from backend.");
              }

              await completeLoginWithToken(appToken, {
                requireAdmin: isAdminMode,
              });
            } catch (callbackErr) {
              setError(
                callbackErr?.message ||
                  "Google sign-in failed. Please try again.",
              );
            } finally {
              setGoogleLoading(false);
            }
          },
          error_callback: () => {
            setGoogleLoading(false);
            setError("Google popup was closed or blocked.");
          },
        });
        googleInitializedRef.current = true;
      }

      googleTokenClientRef.current.requestAccessToken({ prompt: "select_account" });
    } catch (err) {
      setError(err?.message || "Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  const isSubmitDisabled = loading || googleLoading;

  return (
    <div className="w-full space-y-6">
      {/* ── Header ── */}
      <div className="text-center space-y-2">
        {/* Logo mark */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Shield size={24} className="text-cyan-400" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white tracking-tight">
          {isAdminMode ? "Admin login" : "Welcome back"}
        </h1>
        <p className="text-slate-400 text-sm">
          {isAdminMode ? (
            "Sign in to access moderation and admin console."
          ) : (
            <>
              Sign in to your{" "}
              <span className="text-cyan-400 font-medium">TrustLens</span>{" "}
              account
            </>
          )}
        </p>
      </div>


      {/* ── Alert banner ── */}
      <AlertBanner message={error} type="error" />

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <InputField
          label="Email Address"
          id="email"
          type="email"
          value={form.email}
          onChange={handleChange("email")}
          placeholder="analyst@trustlens.com"
          icon={<Mail size={15} />}
          error={fieldErrors.email}
          disabled={isSubmitDisabled}
        />

        <InputField
          label="Password"
          id="password"
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={handleChange("password")}
          placeholder="••••••••"
          icon={<Lock size={15} />}
          error={fieldErrors.password}
          disabled={isSubmitDisabled}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="text-slate-500 hover:text-slate-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />

        {/* Forgot password */}
        <div className="flex justify-end">
          <Link
            to="/auth/forgot-password"
            className="text-xs text-slate-500 hover:text-cyan-400 transition-colors"
          >
            Forgot your password?
          </Link>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/40 disabled:cursor-not-allowed text-slate-900 font-semibold text-sm rounded-lg transition-all duration-150 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Authenticating...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <>
        {/* ── Divider ── */}
        <OrDivider />

        {/* ── Google OAuth button ── */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={isSubmitDisabled}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 hover:border-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-all duration-150"
        >
          {googleLoading ? (
            <Loader2 size={16} className="animate-spin text-slate-400" />
          ) : (
            <Chrome size={16} className="text-slate-400" />
          )}
          {isAdminMode ? "Continue with Google (Admin)" : "Continue with Google"}
        </button>
      </>

      {/* ── Register link ── */}
      <p className="text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <Link
          to="/auth/register"
          className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
        >
          Create account
        </Link>
      </p>

      {/* ── Security note ── */}
      <div className="flex items-center justify-center gap-1.5 pt-1">
        <Shield size={11} className="text-slate-600" />
        <span className="text-[11px] text-slate-600">
          Protected by JWT authentication
        </span>
      </div>
    </div>
  );
}
