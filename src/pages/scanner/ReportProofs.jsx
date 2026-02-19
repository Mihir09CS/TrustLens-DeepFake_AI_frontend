import React, { useEffect, useState } from "react";
import { AlertCircle, FileBadge2, Loader2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ReportProofs() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [proofs, setProofs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [reportType, setReportType] = useState("");

  const loadProofs = async (page = 1, type = reportType) => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("sentinel_token");
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(pagination.limit));
      if (type) params.set("reportType", type);
      const res = await fetch(`${API_BASE}/api/scan/proofs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to load report proofs");
      setProofs(body?.data?.proofs || []);
      setPagination((prev) => ({ ...prev, ...(body?.data?.pagination || {}) }));
    } catch (err) {
      setError(err.message || "Failed to load report proofs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProofs(1, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Report Proofs</h1>
          <p className="mt-1 text-sm text-slate-400">
            Evidence records for generated PDF analysis reports.
          </p>
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
            Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => {
              const value = e.target.value;
              setReportType(value);
              loadProofs(1, value);
            }}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/60"
          >
            <option value="">All</option>
            <option value="single">Single</option>
            <option value="bulk">Bulk</option>
            <option value="history">History</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 size={16} className="animate-spin" />
          Loading report proofs...
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
                <th className="px-4 py-3 font-medium">Proof ID</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Scan ID</th>
                <th className="px-4 py-3 font-medium">Content Hash</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {proofs.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-10 text-center text-slate-400">
                    No report proofs found.
                  </td>
                </tr>
              )}
              {proofs.map((proof) => (
                <tr key={proof._id} className="border-t border-slate-700/70 text-slate-300">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      <FileBadge2 size={14} className="text-cyan-400" />
                      <span className="font-mono text-xs">{proof._id}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 uppercase">{proof.reportType || "-"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{proof.scanId || "-"}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {(proof.contentHash || "-").slice(0, 20)}
                    {proof.contentHash ? "..." : ""}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {proof.createdAt ? new Date(proof.createdAt).toLocaleString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          Page {pagination.page} of {pagination.totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={loading || pagination.page <= 1}
            onClick={() => loadProofs(pagination.page - 1)}
            className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={loading || pagination.page >= pagination.totalPages}
            onClick={() => loadProofs(pagination.page + 1)}
            className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
