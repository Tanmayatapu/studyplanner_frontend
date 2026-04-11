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
import { Link } from "react-router-dom";

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
  const [subjectProgress, setSubjectProgress] = useState({ totalTopics: 0, completedTopics: 0, progress: 0, hoursStudied: 0, hoursRemaining: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setDailyHoursInput(String(currentUser?.studyPreferences?.dailyStudyHours ?? 3));
  }, [currentUser?.studyPreferences?.dailyStudyHours]);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    loadPlanData(selectedSubjectId);
  }, [selectedSubjectId]);

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject._id === selectedSubjectId) ?? null,
    [selectedSubjectId, subjects]
  );

  const aggregateProgress = useMemo(() => {
    const totalTopics = subjects.reduce((sum, subject) => sum + subject.topicsTotal, 0);
    const completedTopics = subjects.reduce((sum, subject) => sum + subject.topicsDone, 0);
    const progress = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

    return {
      totalTopics,
      completedTopics,
      progress,
      hoursStudied: 0,
      hoursRemaining: 0,
    };
  }, [subjects]);

  const progressSummary = selectedSubjectId ? subjectProgress : aggregateProgress;
  const calendarStartDate = useMemo(() => addDays(startOfWeek(new Date()), weekOffset * 7), [weekOffset]);
  const displayedWeek = useMemo(
    () => buildDisplayedWeek(calendarStartDate, selectedSubject, generatedPlan, topicAccentMap),
    [calendarStartDate, selectedSubject, generatedPlan, topicAccentMap]
  );
  const selectedDay = displayedWeek.find((day) => day.key === selectedDayKey) ?? displayedWeek[0];
  const generatedSummary = useMemo(() => buildSummary(generatedPlan), [generatedPlan]);

  useEffect(() => {
    if (!displayedWeek.length) return;
    const todayKey = toDateKey(new Date());
    setSelectedDayKey(displayedWeek.some((day) => day.key === todayKey) ? todayKey : displayedWeek[0].key);
  }, [displayedWeek]);

  async function loadSubjects() {
    try {
      const subjectList = await getSubjects();
      const decorated = await Promise.all(
        subjectList.map(async (subject) => decorateSubject(subject, await getSubjectProgress(subject._id)))
      );
      setSubjects(decorated);
    } catch (loadError) {
      setError(loadError.response?.data?.message || loadError.message || "Unable to load study plan subjects");
    }
  }

  async function loadPlanData(subjectId) {
    setLoading(true);
    setError("");

    try {
      if (subjectId) {
        const [planData, todayData, progressData] = await Promise.all([
          getStudyPlan(subjectId),
          getTodayPlan(subjectId),
          getSubjectProgress(subjectId),
        ]);
        setGeneratedPlan(planData);
        setTodayFocus(todayData);
        setSubjectProgress(progressData);
      } else {
        const [planData, todayData] = await Promise.all([
          getStudyPlan(),
          getTodayPlan(),
        ]);
        setGeneratedPlan(planData);
        setTodayFocus(todayData);
        setSubjectProgress({ totalTopics: 0, completedTopics: 0, progress: 0, hoursStudied: 0, hoursRemaining: 0 });
      }
    } catch (loadError) {
      setGeneratedPlan(null);
      setTodayFocus(null);
      setError(loadError.response?.data?.message || loadError.message || "Unable to load study plan");
    } finally {
      setLoading(false);
    }
  }

  async function handleGeneratePlan() {
    try {
      await updatePreferences({ dailyStudyHours: Number(dailyHoursInput) });
      await loadPlanData(selectedSubjectId);
    } catch (generationError) {
      setError(generationError.response?.data?.message || generationError.message || "Unable to generate study plan");
    }
  }

  const planningLabel = selectedSubject ? selectedSubject.name : "All Subjects";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-semibold tracking-tight">Study Plan</h1>
          <p className="text-[#9ca3af]">Generate one combined, topic-wise roadmap from today until the exam dates, then regenerate it from real progress.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setWeekOffset((current) => current - 1)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#2a2b30] bg-[#18191d] text-[#9ca3af] transition hover:bg-[#25262b]"><ChevronLeft className="h-4 w-4" /></button>
          <div className="min-w-0 flex-1 rounded-xl border border-[#2a2b30] bg-[#18191d] px-4 py-2 text-center text-sm font-medium sm:flex-none">{displayedWeek.length ? formatWeekRange(displayedWeek[0].fullDate, displayedWeek[displayedWeek.length - 1].fullDate) : ""}</div>
          <button type="button" onClick={() => setWeekOffset((current) => current + 1)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#2a2b30] bg-[#18191d] text-[#9ca3af] transition hover:bg-[#25262b]"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      {error ? <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div> : null}
      {generatedPlan?.needsAttention ? <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">Your remaining workload is heavy for the available days. Increase daily hours or finish some topics faster to stay ahead of the exam.</div> : null}

      <section className="rounded-xl border border-[#2a2b30] bg-[#18191d] p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <FlowPanel title="Build Subject Inputs" description="Add exam date, priority, preferred slot, and topic estimates for each subject." />
          <FlowPanel title="Generate Daily Blocks" description="Create one day-wise plan that mixes subjects, splits large topics, and adds revision sessions." />
          <FlowPanel title="Review And Regenerate" description="At day end, check what was done or skipped so future days are rebuilt from the remaining work." />
        </div>
      </section>

      <section className="rounded-xl border border-[#2a2b30] bg-[#18191d] p-5 sm:p-6">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#4ade80]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#4ade80]"><Sparkles className="h-3.5 w-3.5" />Adaptive Planner</div>
            <h2 className="text-2xl font-semibold">Plan One Subject Or The Entire Syllabus</h2>
            <p className="mt-2 max-w-2xl text-sm text-[#9ca3af]">Choose one subject for a focused roadmap or switch to All Subjects to distribute daily blocks across your full syllabus until the exam dates.</p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#e8e9eb]">Planning Scope</span>
                <select value={selectedSubjectId} onChange={(event) => setSelectedSubjectId(event.target.value)} className="h-11 w-full rounded-xl border border-[#2a2b30] bg-[#0f1115] px-4 text-sm text-white outline-none transition focus:border-[#4ade80]">
                  <option value="">All Subjects</option>
                  {subjects.map((subject) => <option key={subject._id} value={subject._id}>{subject.name}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#e8e9eb]">Daily Study Hours</span>
                <input type="number" min="1" max="12" step="1" value={dailyHoursInput} onChange={(event) => setDailyHoursInput(event.target.value)} className="h-11 w-full rounded-xl border border-[#2a2b30] bg-[#0f1115] px-4 text-sm text-white outline-none transition focus:border-[#4ade80]" />
              </label>
            </div>

            <div className="mt-4 rounded-xl border border-[#2a2b30] bg-[#0f1115] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div>
                  <p className="text-sm font-medium text-white">{planningLabel}</p>
                  <p className="mt-1 text-sm text-[#9ca3af]">
                    {selectedSubject
                      ? `Exam: ${formatDate(selectedSubject.examDate)} · Preferred slot: ${selectedSubject.preferredStudySlotLabel}`
                      : `${subjects.length} subjects available for combined planning`}
                  </p>
                </div>
                <div className="text-sm sm:text-right">
                  <p className="font-semibold text-white">{progressSummary.completedTopics}/{progressSummary.totalTopics}</p>
                  <p className="text-[#9ca3af]">topics complete</p>
                </div>
              </div>
              {selectedSubject ? (
                <div className="mt-4 flex flex-col gap-2 border-t border-[#2a2b30] pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-[#9ca3af]">After studying, review this subject and keep skipped topics pending for the next roadmap.</p>
                  <Link to={`/subjects/${selectedSubject._id}`} className="inline-flex items-center gap-2 text-sm font-medium text-[#4ade80]">
                    Open daily review
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button type="button" onClick={handleGeneratePlan} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4ade80] px-5 py-3 text-sm font-semibold text-[#0f1115] transition hover:bg-[#62e68f] sm:w-auto"><Sparkles className="h-4 w-4" />Generate Study Plan</button>
              <span className="text-xs text-[#9ca3af]">Large topics are split across days, revision is added automatically, and unfinished work can be replanned.</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <LogicCard icon={Target} title="Priority Queue" description="Exam urgency, subject priority, and topic difficulty decide what should come first." />
            <LogicCard icon={Layers3} title="Topic Splitting" description="Long topics are spread over multiple days instead of creating one unrealistic session." />
            <LogicCard icon={AlarmClock} title="Revision Gaps" description="Study blocks automatically create later revision sessions to improve retention." />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border border-[#2a2b30] bg-[#18191d]">
          <div className="border-b border-[#2a2b30] p-5 sm:p-6">
            <h2 className="text-xl font-semibold">Generated Roadmap</h2>
            <p className="mt-1 text-sm text-[#9ca3af]">A combined day-wise plan from today until the exam window for the selected scope.</p>
          </div>
          <div className="p-5 sm:p-6">
            {loading ? <EmptyState message="Loading plan..." /> : generatedPlan?.plan?.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {generatedPlan.plan.map((day) => (
                  <div key={`${day.date}-${day.day}`} className="rounded-xl border border-[#2a2b30] bg-[#0f1115] p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-white">Day {day.day}</h3>
                        <p className="text-xs text-[#9ca3af]">{formatDate(day.date)} · {day.topics.length} sessions planned</p>
                      </div>
                      <div className="rounded-full bg-[#25262b] px-3 py-1 text-xs font-medium text-[#4ade80]">{day.topics.reduce((sum, topic) => sum + topic.hours, 0).toFixed(1)}h</div>
                    </div>
                    <div className="space-y-2">
                      {day.topics.map((topic, index) => (
                        <div key={`${day.day}-${index}-${topic.name}`} className={`rounded-lg border px-3 py-2 ${topicAccentMap[topic.type === "revision" ? "revision" : topic.difficulty || "medium"]}`}>
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-white">{topic.name}</p>
                              <p className="mt-1 text-xs text-white/70">{topic.subject}</p>
                            </div>
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
            <div className="border-b border-[#2a2b30] p-5 sm:p-6">
              <h2 className="text-xl font-semibold">Planner Summary</h2>
              <p className="mt-1 text-sm text-[#9ca3af]">Quick metrics based on the currently generated roadmap.</p>
            </div>
            <div className="space-y-4 p-5 sm:p-6">
              {generatedPlan?.plan?.length ? (
                <>
                  <SummaryRow label="Planning Scope" value={planningLabel} />
                  <SummaryRow label="Days In Window" value={generatedPlan.totalDays} />
                  <SummaryRow label="Daily Hours" value={`${generatedPlan.dailyHours}h`} />
                  <SummaryRow label="Completion" value={`${progressSummary.progress}%`} />
                  <SummaryRow label="Pending Topics" value={progressSummary.totalTopics - progressSummary.completedTopics} />
                  <SummaryRow label="Total Sessions" value={generatedSummary.totalSessions} />
                  <SummaryRow label="Revision Sessions" value={generatedSummary.revisionSessions} />
                  <SummaryRow label="Heaviest Day" value={generatedSummary.heaviestDay} />
                </>
              ) : <EmptyState message="Summary metrics appear here after the plan loads." compact />}
            </div>
          </section>

          <section className="rounded-xl border border-[#2a2b30] bg-[#18191d]">
            <div className="border-b border-[#2a2b30] p-5 sm:p-6">
              <h2 className="text-xl font-semibold">Today Focus</h2>
              <p className="mt-1 text-sm text-[#9ca3af]">Use this as today&apos;s direction, then answer at day end what you finished and what you skipped.</p>
            </div>
            <div className="p-5 sm:p-6">
              {todayFocus?.topics?.length ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">Day {todayFocus.day}</p>
                      <p className="text-sm text-[#9ca3af]">Planned study load: {todayFocus.totalHours?.toFixed ? todayFocus.totalHours.toFixed(1) : todayFocus.totalHours}h</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[#4ade80]" />
                  </div>
                  {todayFocus.topics.map((topic, index) => (
                    <div key={`${topic.name}-${index}`} className={`rounded-lg border px-3 py-3 ${topicAccentMap[topic.type === "revision" ? "revision" : topic.difficulty || "medium"]}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <span className="text-sm font-medium text-white">{topic.name}</span>
                          <p className="mt-1 text-xs text-white/70">{topic.subject}</p>
                        </div>
                        <span className="text-xs text-white/80">{topic.hours}h</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <EmptyState message={todayFocus?.message || "No topics left for today."} compact />}
            </div>
          </section>
        </div>
      </div>

      <section className="rounded-xl border border-[#2a2b30] bg-[#18191d] p-5 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Weekly Calendar</h2>
            <p className="mt-1 text-sm text-[#9ca3af]">A calendar view of the generated roadmap for the current week window.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm sm:gap-6">
            <div><span className="text-[#9ca3af]">Total hours: </span><span className="font-semibold">{displayedWeekHours(displayedWeek)}h</span></div>
            <div><span className="text-[#9ca3af]">Sessions: </span><span className="font-semibold">{displayedWeek.reduce((sum, item) => sum + item.sessions.length, 0)}</span></div>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="grid min-w-[840px] grid-cols-7 gap-4 xl:min-w-0 xl:grid-cols-7">
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
                        <div key={`${day.key}-${index}-${session.topic}`} className={`rounded-lg border p-3 transition ${session.card} ${isActive ? "ring-1 ring-[#4ade80]/30" : "opacity-75"}`}>
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
        </div>

        <div className="mt-8 rounded-xl border border-[#2a2b30] bg-[#0f1115] p-5">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <h3 className="text-sm font-semibold">Selected Day</h3>
            <p className="text-sm text-[#9ca3af]">{selectedDay?.day}, {selectedDay ? formatDate(selectedDay.fullDate) : ""}</p>
          </div>

          <div className="space-y-3 border-b border-[#2a2b30] pb-5">
            {selectedDay?.sessions?.length ? selectedDay.sessions.map((session, index) => (
              <div key={`${selectedDay.key}-selected-${index}-${session.topic}`} className={`rounded-xl border p-4 ${session.card}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div>
                    <div className="text-sm font-medium">{session.subject}</div>
                    <div className="mt-1 text-sm text-[#cbd5e1]">{session.topic}</div>
                  </div>
                  <div className="text-xs text-[#cbd5e1] sm:text-right">
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

function FlowPanel({ title, description }) {
  return (
    <div className="rounded-xl border border-[#2a2b30] bg-[#0f1115] p-4">
      <div className="font-semibold text-white">{title}</div>
      <p className="mt-2 text-sm text-[#9ca3af]">{description}</p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return <div className="flex items-center justify-between gap-4 text-sm"><span className="text-[#9ca3af]">{label}</span><span className="text-right font-medium text-white">{value}</span></div>;
}

function EmptyState({ message, compact = false }) {
  return <div className={`rounded-xl border border-dashed border-[#2a2b30] bg-[#0f1115] text-[#9ca3af] ${compact ? "px-4 py-5 text-sm" : "px-5 py-8 text-sm"}`}>{message}</div>;
}

function LegendItem({ color, label, icon: Icon }) {
  return <div className="flex items-center gap-3 rounded-lg border border-[#2a2b30] bg-[#18191d] px-3 py-3"><div className={`flex h-8 w-8 items-center justify-center rounded-full ${color}/15`}><Icon className="h-4 w-4 text-white" /></div><span className="text-sm text-[#e8e9eb]">{label}</span></div>;
}

function buildDisplayedWeek(startDate, selectedSubject, generatedPlan, topicAccentMap) {
  const sessionsByDate = new Map();

  if (generatedPlan?.plan?.length) {
    generatedPlan.plan.forEach((entry) => {
      const sessionDate = new Date(entry.date);
      const key = toDateKey(sessionDate);
      const currentSessions = sessionsByDate.get(key) ?? [];

      entry.topics.forEach((topic, index) => {
        currentSessions.push({
          subject: topic.subject || selectedSubject?.name || "Study Session",
          topic: topic.name,
          duration: `${topic.hours}h`,
          label: topic.type === "revision" ? "Revision block" : `Study block ${index + 1}`,
          card: topicAccentMap[topic.type === "revision" ? "revision" : topic.difficulty || "medium"],
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
  const revisionSessions = generatedPlan.plan.reduce((sum, day) => sum + day.topics.filter((topic) => topic.type === "revision").length, 0);
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
