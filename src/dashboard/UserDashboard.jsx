import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  ScanLine,
  History,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Clock,
  Image,
  Mic,
  Video,
  Loader2,
  Zap,
  Target,
  Eye,
  ShieldAlert,
  BarChart3,
  RefreshCw,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

// ==================== API BASE ====================
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const getToken = () => localStorage.getItem("sentinel_token");

const FAQ_ITEMS = [
  {
    q: "What does High Risk mean?",
    a: "High Risk means the model found strong synthetic manipulation signals. Treat the media as suspicious and verify with trusted sources before sharing.",
  },
  {
    q: "Why can a scan fail?",
    a: "Common causes are unsupported URLs, blocked/private links, invalid media format, or AI service timeout. Try direct media links or upload files.",
  },
  {
    q: "How is Threat Score calculated?",
    a: "Threat Score is derived from model confidence and modality signals, then mapped to risk bands: Low, Medium, and High.",
  },
  {
    q: "Does TrustLens store my scans?",
    a: "Yes. Scan results are logged for dashboard analytics and forensic history so you can track trends over time.",
  },
];

// ==================== 3D TILT HOOK ====================
function useTilt(ref, intensity = 10) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -intensity;
      const rotateY = ((x - centerX) / centerX) * intensity;

      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    const handleLeave = () => {
      el.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    };

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [ref, intensity]);
}

// ==================== 3D TILT CARD WRAPPER ====================
function TiltCard({ children, className = "", intensity = 8 }) {
  const ref = useRef(null);
  useTilt(ref, intensity);

  return (
    <div
      ref={ref}
      className={`transition-transform duration-200 ease-out ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}

// ==================== ANIMATED COUNTER ====================
function AnimatedCount({ target, duration = 1500, prefix = "", suffix = "" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) {
      const timeoutId = window.setTimeout(() => setCount(0), 0);
      return () => window.clearTimeout(timeoutId);
    }

    const resetId = window.setTimeout(() => setCount(0), 0);
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => {
      window.clearTimeout(resetId);
      clearInterval(timer);
    };
  }, [target, duration]);

  return (
    <span className="font-mono">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ==================== FLOATING PARTICLE BG ====================
function ParticleBG() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const generated = Array.from({ length: 30 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: `${6 + Math.random() * 8}s`,
      delay: `${Math.random() * 5}s`,
      width: `${1 + Math.random() * 2}px`,
      height: `${1 + Math.random() * 2}px`,
    }));
    const timerId = window.setTimeout(() => setParticles(generated), 0);
    return () => window.clearTimeout(timerId);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute w-px h-px bg-cyan-400 rounded-full opacity-30"
          style={{
            left: p.left,
            top: p.top,
            animation: `floatParticle ${p.duration} ease-in-out infinite ${p.delay}`,
            width: p.width,
            height: p.height,
          }}
        />
      ))}
    </div>
  );
}

// ==================== 3D THREAT GAUGE ====================
function ThreatGauge3D({ score = 0, size = 160 }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 300);
    return () => clearTimeout(timer);
  }, [progress]);

  const getColor = () => {
    if (score >= 70)
      return {
        stroke: "#ef4444",
        glow: "0 0 30px rgba(239,68,68,0.4)",
        label: "HIGH RISK",
        text: "text-red-400",
        bg: "from-red-500/20",
      };
    if (score >= 40)
      return {
        stroke: "#f59e0b",
        glow: "0 0 30px rgba(245,158,11,0.4)",
        label: "MEDIUM RISK",
        text: "text-amber-400",
        bg: "from-amber-500/20",
      };
    return {
      stroke: "#10b981",
      glow: "0 0 30px rgba(16,185,129,0.4)",
      label: "LOW RISK",
      text: "text-emerald-400",
      bg: "from-emerald-500/20",
    };
  };

  const c = getColor();

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: size,
        height: size,
        perspective: "600px",
      }}
    >
      {/* 3D shadow underneath */}
      <div
        className="absolute inset-4 rounded-full opacity-40 blur-xl"
        style={{ background: c.stroke }}
      />

      {/* SVG ring */}
      <svg
        width={size}
        height={size}
        className="absolute top-0 left-0"
        style={{
          transform: "rotateX(15deg)",
          filter: `drop-shadow(${c.glow})`,
        }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth="8"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={c.stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - animatedProgress}
          className="transition-all duration-1000 ease-out"
          style={{
            transformOrigin: "center",
            transform: "rotate(-90deg)",
          }}
        />
        {/* Glow overlay */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={c.stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - animatedProgress}
          opacity="0.3"
          className="transition-all duration-1000 ease-out blur-sm"
          style={{
            transformOrigin: "center",
            transform: "rotate(-90deg)",
          }}
        />
      </svg>

      {/* Center content */}
      <div
        className="relative z-10 text-center"
        style={{ transform: "translateZ(20px)" }}
      >
        <p className={`text-3xl font-black font-mono ${c.text}`}>
          <AnimatedCount target={score} />
        </p>
        <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-semibold mt-0.5">
          Threat Score
        </p>
        <span
          className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[8px] font-bold tracking-widest ${c.text} border`}
          style={{
            borderColor: `${c.stroke}40`,
            backgroundColor: `${c.stroke}15`,
          }}
        >
          {c.label}
        </span>
      </div>
    </div>
  );
}

// ==================== 3D STAT CARD ====================
function StatCard3D({
  icon,
  label,
  value,
  trend,
  trendUp,
  color = "cyan",
  subtitle,
}) {
  const colors = {
    cyan: {
      icon: "text-cyan-400",
      iconBg: "bg-cyan-500/10 border-cyan-500/25",
      glow: "shadow-cyan-500/5",
      gradient: "from-cyan-500/5 via-transparent to-transparent",
    },
    red: {
      icon: "text-red-400",
      iconBg: "bg-red-500/10 border-red-500/25",
      glow: "shadow-red-500/5",
      gradient: "from-red-500/5 via-transparent to-transparent",
    },
    amber: {
      icon: "text-amber-400",
      iconBg: "bg-amber-500/10 border-amber-500/25",
      glow: "shadow-amber-500/5",
      gradient: "from-amber-500/5 via-transparent to-transparent",
    },
    emerald: {
      icon: "text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/25",
      glow: "shadow-emerald-500/5",
      gradient: "from-emerald-500/5 via-transparent to-transparent",
    },
  };

  const c = colors[color];

  return (
    <TiltCard intensity={6}>
      <div
        className={`relative overflow-hidden bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm ${c.glow} shadow-xl`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Background gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-60 pointer-events-none`}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div
          className="relative z-10 space-y-3"
          style={{ transform: "translateZ(15px)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div
              className={`w-10 h-10 rounded-xl ${c.iconBg} border flex items-center justify-center`}
            >
              {icon}
            </div>
            {trend !== undefined && (
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  trendUp
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {trendUp ? (
                  <TrendingUp size={10} />
                ) : (
                  <TrendingDown size={10} />
                )}
                {trend}%
              </div>
            )}
          </div>

          {/* Value */}
          <div>
            <p className="text-2xl font-black text-white font-mono">
              <AnimatedCount target={value} />
            </p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{label}</p>
            {subtitle && (
              <p className="text-[10px] text-slate-600 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Corner accent */}
        <div
          className="absolute bottom-0 right-0 w-24 h-24 rounded-tl-[4rem] opacity-5 pointer-events-none"
          style={{
            backgroundColor:
              c.icon === "text-cyan-400"
                ? "#06b6d4"
                : c.icon === "text-red-400"
                  ? "#ef4444"
                  : c.icon === "text-amber-400"
                    ? "#f59e0b"
                    : "#10b981",
          }}
        />
      </div>
    </TiltCard>
  );
}

// ==================== RISK BAR CHART 3D ====================
function RiskBar3D({ label, count, total, color, icon }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(percentage), 300);
    return () => clearTimeout(t);
  }, [percentage]);

  const colors = {
    red: { bar: "bg-red-500", glow: "shadow-red-500/30", text: "text-red-400" },
    amber: {
      bar: "bg-amber-500",
      glow: "shadow-amber-500/30",
      text: "text-amber-400",
    },
    emerald: {
      bar: "bg-emerald-500",
      glow: "shadow-emerald-500/30",
      text: "text-emerald-400",
    },
  };

  const c = colors[color];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={c.text}>{icon}</span>
          <span className="text-xs text-slate-400 font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold font-mono ${c.text}`}>
            {count}
          </span>
          <span className="text-[10px] text-slate-600">
            ({percentage.toFixed(0)}%)
          </span>
        </div>
      </div>
      <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden relative">
        <div
          className={`h-full ${c.bar} rounded-full transition-all duration-1000 ease-out ${c.glow} shadow-lg relative`}
          style={{ width: `${width}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                animation: "shimmer 2s infinite",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== MEDIA TYPE CARD 3D ====================
function MediaTypeCard3D({ type, icon, count, percentage, color }) {
  const colors = {
    cyan: {
      border: "border-cyan-500/20",
      text: "text-cyan-400",
      bg: "bg-cyan-500/10",
      glow: "hover:shadow-cyan-500/10",
    },
    purple: {
      border: "border-purple-500/20",
      text: "text-purple-400",
      bg: "bg-purple-500/10",
      glow: "hover:shadow-purple-500/10",
    },
    pink: {
      border: "border-pink-500/20",
      text: "text-pink-400",
      bg: "bg-pink-500/10",
      glow: "hover:shadow-pink-500/10",
    },
  };

  const c = colors[color];

  return (
    <TiltCard intensity={12}>
      <div
        className={`relative overflow-hidden bg-slate-800/30 ${c.border} border rounded-xl p-4 backdrop-blur-sm ${c.glow} hover:shadow-xl transition-shadow duration-300`}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className="relative z-10 flex flex-col items-center text-center gap-2"
          style={{ transform: "translateZ(10px)" }}
        >
          <div
            className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}
          >
            <span className={c.text}>{icon}</span>
          </div>
          <p className="text-lg font-black font-mono text-white">
            <AnimatedCount target={count} />
          </p>
          <p
            className={`text-[10px] font-semibold uppercase tracking-widest ${c.text}`}
          >
            {type}
          </p>
          <div className="w-full bg-slate-800 rounded-full h-1 mt-1">
            <div
              className={`h-full ${c.bg.replace("/10", "")} rounded-full transition-all duration-1000`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 font-mono">{percentage}%</p>
        </div>
      </div>
    </TiltCard>
  );
}

// ==================== RECENT SCAN ROW ====================
function RecentScanRow({ scan, index }) {
  const riskColors = {
    high: {
      badge: "bg-red-500/15 text-red-400 border-red-500/25",
      dot: "bg-red-400",
    },
    medium: {
      badge: "bg-amber-500/15 text-amber-400 border-amber-500/25",
      dot: "bg-amber-400",
    },
    low: {
      badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
      dot: "bg-emerald-400",
    },
  };

  const typeIcons = {
    image: <Image size={14} />,
    audio: <Mic size={14} />,
    video: <Video size={14} />,
  };

  const risk = riskColors[(scan.riskLevel || "").toLowerCase()] || riskColors.low;
  const delay = index * 100;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 bg-slate-800/20 hover:bg-slate-800/50 border border-slate-700/30 hover:border-slate-700/60 rounded-xl transition-all duration-200 group cursor-pointer"
      style={{
        animation: `fadeSlideUp 0.5s ease-out ${delay}ms both`,
      }}
    >
      {/* Media type icon */}
      <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 transition-colors flex-shrink-0">
        {typeIcons[scan.mediaType] || <ScanLine size={14} />}
      </div>

      {/* Info */}
      <div className="flex-grow min-w-0">
        <p className="text-sm text-slate-200 font-medium truncate">
          {scan.mediaType?.charAt(0).toUpperCase() + scan.mediaType?.slice(1)}{" "}
          Analysis
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <Clock size={10} className="text-slate-600" />
          <span className="text-[10px] text-slate-500">
            {new Date(scan.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Threat score */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold font-mono text-white">
          {scan.threatScore || 0}
        </p>
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${risk.badge}`}
        >
          <span className={`w-1 h-1 rounded-full ${risk.dot}`} />
          {scan.riskLevel?.toUpperCase()}
        </span>
      </div>

      {/* Hover arrow */}
      <ArrowRight
        size={13}
        className="text-slate-600 group-hover:text-cyan-400 transition-colors flex-shrink-0"
      />
    </div>
  );
}

// ==================== QUICK ACTION CARD ====================
function QuickAction3D({ to, icon, label, description, color = "cyan" }) {
  const colors = {
    cyan: {
      border: "border-cyan-500/15 hover:border-cyan-500/40",
      text: "text-cyan-400",
      bg: "bg-cyan-500/10",
      shadow: "hover:shadow-cyan-500/10",
    },
    amber: {
      border: "border-amber-500/15 hover:border-amber-500/40",
      text: "text-amber-400",
      bg: "bg-amber-500/10",
      shadow: "hover:shadow-amber-500/10",
    },
    purple: {
      border: "border-purple-500/15 hover:border-purple-500/40",
      text: "text-purple-400",
      bg: "bg-purple-500/10",
      shadow: "hover:shadow-purple-500/10",
    },
  };

  const c = colors[color];

  return (
    <TiltCard intensity={10}>
      <Link
        to={to}
        className={`relative block overflow-hidden bg-slate-800/30 border ${c.border} rounded-xl p-5 backdrop-blur-sm ${c.shadow} hover:shadow-xl transition-all duration-300 group`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Background accent */}
        <div
          className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none"
          style={{
            backgroundColor:
              color === "cyan"
                ? "#06b6d4"
                : color === "amber"
                  ? "#f59e0b"
                  : "#a855f7",
          }}
        />

        <div
          className="relative z-10 space-y-3"
          style={{ transform: "translateZ(12px)" }}
        >
          <div
            className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border.split(" ")[0]} flex items-center justify-center`}
          >
            <span className={c.text}>{icon}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white group-hover:text-slate-100 transition-colors flex items-center gap-1.5">
              {label}
              <ArrowRight
                size={12}
                className="opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5"
              />
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}

// ==================== SYSTEM HEALTH CARD ====================
function SystemHealthCard({ health }) {
  const models = [
    { key: "audio", label: "Audio Model", icon: <Mic size={13} /> },
    { key: "image", label: "Image Model", icon: <Image size={13} /> },
    { key: "video", label: "Video Model", icon: <Video size={13} /> },
  ];

  return (
    <TiltCard intensity={5}>
      <div className="relative overflow-hidden bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm">
        {/* Grid bg */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(6,182,212,0.3) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-cyan-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">
                System Health
              </span>
            </div>
            <span
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                health?.aiReady
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                  : "bg-red-500/15 text-red-400 border-red-500/25"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${health?.aiReady ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`}
              />
              {health?.aiReady ? "OPERATIONAL" : "DEGRADED"}
            </span>
          </div>

          {/* Models */}
          <div className="space-y-2.5">
            {models.map((m) => {
              const ready = health?.models?.[m.key];
              return (
                <div
                  key={m.key}
                  className="flex items-center justify-between py-1.5 px-3 bg-slate-900/50 rounded-lg border border-slate-800/50"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-500">{m.icon}</span>
                    <span className="text-xs text-slate-400 font-medium">
                      {m.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${ready ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`}
                    />
                    <span
                      className={`text-[10px] font-semibold ${ready ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {ready ? "Ready" : "Offline"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Backend + DB */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-900/40 rounded-lg border border-slate-800/50">
              <span
                className={`w-1.5 h-1.5 rounded-full ${health?.backend ? "bg-emerald-400" : "bg-red-400"}`}
              />
              <span className="text-[10px] text-slate-500">Backend</span>
            </div>
            <div className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-900/40 rounded-lg border border-slate-800/50">
              <span
                className={`w-1.5 h-1.5 rounded-full ${health?.database ? "bg-emerald-400" : "bg-red-400"}`}
              />
              <span className="text-[10px] text-slate-500">Database</span>
            </div>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}

function DashboardFAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <TiltCard intensity={4}>
      <div className="relative overflow-hidden bg-slate-800/35 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle size={16} className="text-cyan-400" />
          <p className="text-sm font-bold text-white">FAQ</p>
        </div>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={item.q}
                className="border border-slate-700/60 rounded-xl bg-slate-900/45 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <span className="text-sm text-slate-200 font-medium">{item.q}</span>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform ${isOpen ? "rotate-180 text-cyan-400" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4">
                    <p className="text-xs text-slate-400 leading-5">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </TiltCard>
  );
}


// ==================== MAIN COMPONENT ====================
export default function UserDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalScans: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
    imageCount: 0,
    audioCount: 0,
    videoCount: 0,
    avgThreatScore: 0,
  });
  const [recentScans, setRecentScans] = useState([]);
  const [health, setHealth] = useState({
    backend: true,
    database: true,
    aiReady: true,
    models: { audio: true, image: true, video: true },
  });

  const normalizeRisk = (risk) => String(risk || "").trim().toLowerCase();
  const normalizeMediaType = (mediaType) =>
    String(mediaType || "").trim().toLowerCase();

  // ── Fetch dashboard data ──
  const fetchDashboard = async (isRefresh = false) => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Fetch scan history for stats
      const scanRes = await fetch(`${API_BASE}/api/scan/history?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (scanRes.ok) {
        const scanData = await scanRes.json();
        const rawScans =
          scanData?.data?.scans || scanData?.scans || scanData?.data || [];
        const scans = Array.isArray(rawScans) ? rawScans : [];

        // Calculate stats
        const totalScans = scans.length;
        const highRisk = scans.filter((s) =>
          normalizeRisk(s.riskLevel).includes("high"),
        ).length;
        const mediumRisk = scans.filter((s) =>
          normalizeRisk(s.riskLevel).includes("medium"),
        ).length;
        const lowRisk = scans.filter((s) =>
          normalizeRisk(s.riskLevel).includes("low"),
        ).length;
        const imageCount = scans.filter(
          (s) => normalizeMediaType(s.mediaType) === "image",
        ).length;
        const audioCount = scans.filter(
          (s) => normalizeMediaType(s.mediaType) === "audio",
        ).length;
        const videoCount = scans.filter(
          (s) => normalizeMediaType(s.mediaType) === "video",
        ).length;
        const avgThreatScore =
          totalScans > 0
            ? Math.round(
                scans.reduce((a, s) => a + (s.threatScore || 0), 0) /
                  totalScans,
              )
            : 0;

        setStats({
          totalScans,
          highRisk,
          mediumRisk,
          lowRisk,
          imageCount,
          audioCount,
          videoCount,
          avgThreatScore,
        });

        // Recent scans (last 5)
        setRecentScans(scans.slice(0, 5));
      }

      // Fetch health
      try {
        const healthRes = await fetch(`${API_BASE}/health`);
        if (healthRes.ok) {
          const hData = await healthRes.json();
          const healthData = hData?.data || {};
          const models = healthData?.aiDetails?.models || {};
          setHealth({
            backend: true,
            database: healthData.database === "connected",
            aiReady: healthData.aiService === "reachable",
            models: {
              audio: !!models.audioModelLoaded,
              image: !!models.imageModelLoaded,
              video: !!models.videoModelLoaded,
            },
          });
        }
      } catch {
        setHealth((prev) => ({ ...prev, backend: false }));
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("sentinel_user"));
    } catch {
      return null;
    }
  })();

  const total = stats.totalScans || 1;

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto">
              <Loader2 size={28} className="text-cyan-400 animate-spin" />
            </div>
            <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-cyan-500/10 animate-ping mx-auto opacity-30" />
          </div>
          <div>
            <p className="text-sm text-slate-300 font-medium">
              Loading Dashboard
            </p>
            <p className="text-xs text-slate-600">
              Fetching threat intelligence...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-6 pb-8">
      {/* ── Particles ── */}
      <ParticleBG />

      {/* ── Shimmer + Float keyframes ── */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes floatParticle {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
          25% { transform: translate(10px, -20px) scale(1.5); opacity: 0.5; }
          50% { transform: translate(-5px, -40px) scale(1); opacity: 0.3; }
          75% { transform: translate(15px, -20px) scale(1.3); opacity: 0.4; }
        }
        @keyframes fadeSlideUp {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(6,182,212,0.1); }
          50% { box-shadow: 0 0 30px rgba(6,182,212,0.2); }
        }
      `}</style>

      {/* ── Welcome header ── */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Welcome back
              {user?.name && (
                <span className="text-cyan-400">
                  , {user.name.split(" ")[0]}
                </span>
              )}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 uppercase tracking-widest">
              Live
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Your threat intelligence overview •{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <button
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-xl text-sm text-slate-300 transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ── Stats grid (Row 1) ── */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard3D
          icon={<ScanLine size={20} className="text-cyan-400" />}
          label="Total Scans"
          value={stats.totalScans}
          color="cyan"
          trend={12}
          trendUp={true}
          subtitle="All-time analysis count"
        />
        <StatCard3D
          icon={<ShieldAlert size={20} className="text-red-400" />}
          label="High Risk"
          value={stats.highRisk}
          color="red"
          trend={8}
          trendUp={false}
          subtitle="Critical threat detections"
        />
        <StatCard3D
          icon={<AlertTriangle size={20} className="text-amber-400" />}
          label="Medium Risk"
          value={stats.mediumRisk}
          color="amber"
          subtitle="Suspicious content found"
        />
        <StatCard3D
          icon={<CheckCircle2 size={20} className="text-emerald-400" />}
          label="Low Risk"
          value={stats.lowRisk}
          color="emerald"
          subtitle="Verified authentic content"
        />
      </div>

      {/* ── Row 2: Threat Gauge + Risk Distribution ── */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 3D Threat Gauge */}
        <TiltCard intensity={5}>
          <div
            className="relative overflow-hidden bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm flex flex-col items-center justify-center min-h-[280px]"
            style={{ animation: "pulseGlow 3s ease-in-out infinite" }}
          >
            {/* Radial bg */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/50 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center gap-4">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.25em]">
                Average Threat Level
              </p>
              <ThreatGauge3D score={stats.avgThreatScore} size={170} />
              <p className="text-xs text-slate-500 text-center max-w-[200px]">
                Based on{" "}
                <span className="text-cyan-400 font-semibold">
                  {stats.totalScans}
                </span>{" "}
                total scans analyzed
              </p>
            </div>
          </div>
        </TiltCard>

        {/* Risk Distribution */}
        <TiltCard intensity={4} className="lg:col-span-2">
          <div className="relative overflow-hidden bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center">
                  <BarChart3 size={15} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    Risk Distribution
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Threat analysis breakdown
                  </p>
                </div>
              </div>
              <Link
                to="/history"
                className="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1"
              >
                View all
                <ArrowRight size={10} />
              </Link>
            </div>

            {/* Bars */}
            <div className="space-y-5">
              <RiskBar3D
                label="High Risk"
                count={stats.highRisk}
                total={total}
                color="red"
                icon={<ShieldAlert size={13} />}
              />
              <RiskBar3D
                label="Medium Risk"
                count={stats.mediumRisk}
                total={total}
                color="amber"
                icon={<AlertTriangle size={13} />}
              />
              <RiskBar3D
                label="Low Risk"
                count={stats.lowRisk}
                total={total}
                color="emerald"
                icon={<CheckCircle2 size={13} />}
              />
            </div>

            {/* Summary pills */}
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-700/50">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/60 rounded-lg border border-slate-800">
                <Target size={11} className="text-cyan-400" />
                <span className="text-[10px] text-slate-400">
                  Detection Rate:{" "}
                  <span className="text-white font-bold font-mono">
                    {stats.totalScans > 0
                      ? (
                          ((stats.highRisk + stats.mediumRisk) /
                            stats.totalScans) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/60 rounded-lg border border-slate-800">
                <Zap size={11} className="text-amber-400" />
                <span className="text-[10px] text-slate-400">
                  Avg Score:{" "}
                  <span className="text-white font-bold font-mono">
                    {stats.avgThreatScore}/100
                  </span>
                </span>
              </div>
            </div>
          </div>
        </TiltCard>
      </div>

      {/* ── Row 3: Media Types ── */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Eye size={15} className="text-cyan-400" />
          <p className="text-sm font-bold text-white">Media Type Breakdown</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MediaTypeCard3D
            type="Image"
            icon={<Image size={20} />}
            count={stats.imageCount}
            percentage={
              stats.totalScans > 0
                ? Math.round((stats.imageCount / stats.totalScans) * 100)
                : 0
            }
            color="cyan"
          />
          <MediaTypeCard3D
            type="Audio"
            icon={<Mic size={20} />}
            count={stats.audioCount}
            percentage={
              stats.totalScans > 0
                ? Math.round((stats.audioCount / stats.totalScans) * 100)
                : 0
            }
            color="purple"
          />
          <MediaTypeCard3D
            type="Video"
            icon={<Video size={20} />}
            count={stats.videoCount}
            percentage={
              stats.totalScans > 0
                ? Math.round((stats.videoCount / stats.totalScans) * 100)
                : 0
            }
            color="pink"
          />
        </div>
      </div>

      {/* ── Row 4: Recent Scans + Quick Actions + Health ── */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Scans */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History size={15} className="text-cyan-400" />
              <p className="text-sm font-bold text-white">Recent Scans</p>
            </div>
            <Link
              to="/history"
              className="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              View all
              <ArrowRight size={10} />
            </Link>
          </div>

          {recentScans.length > 0 ? (
            <div className="space-y-2">
              {recentScans.map((scan, i) => (
                <RecentScanRow key={scan._id || i} scan={scan} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-slate-800/20 border border-slate-700/30 rounded-xl">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-3">
                <ScanLine size={24} className="text-slate-600" />
              </div>
              <p className="text-sm text-slate-400 font-medium">No scans yet</p>
              <p className="text-xs text-slate-600 mt-1">
                Start your first analysis to see results here
              </p>
              <Link
                to="/scanner"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 text-cyan-400 text-xs font-semibold rounded-lg transition-all"
              >
                <ScanLine size={13} />
                Start Scanning
              </Link>
            </div>
          )}
        </div>

        {/* Right column: Actions + Health */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap size={15} className="text-cyan-400" />
              <p className="text-sm font-bold text-white">Quick Actions</p>
            </div>
            <QuickAction3D
              to="/scanner"
              icon={<ScanLine size={18} />}
              label="New Scan"
              description="Analyze image, audio, or video"
              color="cyan"
            />
            <QuickAction3D
              to="/scanner/bulk"
              icon={<Layers size={18} />}
              label="Bulk Analyzer"
              description="Moderate multiple URLs at once"
              color="amber"
            />
            <QuickAction3D
              to="/history"
              icon={<History size={18} />}
              label="Full History"
              description="Browse all forensic scan logs"
              color="purple"
            />
          </div>

          {/* System health */}
          <SystemHealthCard health={health} />
        </div>
      </div>

      {/* FAQ */}
      <div className="relative z-10">
        <DashboardFAQ />
      </div>
    </div>
  );
}
