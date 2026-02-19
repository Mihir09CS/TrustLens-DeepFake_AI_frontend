import React, { useState } from "react";
import { AlertCircle, Download, Loader2 } from "lucide-react";
import { createReportProof, downloadPdfReport } from "../../utils/pdfReport";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function BulkAnalyzer() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const overallClass = (overall) => {
    if (overall === "High") return "text-red-400";
    if (overall === "Medium") return "text-amber-400";
    if (overall === "Low") return "text-emerald-400";
    return "text-slate-300";
  };

  const downloadBulkReport = async () => {
    if (!result) return;

    const summary = {
      scanned: result.scanned ?? 0,
      successful: result.successful ?? 0,
      failed: result.failed ?? 0,
      overall: result.overall || "-",
      high: result.high ?? 0,
      medium: result.medium ?? 0,
      low: result.low ?? 0,
    };
    const proof = await createReportProof({
      reportType: "bulk",
      summary,
    });

    const lines = [
      "Report Type: Bulk Media Analysis",
      `Scanned: ${result.scanned ?? 0}`,
      `Successful: ${result.successful ?? 0}`,
      `Failed: ${result.failed ?? 0}`,
      `Overall Risk: ${result.overall || "-"}`,
      `High Risk Count: ${result.high ?? 0}`,
      `Medium Risk Count: ${result.medium ?? 0}`,
      `Low Risk Count: ${result.low ?? 0}`,
      `Proof ID: ${proof?.proofId || "not-recorded"}`,
      `Proof Hash: ${proof?.contentHash || "not-recorded"}`,
      "",
      "Per-URL Results:",
    ];

    if (Array.isArray(result.results)) {
      result.results.forEach((item, idx) => {
        lines.push(`${idx + 1}. URL: ${item.url || "-"}`);
        lines.push(`   Status: ${item.status || "-"}`);
        if (item.status === "success") {
          lines.push(`   Media Type: ${item.mediaType || "-"}`);
          lines.push(`   Risk: ${item.risk || "-"}`);
          lines.push(`   Threat Score: ${item.threatScore ?? "-"}`);
          lines.push(
            `   Probability: ${((Number(item.probability || 0) * 100).toFixed(2))}%`,
          );
        } else {
          lines.push(`   Error: ${item.error || "Unknown error"}`);
        }
      });
    }

    downloadPdfReport({
      filename: `bulk-report-${Date.now()}.pdf`,
      title: "TrustLens Bulk Scan Report",
      lines,
    });
  };

  const runBulk = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    const mediaUrls = input
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean);

    if (!mediaUrls.length) {
      setError("Enter at least one URL.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("sentinel_token");
      const res = await fetch(`${API_BASE}/api/scan/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mediaUrls }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bulk scan failed");
      setResult(data.data);
    } catch (err) {
      setError(err.message || "Bulk scan failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Bulk Analyzer</h1>
        <p className="mt-1 text-sm text-slate-400">Submit multiple media URLs for moderation analysis.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={runBulk} className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          placeholder={"https://example.com/1.jpg\nhttps://example.com/2.mp4\nhttps://example.com/3.wav"}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/60"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-400 disabled:opacity-60"
        >
          {loading ? "Running bulk analysis..." : "Run Bulk Analysis"}
        </button>
      </form>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 size={16} className="animate-spin" />
          Processing...
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={downloadBulkReport}
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/35 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/20"
            >
              <Download size={15} />
              Download PDF Report
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-700 bg-slate-800/50 p-4 sm:grid-cols-4">
            <div className="rounded-lg border border-red-500/25 bg-red-500/10 p-3">
              <p className="text-xs text-slate-500">High</p>
              <p className="text-xl font-semibold text-red-400">{result.high}</p>
            </div>
            <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-3">
              <p className="text-xs text-slate-500">Medium</p>
              <p className="text-xl font-semibold text-amber-400">{result.medium}</p>
            </div>
            <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-3">
              <p className="text-xs text-slate-500">Low</p>
              <p className="text-xl font-semibold text-emerald-400">{result.low}</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900 p-3">
              <p className="text-xs text-slate-500">Scanned</p>
              <p className="text-xl font-semibold text-slate-200">{result.scanned}</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900 p-3">
              <p className="text-xs text-slate-500">Failed</p>
              <p className="text-xl font-semibold text-slate-200">{result.failed}</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900 p-3">
              <p className="text-xs text-slate-500">Successful</p>
              <p className="text-xl font-semibold text-slate-200">{result.successful ?? 0}</p>
            </div>
            <div className="rounded-lg border border-cyan-500/25 bg-cyan-500/10 p-3">
              <p className="text-xs text-slate-500">Overall</p>
              <p className={`text-xl font-semibold ${overallClass(result.overall)}`}>
                {result.overall}
              </p>
              {result.overall === "Unknown" && (
                <p className="mt-1 text-[11px] text-slate-400">
                  No successful scans to determine risk.
                </p>
              )}
            </div>
          </div>

          {Array.isArray(result.results) && result.results.length > 0 && (
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <p className="mb-2 text-sm font-semibold text-white">Per-URL Results</p>
              <div className="space-y-2">
                {result.results.map((item, idx) => (
                  <div
                    key={`${item.url}-${idx}`}
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      item.status === "success"
                        ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                        : "border-red-500/25 bg-red-500/10 text-red-300"
                    }`}
                  >
                    <p className="truncate">{item.url}</p>
                    {item.status === "success" ? (
                      <p className="mt-1 text-xs text-emerald-200">
                        {item.risk} risk | {item.mediaType} | score {item.threatScore}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-red-200">
                        Failed: {item.error || "Unknown error"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
