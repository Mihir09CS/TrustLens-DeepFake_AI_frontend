import React from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Github,
  Twitter,
  Linkedin,
  ExternalLink,
  Heart,
  Zap,
} from "lucide-react";

// ── System status pill ──
function StatusPill({ label, status = "online" }) {
  const colors = {
    online: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    degraded: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    offline: "bg-red-500/15 text-red-400 border-red-500/25",
  };
  const dots = {
    online: "bg-emerald-400",
    degraded: "bg-amber-400 animate-pulse",
    offline: "bg-red-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${colors[status]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`} />
      {label}
    </span>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Platform: [
      { label: "Scanner", to: "/scanner" },
      { label: "Bulk Analyzer", to: "/scanner/bulk" },
      { label: "Scan History", to: "/history" },
      { label: "Dashboard", to: "/dashboard" },
    ],
    Intelligence: [
      { label: "Image Detection", to: "/scanner" },
      { label: "Audio Detection", to: "/scanner" },
      { label: "Video Detection", to: "/scanner" },
      { label: "Threat Scoring", to: "/scanner" },
    ],
    Company: [
      { label: "About", to: "/" },
      { label: "Privacy Policy", to: "/" },
      { label: "Terms of Service", to: "/" },
      { label: "Contact", to: "/" },
    ],
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      {/* ── Main footer grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand block */}
          <div className="lg:col-span-2 space-y-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 w-fit group">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center group-hover:border-cyan-400/60 transition-all">
                <Shield size={17} className="text-cyan-400" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-white font-bold text-base">
                  Trust<span className="text-cyan-400">Lens</span>
                </span>
                <span className="text-slate-500 text-[9px] tracking-widest uppercase">
                  Threat Intelligence
                </span>
              </div>
            </Link>

            {/* Tagline */}
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Multi-modal deepfake detection and forensic intelligence platform.
              Verify the authenticity of digital media with AI-powered analysis.
            </p>

            {/* System status */}
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-widest mb-2 font-medium">
                System Status
              </p>
              <div className="flex flex-wrap gap-1.5">
                <StatusPill label="AI Engine" status="online" />
                <StatusPill label="Audio Model" status="online" />
                <StatusPill label="Image Model" status="online" />
                <StatusPill label="Video Model" status="online" />
              </div>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-2 pt-1">
              {[
                { icon: <Github size={15} />, href: "#", label: "GitHub" },
                { icon: <Twitter size={15} />, href: "#", label: "Twitter" },
                { icon: <Linkedin size={15} />, href: "#", label: "LinkedIn" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-white text-xs font-semibold uppercase tracking-widest mb-3">
                {group}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-slate-400 hover:text-cyan-400 text-sm transition-colors flex items-center gap-1 group"
                    >
                      {link.label}
                      <ExternalLink
                        size={10}
                        className="opacity-0 group-hover:opacity-60 transition-opacity"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-xs flex items-center gap-1.5">
            © {currentYear} TrustLens. Built with
            <Heart size={11} className="text-red-400 fill-red-400" />
            for digital trust.
          </p>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <Zap size={11} className="text-cyan-500" />
            <span>
              Powered by{" "}
              <span className="text-cyan-500 font-medium">
                Multi-Modal AI Inference
              </span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
