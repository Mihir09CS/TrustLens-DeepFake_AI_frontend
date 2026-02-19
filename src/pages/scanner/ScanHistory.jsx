import React, { useEffect, useState } from "react";
import { AlertCircle, Download, Loader2 } from "lucide-react";
import { createReportProof, downloadPdfReport } from "../../utils/pdfReport";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function RiskBadge({ risk }) {
  const cls =
    risk === "High"
      ? "bg-red-500/10 text-red-400 border-red-500/25"
      : risk === "Medium"
        ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
  return <span className={`rounded-full border px-2 py-0.5 text-xs ${cls}`}>{risk}</span>;
}

export default function ScanHistory() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scans, setScans] = useState([]);

  useEffect(() => {
    const load = async () => {
      setError("");
      try {
        const token = localStorage.getItem("sentinel_token");
        const res = await fetch(`${API_BASE}/api/scan/history?limit=20`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load history");
        setScans(data?.data?.scans || []);
      } catch (err) {
        setError(err.message || "Failed to load history");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const downloadHistoryReport = async (scan) => {
    if (!scan) return;
    const probability = (Number(scan.probability || 0) * 100).toFixed(2);
    const summary = {
      mediaUrl: scan.mediaUrl || "-",
      mediaType: scan.mediaType || "-",
      riskLevel: scan.riskLevel || "-",
      threatScore: scan.threatScore ?? "-",
      probability,
      createdAt: scan.createdAt || null,
    };
    const proof = await createReportProof({
      reportType: "history",
      scanId: scan._id || null,
      summary,
    });

    const lines = [
      "Report Type: Historical Scan",
      `Media URL: ${scan.mediaUrl || "-"}`,
      `Media Type: ${scan.mediaType || "-"}`,
      `Risk Level: ${scan.riskLevel || "-"}`,
      `Threat Score: ${scan.threatScore ?? "-"}`,
      `Probability: ${probability}%`,
      `Scanned At: ${scan.createdAt ? new Date(scan.createdAt).toLocaleString() : "-"}`,
      `Proof ID: ${proof?.proofId || "not-recorded"}`,
      `Proof Hash: ${proof?.contentHash || "not-recorded"}`,
    ];

    downloadPdfReport({
      filename: `scan-history-${scan._id || Date.now()}.pdf`,
      title: "TrustLens Scan History Report",
      lines,
    });
  };

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Scan History</h1>
        <p className="mt-1 text-sm text-slate-400">Your recent forensic analysis records.</p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 size={16} className="animate-spin" />
          Loading history...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800/50">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Media URL</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Probability</th>
                <th className="px-4 py-3 font-medium">Threat Score</th>
                <th className="px-4 py-3 font-medium">Risk</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {scans.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center text-slate-400">
                    No scan records found.
                  </td>
                </tr>
              )}
              {scans.map((scan) => (
                <tr key={scan._id} className="border-t border-slate-700/70 text-slate-300">
                  <td className="max-w-[280px] truncate px-4 py-3">{scan.mediaUrl}</td>
                  <td className="px-4 py-3 capitalize">{scan.mediaType}</td>
                  <td className="px-4 py-3">{(Number(scan.probability || 0) * 100).toFixed(2)}%</td>
                  <td className="px-4 py-3">{scan.threatScore}</td>
                  <td className="px-4 py-3">
                    <RiskBadge risk={scan.riskLevel} />
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {scan.createdAt ? new Date(scan.createdAt).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => downloadHistoryReport(scan)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20"
                    >
                      <Download size={13} />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
