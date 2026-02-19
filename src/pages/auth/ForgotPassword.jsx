import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

// ==================== API BASE ====================
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
            ${icon ? "pl-10" : "pl-4"} pr-4
            ${
              error
                ? "border-red-500/60 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                : "border-slate-700 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/15"
            }
            disabled:opacity-50 disabled:cursor-not-allowed`}
        />
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

// ==================== SUCCESS STATE ====================
function SuccessState({ email, onResend, resendLoading, resendCooldown }) {
  return (
    <div className="text-center space-y-5">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <Mail size={30} className="text-emerald-400" />
        </div>
      </div>

      {/* Text */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-white">Check your email</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          We sent a password reset link to
        </p>
        <p className="text-cyan-400 font-semibold text-sm break-all">{email}</p>
        <p className="text-slate-500 text-xs leading-relaxed pt-1">
          Click the link in the email to reset your password.
          <br />
          The link expires in{" "}
          <span className="text-slate-400 font-medium">15 minutes</span>.
        </p>
      </div>

      {/* Steps */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-left space-y-2.5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          What to do next
        </p>
        {[
          "Open your email inbox",
          "Look for an email from TrustLens",
          'Click "Reset Password" in the email',
          "Create your new secure password",
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 text-[10px] font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <span className="text-xs text-slate-400">{step}</span>
          </div>
        ))}
      </div>

      {/* Resend */}
      <div className="space-y-3">
        <p className="text-xs text-slate-500">Didn't receive the email?</p>
        <button
          onClick={onResend}
          disabled={resendLoading || resendCooldown > 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 hover:border-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-all duration-150"
        >
          {resendLoading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Sending...
            </>
          ) : resendCooldown > 0 ? (
            `Resend in ${resendCooldown}s`
          ) : (
            <>
              <Mail size={14} />
              Resend email
            </>
          )}
        </button>
      </div>

      {/* Back to login */}
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

// ==================== MAIN COMPONENT ====================
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");

  // ── Cooldown timer ──
  const startCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ── Validate ──
  const validate = () => {
    if (!email.trim()) return "Email address is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Enter a valid email address";
    return "";
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const err = validate();
    if (err) {
      setFieldError(err);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong. Please try again.");
        return;
      }

      // Show success state
      setSubmitted(true);
      startCooldown();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend ──
  const handleResend = async () => {
    setResendLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to resend. Please try again.");
        return;
      }

      startCooldown();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  // ── Show success state ──
  if (submitted) {
    return (
      <SuccessState
        email={email}
        onResend={handleResend}
        resendLoading={resendLoading}
        resendCooldown={resendCooldown}
      />
    );
  }

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
          Forgot password?
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          No worries. Enter your email and we'll send you a reset link.
        </p>
      </div>

      {/* ── Alert ── */}
      <AlertBanner message={error} type="error" />

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <InputField
          label="Email Address"
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldError) setFieldError("");
            if (error) setError("");
          }}
          placeholder="analyst@trustlens.com"
          icon={<Mail size={15} />}
          error={fieldError}
          disabled={loading}
        />

        {/* Info note */}
        <div className="flex items-start gap-2.5 px-3.5 py-2.5 bg-slate-800/40 border border-slate-700/50 rounded-lg">
          <AlertCircle
            size={13}
            className="text-slate-500 flex-shrink-0 mt-0.5"
          />
          <p className="text-xs text-slate-500 leading-relaxed">
            We'll send a secure reset link to this email. The link expires in{" "}
            <span className="text-slate-400">15 minutes</span>.
          </p>
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
              Sending reset link...
            </>
          ) : (
            <>
              Send Reset Link
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
          Reset links are single-use and expire automatically
        </span>
      </div>
    </div>
  );
}
