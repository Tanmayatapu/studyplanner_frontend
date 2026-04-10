import {
  AlarmClock,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers3,
  Sparkles,
  Target,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getSubjects } from "../api/subjectService.js";
import { getStudyPlan, getTodayPlan, getSubjectProgress } from "../api/planService.jsx";
import { useApp } from "../context/AuthContext";
import { decorateSubject, formatDate } from "../services/subjectView.js";

export default function StudyPlan() {
  const { currentUser, topicAccentMap, updatePreferences } = useApp();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [dailyHoursInput, setDailyHoursInput] = useState(String(currentUser?.studyPreferences?.dailyStudyHours ?? 3));
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDayKey, setSelectedDayKey] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [todayFocus, setTodayFocus] = useState(null);
  const [subjectProgress, setSubjectProgress] = useState({ totalTopics: 0, completedTopics: 0, progress: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setDailyHoursInput(String(currentUser?.studyPreferences?.dailyStudyHours ?? 3));
  }, [currentUser?.studyPreferences?.dailyStudyHours]);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (!selectedSubjectId) return;
    loadPlanData(selectedSubjectId);
  }, [selectedSubjectId]);

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject._id === selectedSubjectId) ?? subjects[0],
    [selectedSubjectId, subjects]
  );

  const calendarStartDate = useMemo(() => addDays(startOfWeek(new Date()), weekOffset * 7), [weekOffset]);
  const displayedWeek = useMemo(() => buildDisplayedWeek(calendarStartDate, selectedSubject, generatedPlan, topicAccentMap), [calendarStartDate, selectedSubject, generatedPlan, topicAccentMap]);
  const selectedDay = displayedWeek.find((day) => day.key === selectedDayKey) ?? displayedWeek[0];
  const generatedSummary = useMemo(() => buildSummary(generatedPlan), [generatedPlan]);

  useEffect(() => {
    if (!displayedWeek.length) return;
    const todayKey = toDateKey(new Date());
    setSelectedDayKey(displayedWeek.some((day) => day.key === todayKey) ? todayKey : displayedWeek[0].key);
  }, [displayedWeek]);

  async function loadSubjects() {
    setLoading(true);
    setError("");

    try {
      const subjectList = await getSubjects();
      const decorated = await Promise.all(
        subjectList.map(async (subject) => decorateSubject(subject, await getSubjectProgress(subject._id)))
      );
      setSubjects(decorated);
      if (decorated.length > 0) {
        setSelectedSubjectId((current) => current || decorated[0]._id);
      }
    } catch (loadError) {
      setError(loadError.response?.data?.message || loadError.message || "Unable to load study plan subjects");
    } finally {
      setLoading(false);
    }
  }

  async function loadPlanData(subjectId) {
    setLoading(true);
    setError("");

    try {
      const [planData, todayData, progressData] = await Promise.all([
        getStudyPlan(subjectId),
        getTodayPlan(subjectId),
        getSubjectProgress(subjectId),
      ]);
      setGeneratedPlan(planData);
      setTodayFocus(todayData);
      setSubjectProgress(progressData);
    } catch (loadError) {
      setGeneratedPlan(null);
      setTodayFocus(null);
      setError(loadError.response?.data?.message || loadError.message || "Unable to load study plan");
    } finally {
      setLoading(false);
    }
  }

  async function handleGeneratePlan() {
    if (!selectedSubjectId) return;

    try {
      await updatePreferences({ dailyStudyHours: Number(dailyHoursInput) });
      await loadPlanData(selectedSubjectId);
    } catch (generationError) {
      setError(generationError.response?.data?.message || generationError.message || "Unable to generate study plan");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-semibold tracking-tight">Study Plan</h1>
          <p className="text-[#9ca3af]">Live plan, progress, and today-focus data from the backend.</p>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setWeekOffset((current) => current - 1)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#2a2b30] bg-[#18191d] text-[#9ca3af] transition hover:bg-[#25262b]"><ChevronLeft className="h-4 w-4" /></button>
          <div className="rounded-xl border border-[#2a2b30] bg-[#18191d] px-4 py-2 text-sm font-medium">{displayedWeek.length ? formatWeekRange(displayedWeek[0].fullDate, displayedWeek[displayedWeek.length - 1].fullDate) : ""}</div>
          <button type="button" onClick={() => setWeekOffset((current) => current + 1)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#2a2b30] bg-[#18191d] text-[#9ca3af] transition hover:bg-[#25262b]"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      {error ? <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div> : null}

      <section className="rounded-xl border border-[#2a2b30] bg-[#18191d] p-6">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#4ade80]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#4ade80]"><Sparkles className="h-3.5 w-3.5" />Generate Study Plan</div>
            <h2 className="text-2xl font-semibold">Adaptive Planner</h2>
            <p className="mt-2 max-w-2xl text-sm text-[#9ca3af]">This view uses your backend planner rules for priority, topic splitting, revision gaps, and today-focus recommendations.</p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#e8e9eb]">Subject</span>
                <select value={selectedSubjectId} onChange={(event) => setSelectedSubjectId(event.target.value)} className="h-11 w-full rounded-xl border border-[#2a2b30] bg-[#0f1115] px-4 text-sm text-white outline-none transition focus:border-[#4ade80]">
                  {subjects.map((subject) => <option key={subject._id} value={subject._id}>{subject.name}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#e8e9eb]">Daily Study Hours</span>
                <input type="number" min="1" max="12" step="1" value={dailyHoursInput} onChange={(event) => setDailyHoursInput(event.target.value)} className="h-11 w-full rounded-xl border border-[#2a2b30] bg-[#0f1115] px-4 text-sm text-white outline-none transition focus:border-[#4ade80]" />
              </label>
            </div>

            {selectedSubject ? (
              <div className="mt-4 rounded-xl border border-[#2a2b30] bg-[#0f1115] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-white">{selectedSubject.name}</p>
                    <p className="mt-1 text-sm text-[#9ca3af]">Exam: {formatDate(selectedSubject.examDate)}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold text-white">{subjectProgress.completedTopics}/{subjectProgress.totalTopics}</p>
                    <p className="text-[#9ca3af]">topics complete</p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex items-center gap-3">
              <button type="button" onClick={handleGeneratePlan} className="inline-flex items-center gap-2 rounded-xl bg-[#4ade80] px-5 py-3 text-sm font-semibold text-[#0f1115] transition hover:bg-[#62e68f]"><Sparkles className="h-4 w-4" />Generate Study Plan</button>
              <span className="text-xs text-[#9ca3af]">Priority = difficulty + urgency + missed days</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <LogicCard icon={Target} title="Priority Queue" description="Hard topics and urgent exams are scheduled first." />
            <LogicCard icon={Layers3} title="Topic Splitting" description="Long topics are split across days by your saved study-hour limit." />
            <LogicCard icon={AlarmClock} title="Revision Gaps" description="Revision sessions are inserted automatically based on difficulty." />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border border-[#2a2b30] bg-[#18191d]">
          <div className="border-b border-[#2a2b30] p-6">
            <h2 className="text-xl font-semibold">Generated Roadmap</h2>
            <p className="mt-1 text-sm text-[#9ca3af]">Direct output from `GET /api/study-plan/:subjectId`.</p>
          </div>
          <div className="p-6">
            {loading ? <EmptyState message="Loading plan..." /> : generatedPlan?.plan?.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {generatedPlan.plan.map((day) => (
                  <div key={day.day} className="rounded-xl border border-[#2a2b30] bg-[#0f1115] p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">Day {day.day}</h3>
                        <p className="text-xs text-[#9ca3af]">{day.topics.length} sessions planned</p>
                      </div>
                      <div className="rounded-full bg-[#25262b] px-3 py-1 text-xs font-medium text-[#4ade80]">{day.topics.reduce((sum, topic) => sum + topic.hours, 0).toFixed(1)}h</div>
                    </div>
                    <div className="space-y-2">
                      {day.topics.map((topic, index) => (
                        <div key={`${day.day}-${index}`} className={`rounded-lg border px-3 py-2 ${topicAccentMap[topic.type === "revision" ? "revision" : topic.difficulty || "medium"]}`}>
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-white">{topic.name}</p>
                            <span className="text-xs text-white/80">{topic.hours}h</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : <EmptyState message={generatedPlan?.message || "No plan generated yet."} />}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border border-[#2a2b30] bg-[#18191d]">
            <div className="border-b border-[#2a2b30] p-6">
              <h2 className="text-xl font-semibold">Planner Summary</h2>
              <p className="mt-1 text-sm text-[#9ca3af]">Quick outputs from the generated plan.</p>
            </div>
            <div className="space-y-4 p-6">
              {generatedPlan?.plan?.length ? (
                <>
                  <SummaryRow label="Days Until Exam" value={generatedPlan.totalDays} />
                  <SummaryRow label="Daily Hours" value={`${generatedPlan.dailyHours}h`} />
                  <SummaryRow label="Completion" value={`${subjectProgress.progress}%`} />
                  <SummaryRow label="Pending Topics" value={subjectProgress.totalTopics - subjectProgress.completedTopics} />
                  <SummaryRow label="Total Sessions" value={generatedSummary.totalSessions} />
                  <SummaryRow label="Revision Sessions" value={generatedSummary.revisionSessions} />
                  <SummaryRow label="Heaviest Day" value={generatedSummary.heaviestDay} />
                </>
              ) : <EmptyState message="Summary metrics appear here after the plan loads." compact />}
            </div>
          </section>

          <section className="rounded-xl border border-[#2a2b30] bg-[#18191d]">
            <div className="border-b border-[#2a2b30] p-6">
              <h2 className="text-xl font-semibold">Today Focus</h2>
              <p className="mt-1 text-sm text-[#9ca3af]">Direct output from `GET /api/study-plan/today/:subjectId`.</p>
            </div>
            <div className="p-6">
              {todayFocus?.topics?.length ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">Day {todayFocus.day}</p>
                      <p className="text-sm text-[#9ca3af]">Recommended first study block</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#4ade80]" />
                  </div>
                  {todayFocus.topics.map((topic, index) => (
                    <div key={`${topic.name}-${index}`} className={`rounded-lg border px-3 py-3 ${topicAccentMap[topic.difficulty || "medium"]}`}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-white">{topic.name}</span>
                        <span className="text-xs text-white/80">{topic.hours}h</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <EmptyState message={todayFocus?.message || "No topics left for this subject today."} compact />}
            </div>
          </section>
        </div>
      </div>

      <section className="rounded-xl border border-[#2a2b30] bg-[#18191d] p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Weekly Calendar</h2>
            <p className="mt-1 text-sm text-[#9ca3af]">Calendar view generated from the current backend plan.</p>
          </div>
          <div className="flex gap-6 text-sm">
            <div><span className="text-[#9ca3af]">Total hours: </span><span className="font-semibold">{displayedWeekHours(displayedWeek)}h</span></div>
            <div><span className="text-[#9ca3af]">Sessions: </span><span className="font-semibold">{displayedWeek.reduce((sum, item) => sum + item.sessions.length, 0)}</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-7">
          {displayedWeek.map((day) => {
            const isActive = day.key === selectedDayKey;
            return (
              <div key={day.key} className="min-w-0">
                <button type="button" onClick={() => setSelectedDayKey(day.key)} className={`mb-4 w-full border-b pb-3 text-center transition ${isActive ? "border-[#4ade80]" : "border-[#2a2b30] hover:border-[#4ade80]/50"}`}>
                  <div className="mb-1 text-sm text-[#9ca3af]">{day.day}</div>
                  <div className={`text-2xl font-semibold ${isActive ? "text-[#4ade80]" : "text-white"}`}>{day.fullDate.getDate()}</div>
                </button>
                {day.sessions.length ? (
                  <div className="space-y-3">
                    {day.sessions.map((session, index) => (
                      <div key={`${day.key}-${index}`} className={`rounded-lg border p-3 transition ${session.card} ${isActive ? "ring-1 ring-[#4ade80]/30" : "opacity-75"}`}>
                        <div className="mb-1 text-sm font-medium">{session.subject}</div>
                        <div className="mb-2 text-xs text-[#cbd5e1]">{session.topic}</div>
                        <div className="flex items-center justify-between text-xs text-[#cbd5e1]">
                          <span>{session.label}</span>
                          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {session.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <div className="rounded-lg border border-dashed border-[#2a2b30] bg-[#0f1115] px-3 py-6 text-center text-xs text-[#6b7280]">No sessions</div>}
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-xl border border-[#2a2b30] bg-[#0f1115] p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold">Selected Day</h3>
            <p className="text-sm text-[#9ca3af]">{selectedDay?.day}, {selectedDay ? formatDate(selectedDay.fullDate) : ""}</p>
          </div>

          <div className="space-y-3 border-b border-[#2a2b30] pb-5">
            {selectedDay?.sessions?.length ? selectedDay.sessions.map((session, index) => (
              <div key={`${selectedDay.key}-selected-${index}`} className={`rounded-xl border p-4 ${session.card}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium">{session.subject}</div>
                    <div className="mt-1 text-sm text-[#cbd5e1]">{session.topic}</div>
                  </div>
                  <div className="text-right text-xs text-[#cbd5e1]">
                    <div>{session.label}</div>
                    <div className="mt-1 inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {session.duration}</div>
                  </div>
                </div>
              </div>
            )) : <div className="rounded-xl border border-dashed border-[#2a2b30] bg-[#18191d] px-4 py-6 text-sm text-[#9ca3af]">No sessions are scheduled for this day yet.</div>}
          </div>

          <h3 className="mb-4 mt-5 text-sm font-semibold">Calendar Legend</h3>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <LegendItem color="bg-[#4ade80]" label="Active Day" icon={CalendarDays} />
            <LegendItem color="bg-amber-400" label="Revision Session" icon={CheckCircle2} />
            <LegendItem color="bg-blue-400" label="Study Block" icon={Clock} />
          </div>
        </div>
      </section>
    </div>
  );
}

function LogicCard({ icon: Icon, title, description }) {
  return <div className="rounded-xl border border-[#2a2b30] bg-[#0f1115] p-4"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#4ade80]/10"><Icon className="h-5 w-5 text-[#4ade80]" /></div><h3 className="font-semibold text-white">{title}</h3><p className="mt-1 text-sm text-[#9ca3af]">{description}</p></div>;
}

function SummaryRow({ label, value }) {
  return <div className="flex items-center justify-between text-sm"><span className="text-[#9ca3af]">{label}</span><span className="font-medium text-white">{value}</span></div>;
}

function EmptyState({ message, compact = false }) {
  return <div className={`rounded-xl border border-dashed border-[#2a2b30] bg-[#0f1115] text-[#9ca3af] ${compact ? "px-4 py-5 text-sm" : "px-5 py-8 text-sm"}`}>{message}</div>;
}

function LegendItem({ color, label, icon: Icon }) {
  return <div className="flex items-center gap-3 rounded-lg border border-[#2a2b30] bg-[#18191d] px-3 py-3"><div className={`flex h-8 w-8 items-center justify-center rounded-full ${color}/15`}><Icon className="h-4 w-4 text-white" /></div><span className="text-sm text-[#e8e9eb]">{label}</span></div>;
}

function buildDisplayedWeek(startDate, selectedSubject, generatedPlan, topicAccentMap) {
  const sessionsByDate = new Map();
  const subjectName = selectedSubject?.name ?? "Study Session";
  const planStart = startOfDay(new Date());

  if (generatedPlan?.plan?.length) {
    generatedPlan.plan.forEach((entry) => {
      const sessionDate = addDays(planStart, entry.day - 1);
      const key = toDateKey(sessionDate);
      const currentSessions = sessionsByDate.get(key) ?? [];

      entry.topics.forEach((topic, index) => {
        currentSessions.push({
          subject: subjectName,
          topic: topic.name,
          duration: `${topic.hours}h`,
          label: topic.name.startsWith("Revision:") ? "Revision block" : `Study block ${index + 1}`,
          card: topicAccentMap[topic.name.startsWith("Revision:") ? "revision" : topic.difficulty || "medium"],
        });
      });

      sessionsByDate.set(key, currentSessions);
    });
  }

  return Array.from({ length: 7 }, (_, index) => {
    const fullDate = addDays(startDate, index);
    const key = toDateKey(fullDate);
    return { key, day: fullDate.toLocaleString("en-US", { weekday: "short" }), fullDate, sessions: sessionsByDate.get(key) ?? [] };
  });
}

function buildSummary(generatedPlan) {
  if (!generatedPlan?.plan?.length) return { totalSessions: 0, revisionSessions: 0, heaviestDay: "N/A" };
  const totalSessions = generatedPlan.plan.reduce((sum, day) => sum + day.topics.length, 0);
  const revisionSessions = generatedPlan.plan.reduce((sum, day) => sum + day.topics.filter((topic) => topic.name.startsWith("Revision:")).length, 0);
  const heaviest = generatedPlan.plan.reduce((best, day) => (day.topics.length > best.topics.length ? day : best), generatedPlan.plan[0]);
  return { totalSessions, revisionSessions, heaviestDay: heaviest ? `Day ${heaviest.day}` : "N/A" };
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function startOfDay(date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function startOfWeek(date) {
  const nextDate = startOfDay(date);
  const day = nextDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(nextDate, diff);
}

function toDateKey(date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

function formatWeekRange(startDate, endDate) {
  const startMonth = startDate.toLocaleString("en-US", { month: "long" });
  const endMonth = endDate.toLocaleString("en-US", { month: "long" });
  if (startMonth === endMonth) return `${startMonth} ${startDate.getDate()}-${endDate.getDate()}, ${endDate.getFullYear()}`;
  return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}, ${endDate.getFullYear()}`;
}

function displayedWeekHours(week) {
  return week.flatMap((day) => day.sessions).reduce((sum, session) => sum + Number.parseFloat(session.duration), 0).toFixed(1);
}
