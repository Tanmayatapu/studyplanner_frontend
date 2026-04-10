import { BookOpen, Sparkles, TrendingUp } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0f1115] text-[#e8e9eb] lg:flex">
      <div className="hidden border-r border-[#2a2b30] bg-[#18191d] lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12">
        <div>
          <div className="mb-16 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4ade80]/10">
              <BookOpen className="h-6 w-6 text-[#4ade80]" />
            </div>
            <span className="text-2xl font-semibold tracking-tight">AI Study Planner</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-semibold tracking-tight">Plan smarter. Study consistently.</h1>
            <p className="mt-4 text-lg leading-relaxed text-[#9ca3af]">
              An intelligent study planning system designed for college students preparing for exams. Stay organized, track your progress, and ace your tests.
            </p>
          </div>
        </div>

        <div className="max-w-md space-y-6">
          <FeatureCard
            icon={Sparkles}
            title="Smart scheduling"
            description="AI-powered study plans adapted to your exam dates and learning pace"
          />
          <FeatureCard
            icon={TrendingUp}
            title="Track your progress"
            description="Visual insights into your study habits, streaks, and topic mastery"
          />
        </div>
      </div>

      <div className="flex min-h-screen w-full items-center justify-center bg-[#0f1115] p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-12 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4ade80]/10">
              <BookOpen className="h-6 w-6 text-[#4ade80]" />
            </div>
            <span className="text-xl font-semibold">AI Study Planner</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-[#2a2b30] bg-[#25262b]/50 p-4">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#4ade80]/10">
        <Icon className="h-5 w-5 text-[#4ade80]" />
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="mt-1 text-sm text-[#9ca3af]">{description}</p>
      </div>
    </div>
  );
}
