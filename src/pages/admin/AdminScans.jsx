import React, { useCallback, useEffect, useState } from "react";
import { AlertCircle, Loader2, Search } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminScans() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scans, setScans] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({
    search: "",
    riskLevel: "",
    mediaType: "",
  });
  const [initialLoaded, setInitialLoaded] = useState(false);

  const loadScans = useCallback(async (page = 1, overrideFilters = null) => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("sentinel_token");
      const activeFilters = overrideFilters || { search: "", riskLevel: "", mediaType: "" };

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(pagination.limit));
      if (activeFilters.search.trim()) params.set("search", activeFilters.search.trim());
      if (activeFilters.riskLevel) params.set("riskLevel", activeFilters.riskLevel);
      if (activeFilters.mediaType) params.set("mediaType", activeFilters.mediaType);

      const res = await fetch(`${API_BASE}/api/admin/scans?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to load scans");

      setScans(body?.data?.scans || []);
      setPagination((prev) => ({
        ...prev,
        ...(body?.data?.pagination || {}),
      }));
    } catch (err) {
      setError(err.message || "Failed to load scans");
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    if (initialLoaded) return;
    setInitialLoaded(true);
    loadScans(1);
  }, [initialLoaded, loadScans]);

  const onApplyFilters = (e) => {
    e.preventDefault();
    loadScans(1, filters);
  };

  const prevDisabled = pagination.page <= 1 || loading;
  const nextDisabled = pagination.page >= pagination.totalPages || loading;

  const riskBadgeClass = (risk) => {
    if (risk === "High") return "bg-red-500/10 text-red-400 border-red-500/25";
    if (risk === "Medium") return "bg-amber-500/10 text-amber-400 border-amber-500/25";
    if (risk === "Low") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
    return "bg-slate-500/10 text-slate-300 border-slate-500/25";
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-white">All Scans</h1>

      <form
        onSubmit={onApplyFilters}
        className="rounded-xl border border-slate-700 bg-slate-900/60 p-4"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
              Search
            </label>
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Media URL, user name, or user email"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-3 text-sm text-slate-200 outline-none focus:border-cyan-500/60"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
              Risk
            </label>
            <select
              value={filters.riskLevel}
              onChange={(e) => setFilters((prev) => ({ ...prev, riskLevel: e.target.value }))}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/60"
            >
              <option value="">All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
              Media Type
            </label>
            <select
              value={filters.mediaType}
              onChange={(e) => setFilters((prev) => ({ ...prev, mediaType: e.target.value }))}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/60"
            >
              <option value="">All</option>
              <option value="image">Image</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-400 disabled:opacity-60"
          >
            Apply Filters
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              const empty = { search: "", riskLevel: "", mediaType: "" };
              setFilters(empty);
              loadScans(1, empty);
            }}
            className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-60"
          >
            Reset
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5">
        <p className="mb-3 text-slate-300">Total scans across platform: {pagination.total}</p>

        {loading && (
          <p className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 size={16} className="animate-spin" />
            Loading scans...
          </p>
        )}
        {error && (
          <p className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            <AlertCircle size={16} />
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Media URL</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Threat Score</th>
                  <th className="px-3 py-2 font-medium">Risk</th>
                  <th className="px-3 py-2 font-medium">User</th>
                  <th className="px-3 py-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {scans.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-3 py-8 text-center text-slate-400">
                      No scans found.
                    </td>
                  </tr>
                )}
                {scans.map((scan) => (
                  <tr key={scan._id} className="border-t border-slate-700/70 text-slate-300">
                    <td className="max-w-[300px] truncate px-3 py-2">{scan.mediaUrl || "-"}</td>
                    <td className="px-3 py-2 capitalize">{scan.mediaType || "-"}</td>
                    <td className="px-3 py-2">{scan.threatScore ?? "-"}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full border px-2 py-0.5 text-xs ${riskBadgeClass(scan.riskLevel)}`}>
                        {scan.riskLevel || "Unknown"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <p className="truncate">{scan?.user?.name || "-"}</p>
                      <p className="truncate text-xs text-slate-500">{scan?.user?.email || ""}</p>
                    </td>
                    <td className="px-3 py-2 text-slate-400">
                      {scan.createdAt ? new Date(scan.createdAt).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          Page {pagination.page} of {pagination.totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={prevDisabled}
            onClick={() => loadScans(pagination.page - 1, filters)}
            className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={nextDisabled}
            onClick={() => loadScans(pagination.page + 1, filters)}
            className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
