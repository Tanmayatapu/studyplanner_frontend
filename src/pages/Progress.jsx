import { AlertCircle, Flame, TrendingUp, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { getTotalStudyHours, getWeeklyPerformance, getStudyStreak, getWeakTopics } from "../api/analyticsService.js";

export default function Progress() {
  const [analytics, setAnalytics] = useState({
    totalHours: 0,
    weeklyHours: 0,
    daysTracked: 0,
    streak: 0,
    weakTopics: [],
    weeklyBreakdown: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    setLoading(true);
    setError("");

    try {
      const [totalHoursData, weeklyData, streakData, weakTopicsData] = await Promise.all([
        getTotalStudyHours(),
        getWeeklyPerformance(),
        getStudyStreak(),
        getWeakTopics(),
      ]);

      setAnalytics({
        totalHours: totalHoursData.totalHours || 0,
        weeklyHours: weeklyData.weeklyHours || 0,
        daysTracked: weeklyData.daysTracked || 0,
        streak: streakData.streak || 0,
        weakTopics: weakTopicsData.weakTopics || [],
        weeklyBreakdown: buildWeeklyBreakdown(weeklyData.weeklyHours || 0, weeklyData.daysTracked || 0),
      });
    } catch (loadError) {
      setError(loadError.response?.data?.message || loadError.message || "Unable to load analytics");
    } finally {
      setLoading(false);
    }
  }

  const achievements = buildAchievements(analytics);

  return (
    <div className="p-0">
      <div className="mb-8">
        <h1 className="mb-1 text-3xl font-semibold tracking-tight">Progress &amp; Analytics</h1>
        <p className="text-[#9ca3af]">Live metrics from analytics and study-log endpoints.</p>
      </div>

      {error ? <div className="mb-6 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div> : null}

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard icon={Flame} value={loading ? "..." : String(analytics.streak)} title="Day Streak" description="Calculated from consecutive study logs" />
        <StatCard icon={TrendingUp} value={loading ? "..." : `${analytics.weeklyHours.toFixed(1)}h`} title="This Week" description={`${analytics.daysTracked} tracked days in the last 7 days`} accent />
        <StatCard icon={null} value={loading ? "..." : `${analytics.totalHours.toFixed(1)}h`} title="Total Study Hours" description="Summed from all study logs" badge={`${analytics.daysTracked}`} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="overflow-hidden rounded-xl border border-[#2a2b30] bg-[#18191d] xl:col-span-2">
          <div className="border-b border-[#2a2b30] p-6">
            <h2 className="text-xl font-semibold">Weekly Study Hours</h2>
            <p className="mt-1 text-sm text-[#9ca3af]">Visualized from the weekly performance endpoint</p>
          </div>
          <div className="h-[360px] p-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.weeklyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2b30" />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                <Bar dataKey="hours" fill="#4ade80" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#2a2b30] bg-[#18191d]">
          <div className="border-b border-[#2a2b30] p-6">
            <div className="mb-1 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-400" />
              <h2 className="text-xl font-semibold">Weak Topics</h2>
            </div>
            <p className="text-sm text-[#9ca3af]">Direct output from the weak-topics analytics controller</p>
          </div>
          <div className="space-y-4 p-6">
            {analytics.weakTopics.length > 0 ? analytics.weakTopics.map((item) => {
              const score = Math.max(5, Math.round((item.studied / item.estimated) * 100));
              return (
                <div key={item.name}>
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-xs text-[#9ca3af]">Studied {item.studied}h of {item.estimated}h</div>
                    </div>
                    <div className="text-sm font-semibold text-amber-400">{score}%</div>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#25262b]">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${score}%` }} />
                  </div>
                </div>
              );
            }) : <EmptyState message={loading ? "Loading weak topics..." : "No weak topics right now."} />}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#2a2b30] bg-[#18191d] xl:col-span-3">
          <div className="border-b border-[#2a2b30] p-6">
            <h2 className="text-xl font-semibold">Recent Achievements</h2>
            <p className="mt-1 text-sm text-[#9ca3af]">Derived from your live analytics results</p>
          </div>
          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
            {achievements.map((achievement) => (
              <div key={achievement.title} className="rounded-xl border border-[#2a2b30] bg-[#25262b]/50 p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#4ade80]/10">
                  <Trophy className="h-5 w-5 text-[#4ade80]" />
                </div>
                <h3 className="font-semibold">{achievement.title}</h3>
                <p className="mt-1 text-sm text-[#9ca3af]">{achievement.description}</p>
                <p className="mt-2 text-xs text-[#9ca3af]">{achievement.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, value, title, description, accent = false, badge }) {
  return <div className="rounded-xl border border-[#2a2b30] bg-[#18191d] p-6"><div className="mb-4 flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4ade80]/10 text-[#4ade80]">{badge ? <span className="text-base font-semibold">{badge}</span> : Icon ? <Icon className="h-6 w-6" /> : null}</div><div><div className="text-3xl font-semibold">{value}</div><div className="text-sm text-[#9ca3af]">{title}</div></div></div><div className={`text-sm ${accent ? "text-[#4ade80]" : "text-[#9ca3af]"}`}>{description}</div></div>;
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return <div className="rounded-lg border border-[#2a2b30] bg-[#18191d] px-3 py-2 text-sm shadow-xl shadow-black/30"><p className="font-medium text-white">{label}</p><p className="mt-1 text-[#4ade80]">{payload[0].value} hours</p></div>;
}

function EmptyState({ message }) {
  return <div className="rounded-xl border border-dashed border-[#2a2b30] bg-[#0f1115] px-4 py-6 text-sm text-[#9ca3af]">{message}</div>;
}

function buildAchievements(analytics) {
  return [
    { title: "Streak Builder", description: `Maintained a ${analytics.streak}-day study streak.`, date: "Live" },
    { title: "Hours Champion", description: `${analytics.weeklyHours.toFixed(1)} hours studied in the last 7 days.`, date: "This week" },
    { title: "Tracking Momentum", description: `${analytics.daysTracked} tracked study days in the weekly snapshot.`, date: "Current snapshot" },
  ];
}

function buildWeeklyBreakdown(weeklyHours, daysTracked) {
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const activeDays = Math.max(1, Math.min(dayLabels.length, daysTracked || 1));
  const average = weeklyHours / activeDays;

  return dayLabels.map((day, index) => ({
    day,
    hours: index < activeDays ? Number(average.toFixed(1)) : 0,
  }));
}
