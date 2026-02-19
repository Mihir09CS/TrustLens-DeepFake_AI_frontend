import React from "react";
import { BrowserRouter, Routes, Route, Outlet, Navigate, useParams } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import UserSidebar from "../components/UserSidebar";
import AdminSidebar from "../components/AdminSidebar";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import Landing from "../pages/auth/landing/Landing";
import UserDashboard from "../pages/dashboard/UserDashboard";
import ScannerWorkspace from "../pages/scanner/ScannerWorkspace";
import BulkAnalyzer from "../pages/scanner/BulkAnalyzer";
import ScanHistory from "../pages/scanner/ScanHistory";
import ReportProofs from "../pages/scanner/ReportProofs";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminScans from "../pages/admin/AdminScans";
import AdminAnalytics from "../pages/admin/AdminAnalytics";
import AdminSystem from "../pages/admin/AdminSystem";
import Error404 from "../pages/Error404";

const getUserToken = () => localStorage.getItem("sentinel_token");
const getUserRole = () => localStorage.getItem("sentinel_role");

function GuestOnlyRoute({ children }) {
  const token = getUserToken();
  const role = getUserRole();

  if (!token) return children;
  if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

function ProtectedUserRoute({ children }) {
  return getUserToken() ? children : <Navigate to="/auth/login" replace />;
}

function ProtectedAdminRoute({ children }) {
  const token = getUserToken();
  const role = getUserRole();

  if (!token) return <Navigate to="/auth/admin-login" replace />;
  if (role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Header />
      <main className="flex-grow w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function AuthLayout() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900">
      <main className="w-full max-w-md px-4 py-10">
        <Outlet />
      </main>
    </div>
  );
}

function UserLayout() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 cyber-grid animate-grid" />
      <div className="cyber-orb pointer-events-none absolute -left-20 top-16 h-72 w-72 rounded-full bg-cyan-500/30" />
      <div className="cyber-orb pointer-events-none absolute -right-16 top-40 h-64 w-64 rounded-full bg-blue-500/25" />
      <Header />
      <div className="relative z-10 flex flex-grow min-h-0">
        <UserSidebar />
        <main className="flex-grow overflow-y-auto p-5 md:p-6">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}

function AdminLayout() {
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <AdminSidebar />
      <main className="flex-grow overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}

function ResetPasswordAliasRedirect() {
  const { token } = useParams();
  return <Navigate to={`/auth/reset-password/${token || ""}`} replace />;
}

function HomeRoute() {
  const token = getUserToken();
  const role = getUserRole();
  if (token) {
    return <Navigate to={role === "admin" ? "/admin/dashboard" : "/dashboard"} replace />;
  }
  return <Landing />;
}

export default function Layout() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthLayout />}>
          <Route
            path="login"
            element={
              <GuestOnlyRoute>
                <Login forcedMode="user" />
              </GuestOnlyRoute>
            }
          />
          <Route
            path="admin-login"
            element={
              <GuestOnlyRoute>
                <Login forcedMode="admin" />
              </GuestOnlyRoute>
            }
          />
          <Route
            path="register"
            element={
              <GuestOnlyRoute>
                <Register />
              </GuestOnlyRoute>
            }
          />
          <Route
            path="forgot-password"
            element={
              <GuestOnlyRoute>
                <ForgotPassword />
              </GuestOnlyRoute>
            }
          />
          <Route
            path="reset-password/:token"
            element={
              <GuestOnlyRoute>
                <ResetPassword />
              </GuestOnlyRoute>
            }
          />
        </Route>

        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/admin/login" element={<Navigate to="/auth/admin-login" replace />} />
        <Route path="/register" element={<Navigate to="/auth/register" replace />} />
        <Route path="/forgot-password" element={<Navigate to="/auth/forgot-password" replace />} />
        <Route path="/reset-password/:token" element={<ResetPasswordAliasRedirect />} />

        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomeRoute />} />
        </Route>

        <Route
          path="/"
          element={
            <ProtectedUserRoute>
              <UserLayout />
            </ProtectedUserRoute>
          }
        >
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="scanner" element={<ScannerWorkspace />} />
          <Route path="scanner/bulk" element={<BulkAnalyzer />} />
          <Route path="history" element={<ScanHistory />} />
          <Route path="reports" element={<ReportProofs />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="scans" element={<AdminScans />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="system" element={<AdminSystem />} />
          <Route path="*" element={<Error404 />} />
        </Route>

        <Route path="*" element={<Error404 />} />
      </Routes>
    </BrowserRouter>
  );
}
