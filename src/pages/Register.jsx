import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import AuthLayout from "../layout/AuthLayout";
import { useApp } from "../context/AuthContext";

const initialForm = {
  name: "",
  email: "",
  password: "",
};

export default function Register() {
  const navigate = useNavigate();
  const { currentUser, registerUser } = useApp();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await registerUser(form);
      setSuccess("Account created. Sign in to continue.");
      setError("");
      setForm(initialForm);
      window.setTimeout(() => navigate("/login"), 700);
    } catch (submissionError) {
      setError(submissionError.response?.data?.message || submissionError.message || "Unable to create account");
      setSuccess("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-[#2a2b30] bg-[#18191d] p-8 shadow-2xl shadow-black/20">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold">Create an account</h2>
          <p className="mt-2 text-sm text-[#9ca3af]">Register through the backend and start using the planner</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <Field label="Full name" name="name" value={form.name} onChange={setForm} />
          <Field label="Email" name="email" value={form.email} onChange={setForm} type="email" />
          <Field label="Password" name="password" value={form.password} onChange={setForm} type="password" />

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          {success ? <p className="text-sm text-[#4ade80]">{success}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="h-11 w-full rounded-xl bg-[#4ade80] px-5 text-sm font-semibold text-[#0f1115] transition hover:bg-[#62e68f] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#9ca3af]">
          Already have an account? <Link to="/login" className="font-medium text-[#4ade80] hover:underline">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

function Field({ label, name, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#e8e9eb]">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(event) => onChange((current) => ({ ...current, [name]: event.target.value }))}
        className="h-11 w-full rounded-xl border border-[#2a2b30] bg-[#0f1115] px-4 text-sm text-white outline-none transition placeholder:text-[#6b7280] focus:border-[#4ade80]"
      />
    </label>
  );
}
