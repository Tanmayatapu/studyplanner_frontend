import { Clock3, Mail, Save, User } from "lucide-react";
import { useEffect, useState } from "react";

import { useApp } from "../context/AuthContext";

export default function Settings() {
  const { currentUser, updatePreferences } = useApp();
  const [form, setForm] = useState({
    dailyStudyHours: currentUser?.studyPreferences?.dailyStudyHours ?? 3,
    breakTime: currentUser?.studyPreferences?.breakTime ?? 10,
    preferredStudyTime: currentUser?.studyPreferences?.preferredStudyTime ?? "evening",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      dailyStudyHours: currentUser?.studyPreferences?.dailyStudyHours ?? 3,
      breakTime: currentUser?.studyPreferences?.breakTime ?? 10,
      preferredStudyTime: currentUser?.studyPreferences?.preferredStudyTime ?? "evening",
    });
  }, [currentUser]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    try {
      await updatePreferences({
        dailyStudyHours: Number(form.dailyStudyHours),
        breakTime: Number(form.breakTime),
        preferredStudyTime: form.preferredStudyTime,
      });
      setMessage("Preferences updated");
      setError("");
    } catch (submissionError) {
      setError(submissionError.response?.data?.message || submissionError.message || "Unable to update preferences");
      setMessage("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="mb-8">
        <h1 className="mb-1 text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-[#9ca3af]">Updates your real backend study preferences.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#2a2b30] bg-[#18191d]">
        <div className="border-b border-[#2a2b30] p-6">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Account</h2>
          </div>
        </div>
        <div className="grid gap-4 p-6 md:grid-cols-2">
          <ReadOnlyField icon={User} label="Name" value={currentUser?.name ?? "-"} />
          <ReadOnlyField icon={Mail} label="Email" value={currentUser?.email ?? "-"} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="overflow-hidden rounded-xl border border-[#2a2b30] bg-[#18191d]">
        <div className="border-b border-[#2a2b30] p-6">
          <div className="flex items-center gap-2">
            <Clock3 className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Study Preferences</h2>
          </div>
          <p className="mt-2 text-sm text-[#9ca3af]">The backend planner reads these values when generating study plans.</p>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Daily Study Hours" name="dailyStudyHours" value={form.dailyStudyHours} setForm={setForm} type="number" />
            <Field label="Break Time (minutes)" name="breakTime" value={form.breakTime} setForm={setForm} type="number" />
          </div>

          <label className="block max-w-xs">
            <span className="mb-2 block text-sm font-medium">Preferred Study Time</span>
            <select value={form.preferredStudyTime} onChange={(event) => setForm((current) => ({ ...current, preferredStudyTime: event.target.value }))} className="h-11 w-full rounded-xl border border-[#2a2b30] bg-[#0f1115] px-4 text-sm text-white outline-none transition focus:border-[#4ade80]">
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
          </label>

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          {message ? <p className="text-sm text-[#4ade80]">{message}</p> : null}

          <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#4ade80] px-5 py-3 text-sm font-semibold text-[#0f1115] transition hover:bg-[#62e68f] disabled:cursor-not-allowed disabled:opacity-70">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ReadOnlyField({ icon: Icon, label, value }) {
  return <div className="rounded-xl border border-[#2a2b30] bg-[#0f1115] p-4"><div className="mb-2 flex items-center gap-2 text-sm text-[#9ca3af]"><Icon className="h-4 w-4" />{label}</div><div className="font-medium text-white">{value}</div></div>;
}

function Field({ label, name, value, setForm, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <input type={type} name={name} value={value} onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))} className="h-11 w-full rounded-xl border border-[#2a2b30] bg-[#0f1115] px-4 text-sm text-white outline-none transition focus:border-[#4ade80]" />
    </label>
  );
}
