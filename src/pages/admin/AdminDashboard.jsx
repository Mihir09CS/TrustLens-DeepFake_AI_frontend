import React, { useEffect, useState } from "react";
import { AlertCircle, Loader2, ShieldAlert, Users, ScanLine, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
      <p className="text-xs uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [highRiskScans, setHighRiskScans] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("sentinel_token");
        const headers = { Authorization: `Bearer ${token}` };
        const [statsRes, scansRes, usersRes] = await Promise.all([
          fetch(`${API_BASE}/api/admin/stats`, { headers }),
          fetch(`${API_BASE}/api/admin/scans?limit=5&page=1&riskLevel=High`, {
            headers,
          }),
          fetch(`${API_BASE}/api/admin/users?limit=5&page=1`, { headers }),
        ]);

        const [statsData, scansData, usersData] = await Promise.all([
          statsRes.json(),
          scansRes.json(),
          usersRes.json(),
        ]);

        if (!statsRes.ok) throw new Error(statsData.error || "Failed to load stats");
        if (!scansRes.ok) throw new Error(scansData.error || "Failed to load scans");
        if (!usersRes.ok) throw new Error(usersData.error || "Failed to load users");

        setStats(statsData.data);
        setHighRiskScans(scansData?.data?.scans || []);
        setRecentUsers(usersData?.data?.users || []);
      } catch (err) {
        setError(err.message || "Failed to load stats");
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
        Loading admin stats...
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
      <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard label="Total Users" value={stats?.totalUsers ?? 0} />
        <StatCard label="Total Scans" value={stats?.totalScans ?? 0} />
        <StatCard label="High Risk" value={stats?.highRisk ?? 0} />
        <StatCard label="Medium Risk" value={stats?.mediumRisk ?? 0} />
        <StatCard label="Low Risk" value={stats?.lowRisk ?? 0} />
        <StatCard label="Report Proofs" value={stats?.totalProofs ?? 0} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Link
          to="/admin/scans"
          className="rounded-xl border border-red-500/25 bg-red-500/5 p-4 transition-colors hover:bg-red-500/10"
        >
          <div className="flex items-center gap-2 text-red-400">
            <ShieldAlert size={16} />
            <p className="text-xs uppercase tracking-widest">High-Risk Moderation</p>
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">{stats?.highRisk ?? 0}</p>
          <p className="mt-1 text-xs text-slate-400">Review all high-risk detections</p>
        </Link>
        <Link
          to="/admin/users"
          className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-4 transition-colors hover:bg-cyan-500/10"
        >
          <div className="flex items-center gap-2 text-cyan-400">
            <Users size={16} />
            <p className="text-xs uppercase tracking-widest">User Management</p>
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">{stats?.totalUsers ?? 0}</p>
          <p className="mt-1 text-xs text-slate-400">Manage roles, providers, and access</p>
        </Link>
        <Link
          to="/admin/analytics"
          className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 transition-colors hover:bg-amber-500/10"
        >
          <div className="flex items-center gap-2 text-amber-400">
            <BarChart3 size={16} />
            <p className="text-xs uppercase tracking-widest">Risk Analytics</p>
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">{stats?.totalScans ?? 0}</p>
          <p className="mt-1 text-xs text-slate-400">Track platform scan distribution</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-white">High-Risk Queue</p>
            <Link to="/admin/scans" className="text-xs text-cyan-400 hover:text-cyan-300">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {highRiskScans.length === 0 && (
              <p className="rounded-lg border border-slate-700 bg-slate-950/40 p-3 text-sm text-slate-400">
                No high-risk scans found.
              </p>
            )}
            {highRiskScans.map((scan) => (
              <div
                key={scan._id}
                className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-950/40 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-200">{scan?.user?.email || "-"}</p>
                  <p className="text-xs text-slate-500 capitalize">{scan.mediaType || "-"}</p>
                </div>
                <span className="rounded border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs text-red-400">
                  {scan.threatScore ?? "-"}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Recent Users</p>
            <Link to="/admin/users" className="text-xs text-cyan-400 hover:text-cyan-300">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {recentUsers.length === 0 && (
              <p className="rounded-lg border border-slate-700 bg-slate-950/40 p-3 text-sm text-slate-400">
                No users found.
              </p>
            )}
            {recentUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-950/40 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-200">{user.email || "-"}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.authProvider || "-"}</p>
                </div>
                <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs uppercase text-amber-400">
                  {user.role || "-"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
