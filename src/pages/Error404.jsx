import React from "react";
import { Link } from "react-router-dom";

export default function Error404() {
  return (
    <section className="min-h-screen bg-slate-900 px-6 py-20 text-center text-slate-200">
      <p className="text-sm uppercase tracking-widest text-cyan-400">Error</p>
      <h1 className="mt-3 text-5xl font-bold text-white">404</h1>
      <p className="mt-3 text-slate-400">Page not found.</p>
      <Link
        to="/"
        className="mt-8 inline-block rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-cyan-400"
      >
        Go Home
      </Link>
    </section>
  );
}
