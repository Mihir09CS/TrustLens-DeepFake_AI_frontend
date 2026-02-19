import React, { useState } from "react";
import { AlertCircle, Download, Link2, Loader2, Upload } from "lucide-react";
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

export default function ScannerWorkspace() {
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const token = localStorage.getItem("sentinel_token");

  const downloadSingleReport = async () => {
    if (!result) return;
    const probability = (Number(result.probability || 0) * 100).toFixed(2);
    const summary = {
      mediaType: result.mediaType || "-",
      riskLevel: result.riskLevel || "-",
      threatScore: result.threatScore ?? "-",
      probability,
      timestamp: result.timestamp || null,
    };
    const proof = await createReportProof({
      reportType: "single",
      scanId: result.scanId || null,
      summary,
    });

    const lines = [
      "Report Type: Single Media Analysis",
      `Media Type: ${result.mediaType || "-"}`,
      `Risk Level: ${result.riskLevel || "-"}`,
      `Threat Score: ${result.threatScore ?? "-"}`,
      `Probability: ${probability}%`,
      `Timestamp: ${result.timestamp ? new Date(result.timestamp).toLocaleString() : "-"}`,
      `Source URL: ${result.sourceUrl || "-"}`,
      `Analyzed URL: ${result.analyzedUrl || "-"}`,
      `Proof ID: ${proof?.proofId || "not-recorded"}`,
      `Proof Hash: ${proof?.contentHash || "not-recorded"}`,
      "",
      "Explanation:",
      result.explanation || "-",
    ];

    downloadPdfReport({
      filename: `scan-report-${Date.now()}.pdf`,
      title: "TrustLens Single Scan Report",
      lines,
    });
  };

  const scanByUrl = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!url.trim()) return;
    setLoadingUrl(true);

    try {
      const res = await fetch(`${API_BASE}/api/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mediaUrl: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");
      setResult(data.data);
    } catch (err) {
      setError(err.message || "URL scan failed");
    } finally {
      setLoadingUrl(false);
    }
  };

  const scanByFile = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!file) return;
    setLoadingFile(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/api/scan/file`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "File scan failed");
      setResult(data.data);
    } catch (err) {
      setError(err.message || "File scan failed");
    } finally {
      setLoadingFile(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Scanner Workspace</h1>
        <p className="mt-1 text-sm text-slate-400">Analyze a media URL or upload a file.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <form onSubmit={scanByUrl} className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 space-y-3">
          <p className="flex items-center gap-2 text-white font-medium">
            <Link2 size={16} className="text-cyan-400" />
            URL Scan
          </p>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/media.jpg"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/60"
          />
          <button
            type="submit"
            disabled={loadingUrl}
            className="w-full rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-400 disabled:opacity-60"
          >
            {loadingUrl ? "Scanning..." : "Scan URL"}
          </button>
        </form>

        <form onSubmit={scanByFile} className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 space-y-3">
          <p className="flex items-center gap-2 text-white font-medium">
            <Upload size={16} className="text-cyan-400" />
            File Scan
          </p>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300 file:mr-3 file:rounded file:border-0 file:bg-slate-700 file:px-2 file:py-1 file:text-slate-200"
          />
          <button
            type="submit"
            disabled={loadingFile}
            className="w-full rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-400 disabled:opacity-60"
          >
            {loadingFile ? "Uploading..." : "Scan File"}
          </button>
        </form>
      </div>

      {(loadingUrl || loadingFile) && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 size={16} className="animate-spin" />
          Processing analysis...
        </div>
      )}

      {result && (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Analysis Result</h2>
            <button
              type="button"
              onClick={downloadSingleReport}
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/35 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/20"
            >
              <Download size={15} />
              Download PDF
            </button>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <p className="text-slate-300">
              <span className="text-slate-500">Media Type:</span> {result.mediaType}
            </p>
            <p className="text-slate-300">
              <span className="text-slate-500">Probability:</span>{" "}
              {(Number(result.probability || 0) * 100).toFixed(2)}%
            </p>
            <p className="text-slate-300">
              <span className="text-slate-500">Threat Score:</span> {result.threatScore}
            </p>
            <div>
              <span className="mr-2 text-slate-500">Risk:</span>
              <RiskBadge risk={result.riskLevel} />
            </div>
          </div>
          {result.explanation && <p className="mt-4 text-sm text-slate-400">{result.explanation}</p>}
        </div>
      )}
    </section>
  );
}
