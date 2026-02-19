import React, { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Pill({ label, ok }) {
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs ${ok ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400" : "border-red-500/25 bg-red-500/10 text-red-400"}`}>
      {label}
    </span>
  );
}

export default function AdminSystem() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [health, setHealth] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`);
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Health check failed");
        setHealth(body.data);
      } catch (err) {
        setError(err.message || "Health check failed");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="flex items-center gap-2 text-slate-400"><Loader2 size={16} className="animate-spin" />Loading health...</p>;
  if (error) return <p className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"><AlertCircle size={16} />{error}</p>;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-white">System Health</h1>
      <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Pill label={`Database: ${health?.database || "unknown"}`} ok={health?.database === "connected"} />
          <Pill label={`AI Service: ${health?.aiService || "unknown"}`} ok={health?.aiService === "reachable"} />
        </div>
        <p className="text-sm text-slate-400">Status: {health?.status || "unknown"}</p>
        <p className="text-sm text-slate-400">Uptime: {health?.uptimeSeconds ?? 0}s</p>
      </div>
    </section>
  );
}
