import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  AlertCircle,
  Loader2,
  Chrome,
  CheckCircle2,
  Check,
  X,
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

// ==================== PASSWORD STRENGTH ====================
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", color: "" };

  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
  };

  score = Object.values(checks).filter(Boolean).length;

  const levels = [
    { score: 0, label: "", color: "" },
    { score: 1, label: "Very Weak", color: "bg-red-500" },
    { score: 2, label: "Weak", color: "bg-orange-500" },
    { score: 3, label: "Fair", color: "bg-amber-500" },
    { score: 4, label: "Strong", color: "bg-cyan-500" },
    { score: 5, label: "Very Strong", color: "bg-emerald-500" },
  ];

  return { ...levels[score], score, checks };
};

// ==================== SMALL COMPONENTS ====================

// Input field
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
  hint,
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
        {rightElement && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </span>
        )}
      </div>
      {hint && !error && <p className="text-[11px] text-slate-600">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}

// Password strength bar
function PasswordStrengthBar({ password }) {
  const { score, label, color, checks } = getPasswordStrength(password);
  if (!password) return null;

  const requirementList = [
    { key: "length", label: "At least 8 characters" },
    { key: "lowercase", label: "Lowercase letter" },
    { key: "uppercase", label: "Uppercase letter" },
    { key: "number", label: "Number" },
    { key: "special", label: "Special character" },
  ];

  return (
    <div className="space-y-2 mt-1">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-grow flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= score ? color : "bg-slate-800"
              }`}
            />
          ))}
        </div>
        {label && (
          <span
            className={`text-[10px] font-semibold flex-shrink-0 ${
              score <= 2
                ? "text-red-400"
                : score === 3
                  ? "text-amber-400"
                  : score === 4
                    ? "text-cyan-400"
                    : "text-emerald-400"
            }`}
          >
            {label}
          </span>
        )}
      </div>

      {/* Requirements checklist */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        {requirementList.map((req) => (
          <div key={req.key} className="flex items-center gap-1.5">
            {checks[req.key] ? (
              <Check size={10} className="text-emerald-400 flex-shrink-0" />
            ) : (
              <X size={10} className="text-slate-600 flex-shrink-0" />
            )}
            <span
              className={`text-[10px] ${
                checks[req.key] ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {req.label}
            </span>
          </div>
        ))}
      </div>
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
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div
      className={`flex items-start gap-2.5 px-4 py-3 rounded-lg border text-sm ${styles[type]}`}
    >
      <Icon size={15} className="flex-shrink-0 mt-0.5" />
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
export default function Register() {
  const navigate = useNavigate();
  const googleInitializedRef = useRef(false);
  const googleTokenClientRef = useRef(null);

  // ── Form state ──
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [agreed, setAgreed] = useState(false);

  // ── Handle input ──
  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (error) setError("");
  };

  // ── Validate ──
  const validate = () => {
    const errs = {};

    if (!form.name.trim()) {
      errs.name = "Full name is required";
    } else if (form.name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters";
    }

    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Enter a valid email address";
    }

    if (!form.password) {
      errs.password = "Password is required";
    } else if (form.password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    }

    if (!form.confirmPassword) {
      errs.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    if (!agreed) {
      errs.terms = "You must agree to the terms";
    }

    return errs;
  };

  // ── Save auth data ──
  const saveAuthData = (data) => {
    localStorage.setItem("sentinel_token", data.token);
    localStorage.setItem("sentinel_role", data.user.role);
    localStorage.setItem("sentinel_user", JSON.stringify(data.user));
  };

  const completeLoginWithToken = async (token) => {
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
    localStorage.setItem("sentinel_token", token);
    localStorage.setItem("sentinel_role", user.role);
    localStorage.setItem("sentinel_user", JSON.stringify(user));

    if (user.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed. Please try again.");
        return;
      }

      // If backend auto-logs in on register
      if (data.token) {
        saveAuthData(data);
        setSuccess("Account created! Redirecting to dashboard...");
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1200);
      } else {
        // If backend requires email verification
        setSuccess(
          data.message ||
            "Account created! Please check your email to verify your account.",
        );
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth ──
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

              await completeLoginWithToken(appToken);
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

  const passwordsMatch =
    form.confirmPassword && form.password === form.confirmPassword;
  const isSubmitDisabled = loading || googleLoading;

  return (
    <div className="w-full space-y-5">
      {/* ── Header ── */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Shield size={24} className="text-cyan-400" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Create account
        </h1>
        <p className="text-slate-400 text-sm">
          Join <span className="text-cyan-400 font-medium">TrustLens</span> and
          start detecting threats
        </p>
      </div>

      {/* ── Alerts ── */}
      <AlertBanner message={error} type="error" />
      <AlertBanner message={success} type="success" />

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Full name */}
        <InputField
          label="Full Name"
          id="name"
          type="text"
          value={form.name}
          onChange={handleChange("name")}
          placeholder="Jane Analyst"
          icon={<User size={15} />}
          error={fieldErrors.name}
          disabled={isSubmitDisabled}
        />

        {/* Email */}
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

        {/* Password */}
        <div>
          <InputField
            label="Password"
            id="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange("password")}
            placeholder="Min. 8 characters"
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
          {/* Strength indicator */}
          <PasswordStrengthBar password={form.password} />
        </div>

        {/* Confirm password */}
        <InputField
          label="Confirm Password"
          id="confirmPassword"
          type={showConfirm ? "text" : "password"}
          value={form.confirmPassword}
          onChange={handleChange("confirmPassword")}
          placeholder="Re-enter your password"
          icon={
            form.confirmPassword ? (
              passwordsMatch ? (
                <CheckCircle2 size={15} className="text-emerald-400" />
              ) : (
                <AlertCircle size={15} className="text-red-400" />
              )
            ) : (
              <Lock size={15} />
            )
          }
          error={fieldErrors.confirmPassword}
          disabled={isSubmitDisabled}
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="text-slate-500 hover:text-slate-300 transition-colors"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />

        {/* Terms checkbox */}
        <div className="space-y-1">
          <label className="flex items-start gap-2.5 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  if (fieldErrors.terms) {
                    setFieldErrors((prev) => ({ ...prev, terms: "" }));
                  }
                }}
                disabled={isSubmitDisabled}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                  agreed
                    ? "bg-cyan-500 border-cyan-500"
                    : "bg-transparent border-slate-600 group-hover:border-slate-500"
                }`}
              >
                {agreed && <Check size={10} className="text-slate-900" />}
              </div>
            </div>
            <span className="text-xs text-slate-400 leading-relaxed">
              I agree to the{" "}
              <span className="text-cyan-400 hover:text-cyan-300 cursor-pointer transition-colors">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-cyan-400 hover:text-cyan-300 cursor-pointer transition-colors">
                Privacy Policy
              </span>
            </span>
          </label>
          {fieldErrors.terms && (
            <p className="flex items-center gap-1.5 text-xs text-red-400 pl-6">
              <AlertCircle size={11} />
              {fieldErrors.terms}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/40 disabled:cursor-not-allowed text-slate-900 font-semibold text-sm rounded-lg transition-all duration-150 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create Account
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* ── Divider ── */}
      <OrDivider />

      {/* ── Google button ── */}
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
        Continue with Google
      </button>

      {/* ── Login link ── */}
      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          to="/auth/login"
          className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>

      {/* ── Security note ── */}
      <div className="flex items-center justify-center gap-1.5">
        <Shield size={11} className="text-slate-600" />
        <span className="text-[11px] text-slate-600">
          Your data is encrypted and never shared
        </span>
      </div>
    </div>
  );
}
