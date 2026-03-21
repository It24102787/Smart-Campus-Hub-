import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  MapPin,
  AlertCircle,
  Wrench,
  Activity,
  GraduationCap,
  ShieldCheck,
  Cpu,
  Sparkles,
  CheckCircle2,
  Clock3
} from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Study Spot Finder",
    description: "See available study zones in real-time with crowd-level indicators."
  },
  {
    icon: AlertCircle,
    title: "Campus Issue Reporter",
    description: "Report facility issues quickly and track status updates from one place."
  },
  {
    icon: Wrench,
    title: "Equipment Booking",
    description: "Reserve lab items and shared tools with clear availability windows."
  },
  {
    icon: Activity,
    title: "Environment Monitor",
    description: "Track noise, temperature, and air quality for better learning comfort."
  },
  {
    icon: GraduationCap,
    title: "Academic Support",
    description: "Find tutors, join study groups, and share useful resources instantly."
  },
  {
    icon: ShieldCheck,
    title: "Secure Access",
    description: "Role-based permissions with secure session handling for all users."
  }
];

const workflow = [
  "Sign in with your student account",
  "Pick a module based on your need",
  "Get instant actions, tracking, and updates"
];

const stats = [
  { label: "Core Modules", value: "5+" },
  { label: "Service Access", value: "24/7" },
  { label: "Data Security", value: "100%" }
];

const Landing = () => (
  <div className="min-h-screen bg-slate-50 text-slate-900">
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-blue-300/30 blur-[120px]" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-cyan-200/30 blur-[110px]" />
      <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-indigo-200/30 blur-[120px]" />
    </div>

    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-black text-white">
            SC
          </div>
          <span className="text-lg font-semibold tracking-wide">SmartCampus Hub</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
            Login
          </Link>
          <Link to="/register" className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-400">
            Get Started
          </Link>
        </div>
      </div>
    </header>

    <main>
      <section className="px-5 pb-20 pt-16 sm:px-8 sm:pt-20">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
              <Sparkles size={14} />
              Campus Life, Simplified
            </div>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              <span className="inline-block bg-gradient-to-r from-cyan-600 via-blue-600 to-blue-500 bg-clip-text text-transparent animate-pulse">
                Smart Campus Hub
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Manage study spaces, equipment, environmental insights, issue reporting, and academic help through a single modern platform.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">
                Create Account
                <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                Open Dashboard
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-200 pt-6">
              {stats.map((item) => (
                <div key={item.label}>
                  <p className="text-2xl font-bold text-cyan-700 sm:text-3xl">{item.value}</p>
                  <p className="text-xs text-slate-500 sm:text-sm">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-blue-100/60">
            <img
              src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80"
              alt="University campus students"
              className="h-64 w-full rounded-2xl object-cover sm:h-72 lg:h-[26rem]"
            />
            <div className="mt-4 rounded-2xl border border-cyan-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-5">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Quick Onboarding</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">
                  <Clock3 size={12} />
                  2 min setup
                </span>
              </div>
              <div className="space-y-4">
                {workflow.map((step, index) => (
                  <div key={step} className="flex items-start gap-3">
                    <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-500 text-xs font-bold text-white">
                      {index + 1}
                    </div>
                    <p className="text-sm text-slate-600">{step}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-700">Live modules active now</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Study Spots", "Issues", "Equipment", "Environment", "Support"].map((tag) => (
                  <span key={tag} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 sm:pb-24">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-10 flex items-center gap-2 text-cyan-700">
            <Cpu size={16} />
            <p className="text-sm font-semibold uppercase tracking-[0.15em]">Platform Features</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-md">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 text-cyan-700">
                    <Icon size={20} />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 rounded-3xl border border-cyan-200 bg-gradient-to-r from-blue-100 to-cyan-100 p-7 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Ready to upgrade your campus workflow?</h2>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">Create your account and start using all modules in one unified dashboard.</p>
          </div>
          <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-50">
            Start Free
            <CheckCircle2 size={16} />
          </Link>
        </div>
      </section>
    </main>

    <footer className="border-t border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500 sm:px-8">
      <p>&copy; 2026 SmartCampus Hub. All rights reserved.</p>
    </footer>
  </div>
);

export default Landing;
