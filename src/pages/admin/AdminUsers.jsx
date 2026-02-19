import React, { useCallback, useEffect, useState } from "react";
import { AlertCircle, Loader2, Search, Users } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    authProvider: "",
  });
  const [initialLoaded, setInitialLoaded] = useState(false);

  const loadUsers = useCallback(async (page = 1, overrideFilters = null) => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("sentinel_token");
      const activeFilters = overrideFilters || { search: "", role: "", authProvider: "" };
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(pagination.limit));
      if (activeFilters.search.trim()) params.set("search", activeFilters.search.trim());
      if (activeFilters.role) params.set("role", activeFilters.role);
      if (activeFilters.authProvider) params.set("authProvider", activeFilters.authProvider);

      const res = await fetch(`${API_BASE}/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to load users");

      setUsers(body?.data?.users || []);
      setPagination((prev) => ({
        ...prev,
        ...(body?.data?.pagination || {}),
      }));
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    if (initialLoaded) return;
    setInitialLoaded(true);
    loadUsers(1);
  }, [initialLoaded, loadUsers]);

  const onApplyFilters = (e) => {
    e.preventDefault();
    loadUsers(1, filters);
  };

  const prevDisabled = pagination.page <= 1 || loading;
  const nextDisabled = pagination.page >= pagination.totalPages || loading;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Users</h1>

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
                placeholder="Name or email"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-3 text-sm text-slate-200 outline-none focus:border-cyan-500/60"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
              Role
            </label>
            <select
              value={filters.role}
              onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/60"
            >
              <option value="">All</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-slate-500">
              Provider
            </label>
            <select
              value={filters.authProvider}
              onChange={(e) => setFilters((prev) => ({ ...prev, authProvider: e.target.value }))}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/60"
            >
              <option value="">All</option>
              <option value="local">Local</option>
              <option value="google">Google</option>
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
              const empty = { search: "", role: "", authProvider: "" };
              setFilters(empty);
              loadUsers(1, empty);
            }}
            className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-60"
          >
            Reset
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5">
        <p className="mb-3 flex items-center gap-2 text-slate-300">
          <Users size={16} className="text-cyan-400" />
          Total registered users: {pagination.total}
        </p>

        {loading && (
          <p className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 size={16} className="animate-spin" />
            Loading users...
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
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Role</th>
                  <th className="px-3 py-2 font-medium">Provider</th>
                  <th className="px-3 py-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-3 py-8 text-center text-slate-400">
                      No users found.
                    </td>
                  </tr>
                )}
                {users.map((user) => (
                  <tr key={user._id} className="border-t border-slate-700/70 text-slate-300">
                    <td className="px-3 py-2">{user.name || "-"}</td>
                    <td className="px-3 py-2">{user.email || "-"}</td>
                    <td className="px-3 py-2 uppercase">{user.role || "-"}</td>
                    <td className="px-3 py-2 capitalize">{user.authProvider || "-"}</td>
                    <td className="px-3 py-2 text-slate-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}
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
            onClick={() => loadUsers(pagination.page - 1, filters)}
            className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={nextDisabled}
            onClick={() => loadUsers(pagination.page + 1, filters)}
            className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
