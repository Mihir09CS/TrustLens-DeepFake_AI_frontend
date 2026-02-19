import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Check,
  X,
  ShieldAlert,
} from "lucide-react";

// ==================== API BASE ====================
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ==================== PASSWORD STRENGTH ====================
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", color: "", checks: {} };

  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

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
    <div className="space-y-2 mt-2">
      {/* Bar */}
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

      {/* Checklist */}
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

// ==================== INVALID TOKEN STATE ====================
function InvalidTokenState() {
  return (
    <div className="text-center space-y-5">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <ShieldAlert size={30} className="text-red-400" />
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-white">Link expired</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          This password reset link is invalid or has expired.
          <br />
          Reset links are only valid for{" "}
          <span className="text-slate-300 font-medium">15 minutes</span>.
        </p>
      </div>
      <Link
        to="/auth/forgot-password"
        className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold text-sm rounded-lg transition-all"
      >
        Request new reset link
        <ArrowRight size={15} />
      </Link>
      <Link
        to="/auth/login"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to sign in
      </Link>
    </div>
  );
}

// ==================== SUCCESS STATE ====================
function SuccessState({ countdown }) {
  return (
    <div className="text-center space-y-5">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <CheckCircle2 size={30} className="text-emerald-400" />
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-white">Password reset!</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Your password has been successfully updated.
          <br />
          You can now sign in with your new password.
        </p>
      </div>

      {/* Countdown */}
      <div className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg">
        <Loader2 size={13} className="text-cyan-400 animate-spin" />
        <span className="text-xs text-slate-400">
          Redirecting to sign in in{" "}
          <span className="text-cyan-400 font-bold">{countdown}s</span>
        </span>
      </div>

      <Link
        to="/auth/login"
        className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold text-sm rounded-lg transition-all"
      >
        Sign in now
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  // ── State ──
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [pageState, setPageState] = useState("form"); // form | success | invalid
  const [countdown, setCountdown] = useState(5);

  // ── Validate token exists ──
  useEffect(() => {
    if (!token || token.length < 10) {
      setPageState("invalid");
    }
  }, [token]);

  // ── Countdown redirect after success ──
  useEffect(() => {
    if (pageState !== "success") return;
    if (countdown <= 0) {
      navigate("/auth/login", { replace: true });
      return;
    }
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [pageState, countdown, navigate]);

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

    if (!form.password) {
      errs.password = "New password is required";
    } else if (form.password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    }

    if (!form.confirmPassword) {
      errs.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    return errs;
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: form.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Token expired or invalid from backend
        if (
          res.status === 400 &&
          (data.message?.toLowerCase().includes("invalid") ||
            data.message?.toLowerCase().includes("expired"))
        ) {
          setPageState("invalid");
          return;
        }
        setError(data.message || "Failed to reset password. Please try again.");
        return;
      }

      // Success
      setPageState("success");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch =
    form.confirmPassword && form.password === form.confirmPassword;

  // ── Render states ──
  if (pageState === "invalid") return <InvalidTokenState />;
  if (pageState === "success") return <SuccessState countdown={countdown} />;

  return (
    <div className="w-full space-y-6">
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
          Reset password
        </h1>
        <p className="text-slate-400 text-sm">
          Create a strong new password for your{" "}
          <span className="text-cyan-400 font-medium">TrustLens</span> account
        </p>
      </div>

      {/* ── Alert ── */}
      <AlertBanner message={error} type="error" />

      {/* ── Token info strip ── */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-800/40 border border-slate-700/50 rounded-lg">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse flex-shrink-0" />
        <p className="text-xs text-slate-500 font-mono truncate">
          Token:{" "}
          <span className="text-slate-400">
            {token?.slice(0, 8)}...{token?.slice(-6)}
          </span>
        </p>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* New password */}
        <div>
          <InputField
            label="New Password"
            id="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange("password")}
            placeholder="Min. 8 characters"
            icon={<Lock size={15} />}
            error={fieldErrors.password}
            disabled={loading}
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
          <PasswordStrengthBar password={form.password} />
        </div>

        {/* Confirm password */}
        <InputField
          label="Confirm New Password"
          id="confirmPassword"
          type={showConfirm ? "text" : "password"}
          value={form.confirmPassword}
          onChange={handleChange("confirmPassword")}
          placeholder="Re-enter your new password"
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
          disabled={loading}
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

        {/* Security tips */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3.5 space-y-2">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            Password Tips
          </p>
          {[
            "Use a mix of letters, numbers, and symbols",
            "Avoid using personal information",
            "Don't reuse passwords from other sites",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2">
              <Shield
                size={10}
                className="text-slate-600 flex-shrink-0 mt-0.5"
              />
              <span className="text-[11px] text-slate-500">{tip}</span>
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/40 disabled:cursor-not-allowed text-slate-900 font-semibold text-sm rounded-lg transition-all duration-150 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Resetting password...
            </>
          ) : (
            <>
              Reset Password
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* ── Back to login ── */}
      <div className="text-center">
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
      </div>

      {/* ── Security note ── */}
      <div className="flex items-center justify-center gap-1.5">
        <Shield size={11} className="text-slate-600" />
        <span className="text-[11px] text-slate-600">
          This link is single-use and expires after reset
        </span>
      </div>
    </div>
  );
}
