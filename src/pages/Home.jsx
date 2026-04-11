import { ArrowRight, BookOpen, CalendarRange, CheckCircle2, Sparkles } from "lucide-react";
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
      <div className="space-y-6 rounded-2xl border border-[#2a2b30] bg-[#18191d] p-5 shadow-2xl shadow-black/20 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#4ade80]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#4ade80]">
          <Sparkles className="h-3.5 w-3.5" />
          Adaptive workflow
        </div>

        <div>
          <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">Plan every subject together, adjust every day, and stay on track until each exam.</h2>
          <p className="mt-3 text-sm leading-6 text-[#9ca3af]">
            Build subjects with exam dates, priorities, preferred study slots, and topic hours. The planner creates one combined roadmap, then updates it again when you review what you studied or skipped.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Feature icon={BookOpen} title="Set Up Subjects" description="Add every subject with its exam date, priority, and preferred study slot." />
          <Feature icon={CalendarRange} title="Generate One Plan" description="Create one day-wise roadmap across all subjects using urgency, difficulty, and remaining hours." />
          <Feature icon={CheckCircle2} title="Review And Adapt" description="At the end of the day, log studied hours, keep unfinished topics pending, and regenerate what remains." />
        </div>

        <div className="rounded-2xl border border-[#2a2b30] bg-[#0f1115] p-4 sm:p-5">
          <div className="mb-3 text-sm font-semibold text-white">How the flow works</div>
          <div className="grid gap-3 sm:grid-cols-3">
            <WorkflowStep number="1" title="Create" description="Add subjects, exam dates, priorities, study slots, and topic estimates." />
            <WorkflowStep number="2" title="Generate" description="Get one combined daily plan that spreads topics and revision sessions until exams." />
            <WorkflowStep number="3" title="Review" description="At day end, say what you completed, how many hours you studied, and what was skipped." />
          </div>
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

function WorkflowStep({ number, title, description }) {
  return (
    <div className="rounded-xl border border-[#2a2b30] bg-[#18191d] p-4">
      <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#4ade80]/10 text-sm font-semibold text-[#4ade80]">
        {number}
      </div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-[#9ca3af]">{description}</p>
    </div>
  );
}
