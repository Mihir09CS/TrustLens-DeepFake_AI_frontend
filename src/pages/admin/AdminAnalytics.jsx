import React, { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const RISK_ORDER = ["High", "Medium", "Low"];
const MEDIA = ["image", "audio", "video"];

function RiskBar({ value, color }) {
  const width = Math.min(100, Math.max(2, value * 8));
  return <div className={`h-2 rounded ${color}`} style={{ width: `${width}%` }} />;
}

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("sentinel_token");
        const res = await fetch(`${API_BASE}/api/admin/distribution`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Failed to load analytics");
        setData(body.data);
      } catch (err) {
        setError(err.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <Loader2 size={16} className="animate-spin" />
        Loading risk distribution...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
        <AlertCircle size={16} />
        {error}
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold text-white">Risk Analytics</h1>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {MEDIA.map((media) => (
          <div key={media} className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
            <p className="text-sm font-semibold capitalize text-white">{media}</p>
            <div className="mt-4 space-y-3">
              {RISK_ORDER.map((risk) => {
                const value = data?.[media]?.[risk] ?? 0;
                const color =
                  risk === "High" ? "bg-red-500" : risk === "Medium" ? "bg-amber-500" : "bg-emerald-500";
                return (
                  <div key={risk}>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                      <span>{risk}</span>
                      <span>{value}</span>
                    </div>
                    <RiskBar value={value} color={color} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
