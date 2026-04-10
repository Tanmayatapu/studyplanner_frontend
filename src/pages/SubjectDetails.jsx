import { ArrowLeft, Calendar, Check, Circle, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getSubjects } from "../api/subjectService.js";
import { createTopic, deleteTopic, getTopicsBySubject, markTopicComplete } from "../api/topicService.js";
import { logStudy } from "../api/studyLogService.js";
import { getSubjectProgress } from "../api/planService.jsx";
import { useApp } from "../context/AuthContext";
import { decorateSubject, formatDate } from "../services/subjectView.js";

const initialTopicForm = {
  name: "",
  difficulty: "medium",
  estimatedHours: "2",
};

export default function SubjectDetails() {
  const { subjectId } = useParams();
  const { topicAccentMap } = useApp();
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [progress, setProgress] = useState({ totalTopics: 0, completedTopics: 0, progress: 0 });
  const [loading, setLoading] = useState(true);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [isLoggingStudy, setIsLoggingStudy] = useState(false);
  const [topicForm, setTopicForm] = useState(initialTopicForm);
  const [logForm, setLogForm] = useState({});
  const [error, setError] = useState("");
  const [logError, setLogError] = useState("");
  const [logSuccess, setLogSuccess] = useState("");

  useEffect(() => {
    document.body.style.overflow = isAddingTopic || isLoggingStudy ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAddingTopic, isLoggingStudy]);

  useEffect(() => {
    loadSubjectDetails();
  }, [subjectId]);

  useEffect(() => {
    if (!isLoggingStudy) return;

    const nextState = {};
    topics.forEach((topic) => {
      nextState[topic._id] = { hours: 0, completed: topic.isCompleted };
    });
    setLogForm(nextState);
    setLogError("");
    setLogSuccess("");
  }, [isLoggingStudy, topics]);

  const subjectView = useMemo(() => subject ? decorateSubject(subject, progress) : null, [progress, subject]);

  async function loadSubjectDetails() {
    setLoading(true);
    setError("");

    try {
      const subjects = await getSubjects();
      const foundSubject = subjects.find((item) => item._id === subjectId);

      if (!foundSubject) {
        throw new Error("Subject not found");
      }

      const [topicList, progressData] = await Promise.all([
        getTopicsBySubject(subjectId),
        getSubjectProgress(subjectId),
      ]);

      setSubject(foundSubject);
      setTopics(topicList);
      setProgress(progressData);
    } catch (loadError) {
      setError(loadError.response?.data?.message || loadError.message || "Unable to load subject details");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTopic(event) {
    event.preventDefault();

    try {
      await createTopic({ ...topicForm, subject: subjectId, estimatedHours: Number(topicForm.estimatedHours) });
      setTopicForm(initialTopicForm);
      setIsAddingTopic(false);
      await loadSubjectDetails();
    } catch (submissionError) {
      setError(submissionError.response?.data?.message || submissionError.message || "Unable to create topic");
    }
  }

  async function handleComplete(topicId) {
    try {
      await markTopicComplete(topicId);
      await loadSubjectDetails();
    } catch (actionError) {
      setError(actionError.response?.data?.message || actionError.message || "Unable to mark topic complete");
    }
  }

  async function handleDeleteTopic(topicId) {
    try {
      await deleteTopic(topicId);
      await loadSubjectDetails();
    } catch (actionError) {
      setError(actionError.response?.data?.message || actionError.message || "Unable to delete topic");
    }
  }

  async function handleLogStudy(event) {
    event.preventDefault();

    const selectedTopics = topics
      .filter((topic) => Number(logForm[topic._id]?.hours) > 0)
      .map((topic) => ({
        topicId: topic._id,
        hours: Number(logForm[topic._id].hours),
        completed: Boolean(logForm[topic._id].completed),
      }));

    try {
      await logStudy({ subjectId, topics: selectedTopics });
      setLogSuccess("Study session logged successfully.");
      setLogError("");
      await loadSubjectDetails();
      window.setTimeout(() => setIsLoggingStudy(false), 600);
    } catch (submissionError) {
      setLogError(submissionError.response?.data?.message || submissionError.message || "Unable to save study log");
      setLogSuccess("");
    }
  }

  if (loading) {
    return <div className="rounded-xl border border-[#2a2b30] bg-[#18191d] p-8 text-sm text-[#9ca3af]">Loading subject details...</div>;
  }

  if (!subjectView) {
    return <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-8 text-sm text-rose-300">{error || "Subject not found"}</div>;
  }

  return (
    <div className="space-y-8">
      <Link to="/subjects" className="inline-flex items-center gap-3 text-sm font-medium text-[#9ca3af] transition hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Back to Subjects
      </Link>

      {error ? <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div> : null}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-5">
          <div className={`flex h-[72px] w-[72px] items-center justify-center rounded-2xl text-[2rem] font-semibold ${subjectView.accent}`}>
            {subjectView.code}
          </div>

          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">{subjectView.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#9ca3af]">
              <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" /> Exam: {formatDate(subjectView.examDate)}</span>
              <span>•</span>
              <span>{progress.completedTopics}/{progress.totalTopics} topics completed</span>
              <span>•</span>
              <span className="capitalize">Priority: {subjectView.priority}</span>
            </div>
            <p className="mt-3 max-w-2xl text-sm text-[#9ca3af]">{subjectView.description || "No description provided."}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => setIsLoggingStudy(true)} className="inline-flex items-center gap-2 rounded-xl border border-[#2a2b30] bg-[#0f1115] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-[#4ade80]/50">
            <Save className="h-4 w-4" />
            Log Study
          </button>
          <button type="button" onClick={() => setIsAddingTopic(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#4ade80] px-4 py-2.5 text-sm font-semibold text-[#0f1115] transition hover:bg-[#62e68f]">
            <Plus className="h-4 w-4" />
            Add Topic
          </button>
        </div>
      </div>

      <section className="rounded-xl border border-[#2a2b30] bg-[#18191d] p-7">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Overall Progress</h2>
          <span className="text-3xl font-semibold">{progress.progress}%</span>
        </div>
        <div className="mt-6 h-4 overflow-hidden rounded-full bg-[#234535]">
          <div className="h-full rounded-full bg-[#4ade80]" style={{ width: `${progress.progress}%` }} />
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-[#9ca3af]">
          <span>{progress.completedTopics} completed</span>
          <span>{progress.totalTopics - progress.completedTopics} remaining</span>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[#2a2b30] bg-[#18191d]">
        <div className="border-b border-[#2a2b30] px-7 py-7">
          <h2 className="text-xl font-semibold">Topics</h2>
          <p className="mt-2 text-sm text-[#9ca3af]">Live data from topic and study-log controllers.</p>
        </div>

        <div>
          {topics.length === 0 ? (
            <div className="px-7 py-8 text-sm text-[#9ca3af]">No topics yet. Add your first topic to start planning.</div>
          ) : topics.map((topic, index) => (
            <div key={topic._id} className={`flex items-center justify-between gap-4 px-7 py-8 ${index === topics.length - 1 ? "" : "border-b border-[#2a2b30]"}`}>
              <div className="flex items-center gap-5">
                <button type="button" onClick={() => handleComplete(topic._id)} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition ${topic.isCompleted ? "border-[#4ade80] text-[#4ade80]" : "border-[#94a3b8] text-[#94a3b8] hover:border-[#4ade80] hover:text-[#4ade80]"}`}>
                  {topic.isCompleted ? <Check className="h-4 w-4" /> : <Circle className="h-3.5 w-3.5" />}
                </button>

                <div>
                  <h3 className={`text-lg font-medium ${topic.isCompleted ? "text-[#cbd5e1] line-through" : "text-white"}`}>{topic.name}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className={`rounded-full px-2.5 py-1 font-medium capitalize ${topicAccentMap[topic.difficulty]}`}>{topic.difficulty}</span>
                    <span className="rounded-full bg-[#25262b] px-2.5 py-1 text-[#9ca3af]">Estimated: {topic.estimatedHours}h</span>
                  </div>
                </div>
              </div>

              <div className="flex w-10 justify-end">
                <button type="button" onClick={() => handleDeleteTopic(topic._id)} className="text-amber-400 transition hover:text-amber-300" aria-label={`Delete ${topic.name}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {isAddingTopic ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" onClick={() => setIsAddingTopic(false)}>
          <form onSubmit={handleAddTopic} onClick={(event) => event.stopPropagation()} className="w-full max-w-[510px] overflow-hidden rounded-2xl border border-[#2a2b30] bg-[#18191d] shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-[#2a2b30] px-7 py-6">
              <h3 className="text-2xl font-semibold">Add Topic</h3>
              <button type="button" onClick={() => setIsAddingTopic(false)} className="text-[#9ca3af] transition hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-5 px-7 py-6">
              <Field label="Topic Name" name="name" value={topicForm.name} setForm={setTopicForm} placeholder="e.g., Graph Algorithms" />
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#e8e9eb]">Difficulty</span>
                <select name="difficulty" value={topicForm.difficulty} onChange={(event) => setTopicForm((current) => ({ ...current, difficulty: event.target.value }))} className="h-11 w-full rounded-xl border border-[#2a2b30] bg-[#0f1115] px-4 text-sm text-white outline-none transition focus:border-[#4ade80]">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </label>
              <Field label="Estimated Hours" name="estimatedHours" type="number" value={topicForm.estimatedHours} setForm={setTopicForm} placeholder="2" />

              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                <button type="submit" className="rounded-xl bg-[#4ade80] px-5 py-3 text-sm font-semibold text-[#0f1115] transition hover:bg-[#62e68f]">Add Topic</button>
                <button type="button" onClick={() => setIsAddingTopic(false)} className="rounded-xl border border-[#2a2b30] bg-[#25262b] px-5 py-3 text-sm font-semibold text-[#e8e9eb] transition hover:bg-[#2f3138]">Cancel</button>
              </div>
            </div>
          </form>
        </div>
      ) : null}

      {isLoggingStudy ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" onClick={() => setIsLoggingStudy(false)}>
          <form onSubmit={handleLogStudy} onClick={(event) => event.stopPropagation()} className="w-full max-w-[680px] overflow-hidden rounded-2xl border border-[#2a2b30] bg-[#18191d] shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-[#2a2b30] px-7 py-6">
              <div>
                <h3 className="text-2xl font-semibold">Log Study Session</h3>
                <p className="mt-1 text-sm text-[#9ca3af]">Sends `subjectId` and `topics[]` to the backend just like your controller expects.</p>
              </div>
              <button type="button" onClick={() => setIsLoggingStudy(false)} className="text-[#9ca3af] transition hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4 px-7 py-6">
              {topics.map((topic) => (
                <div key={topic._id} className="grid gap-4 rounded-xl border border-[#2a2b30] bg-[#0f1115] p-4 md:grid-cols-[1.4fr_0.8fr_0.8fr] md:items-center">
                  <div>
                    <p className="font-medium text-white">{topic.name}</p>
                    <p className="mt-1 text-sm text-[#9ca3af]">Estimated {topic.estimatedHours}h · {topic.difficulty}</p>
                  </div>
                  <label className="block">
                    <span className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-[#9ca3af]">Hours</span>
                    <input type="number" min="0" step="0.5" value={logForm[topic._id]?.hours ?? 0} onChange={(event) => setLogForm((current) => ({ ...current, [topic._id]: { ...current[topic._id], hours: event.target.value } }))} className="h-11 w-full rounded-xl border border-[#2a2b30] bg-[#18191d] px-4 text-sm text-white outline-none transition focus:border-[#4ade80]" />
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-[#2a2b30] bg-[#18191d] px-4 py-3 text-sm text-white">
                    <input type="checkbox" checked={Boolean(logForm[topic._id]?.completed)} onChange={(event) => setLogForm((current) => ({ ...current, [topic._id]: { ...current[topic._id], completed: event.target.checked } }))} className="h-4 w-4 accent-[#4ade80]" />
                    Mark completed
                  </label>
                </div>
              ))}

              {logError ? <p className="text-sm text-rose-400">{logError}</p> : null}
              {logSuccess ? <p className="text-sm text-[#4ade80]">{logSuccess}</p> : null}

              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                <button type="submit" className="rounded-xl bg-[#4ade80] px-5 py-3 text-sm font-semibold text-[#0f1115] transition hover:bg-[#62e68f]">Save Study Log</button>
                <button type="button" onClick={() => setIsLoggingStudy(false)} className="rounded-xl border border-[#2a2b30] bg-[#25262b] px-5 py-3 text-sm font-semibold text-[#e8e9eb] transition hover:bg-[#2f3138]">Cancel</button>
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, name, value, setForm, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#e8e9eb]">{label}</span>
      <input type={type} name={name} value={value} onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))} placeholder={placeholder} className="h-11 w-full rounded-xl border border-[#2a2b30] bg-[#0f1115] px-4 text-sm text-white outline-none transition placeholder:text-[#6b7280] focus:border-[#4ade80]" />
    </label>
  );
}
