import { BookOpen, CheckCircle2, Clock, Flame, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getTotalStudyHours, getStudyStreak, getWeeklyPerformance } from "../api/analyticsService.js";
import { logStudy } from "../api/studyLogService.js";
import { getSubjects } from "../api/subjectService.js";
import { getTodayPlan, getSubjectProgress } from "../api/planService.jsx";
import { decorateSubject } from "../services/subjectView.js";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    subjects: [],
    focusSubject: null,
    todayPlan: null,
    analytics: { totalHours: 0, weeklyHours: 0, daysTracked: 0, streak: 0, completedTopics: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [subjectList, totalHoursData, weeklyData, streakData] = await Promise.all([
        getSubjects(),
        getTotalStudyHours(),
        getWeeklyPerformance(),
        getStudyStreak(),
      ]);

      const progressList = await Promise.all(
        subjectList.map(async (subject) => ({
          subject,
          progress: await getSubjectProgress(subject._id),
        }))
      );

      const subjects = progressList.map(({ subject, progress }) => decorateSubject(subject, progress));
      const completedTopics = subjects.reduce((sum, subject) => sum + subject.topicsDone, 0);
      const focusSubject = subjects.find((subject) => subject.pendingTopics > 0) ?? subjects[0] ?? null;
      const todayPlan = focusSubject ? await getTodayPlan(focusSubject._id) : null;

      setDashboardData({
        subjects,
        focusSubject,
        todayPlan,
        analytics: {
          totalHours: totalHoursData.totalHours || 0,
          weeklyHours: weeklyData.weeklyHours || 0,
          daysTracked: weeklyData.daysTracked || 0,
          streak: streakData.streak || 0,
          completedTopics,
        },
      });
    } catch (loadError) {
      setError(loadError.response?.data?.message || loadError.message || "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const weeklyGoalHours = 21;
  const completionRate = useMemo(() => {
    const totalTopics = dashboardData.subjects.reduce((sum, subject) => sum + subject.topicsTotal, 0);
    return totalTopics === 0 ? 0 : Math.round((dashboardData.analytics.completedTopics / totalTopics) * 100);
  }, [dashboardData]);
  const weeklyGoalPercent = Math.min(100, Math.round((dashboardData.analytics.weeklyHours / weeklyGoalHours) * 100));

  const stats = [
    { label: "Hours studied", value: dashboardData.analytics.totalHours.toFixed(1), subtitle: "all logged hours", icon: Clock },
    { label: "Active subjects", value: String(dashboardData.subjects.length), subtitle: "tracked subjects", icon: BookOpen },
    { label: "Topics completed", value: String(dashboardData.analytics.completedTopics), subtitle: "across all subjects", icon: CheckCircle2 },
    { label: "Study streak", value: String(dashboardData.analytics.streak), subtitle: "consecutive days", icon: Flame },
  ];

  async function handleLogTask(task) {
    if (!dashboardData.focusSubject) return;

    try {
      await logStudy({
        subjectId: dashboardData.focusSubject._id,
        topics: [
          {
            topicId: task.topicId,
            hours: task.hours,
            completed: true,
          },
        ],
      });
      await loadDashboard();
    } catch (actionError) {
      setError(actionError.response?.data?.message || actionError.message || "Unable to log study");
    }
  }

  return (
    <div className="p-0">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-[#9ca3af]">Live overview from subjects, study logs, analytics, and today's planner endpoint.</p>
        </div>

        <Link to="/subjects" className="inline-flex items-center gap-2 rounded-xl bg-[#4ade80] px-4 py-2.5 text-sm font-semibold text-[#0f1115] transition hover:bg-[#62e68f]">
          <Plus className="h-4 w-4" />
          New Subject
        </Link>
      </div>

      {error ? <div className="mb-6 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div> : null}

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-[#2a2b30] bg-[#18191d] p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4ade80]/10">
                  <Icon className="h-5 w-5 text-[#4ade80]" />
                </div>
              </div>
              <div className="mb-1 text-3xl font-semibold">{loading ? "..." : stat.value}</div>
              <div className="text-sm text-[#9ca3af]">{stat.label}</div>
              <div className="mt-1 text-xs text-[#9ca3af]">{stat.subtitle}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="overflow-hidden rounded-xl border border-[#2a2b30] bg-[#18191d] xl:col-span-2">
          <div className="border-b border-[#2a2b30] p-6">
            <h2 className="text-xl font-semibold">Today's Study Plan</h2>
            <p className="mt-1 text-sm text-[#9ca3af]">
              {dashboardData.focusSubject
                ? `${dashboardData.focusSubject.name} prioritized by the backend planner`
                : "Add a subject to generate today's plan"}
            </p>
          </div>
          <div className="p-6">
            {loading ? (
              <EmptyState message="Loading today's study plan..." />
            ) : dashboardData.todayPlan?.topics?.length ? (
              <div className="space-y-3">
                {dashboardData.todayPlan.topics.map((task) => (
                  <div key={task.topicId || task.name} className="flex items-start gap-4 rounded-xl border border-[#2a2b30] p-4 transition-colors hover:bg-[#25262b]/60">
                    <button
                      type="button"
                      onClick={() => handleLogTask(task)}
                      className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#9ca3af] transition hover:border-[#4ade80]"
                      aria-label={`Log study for ${task.name}`}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-[#e8e9eb]">{task.name}</div>
                      <div className="mt-1 text-sm text-[#9ca3af]">{dashboardData.focusSubject?.name}</div>
                    </div>
                    <span className="text-sm text-[#9ca3af]">{task.hours}h</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message={dashboardData.todayPlan?.message || "No pending topics are scheduled for today."} />
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#2a2b30] bg-[#18191d]">
          <div className="border-b border-[#2a2b30] p-6">
            <h2 className="text-xl font-semibold">Consistency</h2>
          </div>
          <div className="p-6">
            <div className="mb-6 text-center">
              <div className="mb-4 flex items-center justify-center">
                <div className="relative">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#4ade80]/10">
                    <Flame className="h-16 w-16 text-[#4ade80]" />
                  </div>
                  <div className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#4ade80] text-sm font-bold text-[#0f1115]">
                    {loading ? "..." : dashboardData.analytics.streak}
                  </div>
                </div>
              </div>
              <div className="mb-1 text-2xl font-semibold">{loading ? "Loading streak..." : `${dashboardData.analytics.streak} day streak`}</div>
              <div className="text-sm text-[#9ca3af]">Driven by your real study-log and analytics controllers.</div>
            </div>

            <div className="space-y-4 border-t border-[#2a2b30] pt-6">
              <MetricBar label="Weekly goal" value={`${dashboardData.analytics.weeklyHours.toFixed(1)} / ${weeklyGoalHours} hours`} percent={weeklyGoalPercent} />
              <MetricBar label="Completion rate" value={`${completionRate}%`} percent={completionRate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBar({ label, value, percent }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-[#9ca3af]">{label}</span>
        <span className="font-medium text-[#e8e9eb]">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#25262b]">
        <div className="h-full rounded-full bg-[#4ade80]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return <div className="rounded-xl border border-dashed border-[#2a2b30] bg-[#0f1115] px-5 py-8 text-sm text-[#9ca3af]">{message}</div>;
}
