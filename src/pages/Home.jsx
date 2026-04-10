import { ArrowRight, BookOpen, CalendarRange, Sparkles } from "lucide-react";
import { Link, Navigate } from "react-router-dom";

import AuthLayout from "../layout/AuthLayout";
import { useApp } from "../context/AuthContext";

export default function Home() {
  const { currentUser } = useApp();

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout>
      <div className="space-y-6 rounded-2xl border border-[#2a2b30] bg-[#18191d] p-8 shadow-2xl shadow-black/20">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#4ade80]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#4ade80]">
          <Sparkles className="h-3.5 w-3.5" />
          Live backend mode
        </div>

        <div>
          <h2 className="text-3xl font-semibold leading-tight">AI Study Planner connected to your real backend.</h2>
          <p className="mt-3 text-sm leading-6 text-[#9ca3af]">
            Subjects, topics, analytics, study logs, preferences, and adaptive study plans now come from the API instead of local dummy data.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Feature icon={BookOpen} title="Subjects" description="Create and manage subjects from the backend." />
          <Feature icon={CalendarRange} title="Study Plans" description="Generate plans from your real topic data and saved preferences." />
          <Feature icon={Sparkles} title="Analytics" description="See progress and weak-topic insights from live study logs." />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4ade80] px-5 py-3 text-sm font-semibold text-[#0f1115] transition hover:bg-[#62e68f]">
            Sign In
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/register" className="inline-flex items-center justify-center rounded-xl border border-[#2a2b30] bg-[#0f1115] px-5 py-3 text-sm font-semibold text-white transition hover:border-[#4ade80]/50 hover:bg-[#17191f]">
            Create Account
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

function Feature({ icon: Icon, title, description }) {
  return (
    <div className="rounded-xl border border-[#2a2b30] bg-[#0f1115] p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#4ade80]/10">
        <Icon className="h-5 w-5 text-[#4ade80]" />
      </div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-[#9ca3af]">{description}</p>
    </div>
  );
}
