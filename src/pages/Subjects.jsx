import { Calendar, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { createSubject, deleteSubject, getSubjects } from "../api/subjectService.js";
import { getSubjectProgress } from "../api/planService.jsx";
import { decorateSubject, formatDate } from "../services/subjectView.js";

const initialForm = {
  name: "",
  description: "",
  examDate: "",
  priority: "medium",
};

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = isAdding ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAdding]);

  useEffect(() => {
    loadSubjects();
  }, []);

  async function loadSubjects() {
    setLoading(true);
    setError("");

    try {
      const subjectList = await getSubjects();
      const decorated = await Promise.all(
        subjectList.map(async (subject) => decorateSubject(subject, await getSubjectProgress(subject._id)))
      );
      setSubjects(decorated);
    } catch (loadError) {
      setError(loadError.response?.data?.message || loadError.message || "Unable to load subjects");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim() || !form.examDate) {
      setError("Enter a subject name and exam date.");
      return;
    }

    try {
      await createSubject(form);
      setForm(initialForm);
      setIsAdding(false);
      await loadSubjects();
    } catch (submissionError) {
      setError(submissionError.response?.data?.message || submissionError.message || "Unable to create subject");
    }
  }

  async function handleDelete(subjectId) {
    try {
      await deleteSubject(subjectId);
      await loadSubjects();
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || deleteError.message || "Unable to delete subject");
    }
  }

  return (
    <div className="p-0">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-semibold tracking-tight">Subjects</h1>
          <p className="text-[#9ca3af]">Live subject list from `createSubject`, `getSubjects`, and `deleteSubject`.</p>
        </div>
        <button type="button" onClick={() => setIsAdding(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#4ade80] px-4 py-2.5 text-sm font-semibold text-[#0f1115] transition hover:bg-[#62e68f]">
          <Plus className="h-4 w-4" />
          Add Subject
        </button>
      </div>

      {error ? <div className="mb-6 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div> : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading ? <LoadingCard /> : subjects.map((subject) => (
          <div key={subject._id} className="group rounded-xl border border-[#2a2b30] bg-[#18191d] transition-all hover:border-[#4ade80]/50">
            <div className="p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg text-lg font-semibold ${subject.accent}`}>
                  {subject.code}
                </div>
                <button type="button" onClick={() => handleDelete(subject._id)} className="text-[#9ca3af] transition hover:text-rose-300" aria-label={`Delete ${subject.name}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold">{subject.name}</h3>
                <span className="rounded-full bg-[#25262b] px-2.5 py-1 text-xs font-medium capitalize text-[#9ca3af]">{subject.priority}</span>
              </div>

              <div className="mb-4 flex items-center gap-2 text-sm text-[#9ca3af]">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(subject.examDate)} · {subject.examIn} days left</span>
              </div>

              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-[#9ca3af]">Progress</span>
                  <span className="font-medium">{subject.topicsDone}/{subject.topicsTotal} topics</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#25262b]">
                  <div className="h-full rounded-full bg-[#4ade80]" style={{ width: `${subject.progress}%` }} />
                </div>
              </div>

              <Link to={`/subjects/${subject._id}`} className="flex w-full items-center justify-center rounded-xl border border-[#2a2b30] py-2.5 text-sm font-semibold transition-all group-hover:border-[#4ade80] group-hover:bg-[#4ade80] group-hover:text-[#0f1115]">
                View Topics
              </Link>
            </div>
          </div>
        ))}

        <button type="button" onClick={() => setIsAdding(true)} className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#2a2b30] bg-[#18191d] transition-all hover:border-[#4ade80]/50 hover:bg-[#25262b]/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4ade80]/10">
            <Plus className="h-6 w-6 text-[#4ade80]" />
          </div>
          <div className="font-medium">Add New Subject</div>
          <p className="text-sm text-[#9ca3af]">Name, description, exam date, and priority</p>
        </button>
      </div>

      {isAdding ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" onClick={() => setIsAdding(false)}>
          <form onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()} className="w-full max-w-[560px] overflow-hidden rounded-2xl border border-[#2a2b30] bg-[#18191d] shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-[#2a2b30] px-7 py-6">
              <h3 className="text-2xl font-semibold">Add New Subject</h3>
              <button type="button" onClick={() => setIsAdding(false)} className="text-[#9ca3af] transition hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 px-7 py-6">
              <Field label="Subject Name" name="name" value={form.name} setForm={setForm} placeholder="e.g., Calculus III" />
              <Field label="Description" name="description" value={form.description} setForm={setForm} placeholder="Short overview of the subject" />
              <Field label="Exam Date" name="examDate" value={form.examDate} setForm={setForm} type="date" />
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#e8e9eb]">Priority</span>
                <select name="priority" value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))} className="h-11 w-full rounded-xl border border-[#2a2b30] bg-[#0f1115] px-4 text-sm text-white outline-none transition focus:border-[#4ade80]">
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </label>

              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                <button type="submit" className="rounded-xl bg-[#4ade80] px-5 py-3 text-sm font-semibold text-[#0f1115] transition hover:bg-[#62e68f]">Add Subject</button>
                <button type="button" onClick={() => setIsAdding(false)} className="rounded-xl border border-[#2a2b30] bg-[#25262b] px-5 py-3 text-sm font-semibold text-[#e8e9eb] transition hover:bg-[#2f3138]">Cancel</button>
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

function LoadingCard() {
  return <div className="min-h-[300px] rounded-xl border border-[#2a2b30] bg-[#18191d]" />;
}
