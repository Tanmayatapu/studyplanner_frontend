import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import AuthLayout from "../layout/AuthLayout";
import { useApp } from "../context/AuthContext";

const initialForm = {
  email: "",
  password: "",
};

export default function Login() {
  const navigate = useNavigate();
  const { authLoading, currentUser, loginUser } = useApp();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await loginUser(form);
      navigate("/dashboard");
    } catch (submissionError) {
      setError(
        submissionError.response?.data?.message ||
          submissionError.message ||
          "Unable to sign in"
      );
    }
  }

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-[560px] rounded-[24px] border border-[#23262d] bg-[#13161c]/95 px-8 py-9 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:px-10 sm:py-10">
        <div className="mb-8">
          <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-white sm:text-3xl">
            Welcome back
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#94a3b8] sm:text-[15px]">
            Sign in to continue to your dashboard
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <Field
            label="Email"
            name="email"
            value={form.email}
            onChange={setForm}
            type="email"
            placeholder="you@example.com"
          />

          <Field
            label="Password"
            name="password"
            value={form.password}
            onChange={setForm}
            type="password"
            placeholder="••••••••"
          />

          <div className="flex justify-end pt-1">
            <button
              type="button"
              className="text-sm font-medium text-[#4ade80] transition hover:text-[#6aee96]"
            >
              Forgot password?
            </button>
          </div>

          {error ? (
            <p className="text-sm text-rose-400">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={authLoading}
            className="h-14 w-full rounded-[14px] bg-[#4ade80] px-5 text-[16px] font-semibold text-[#08130c] transition hover:bg-[#62e68f] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {authLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#94a3b8] sm:text-[15px]">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#4ade80] transition hover:text-[#6aee96]"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
}) {
  return (
    <label className="block">
      <span className="mb-3 block text-sm font-medium text-[#d1d5db]">
        {label}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange((current) => ({
            ...current,
            [name]: event.target.value,
          }))
        }
        className="h-14 w-full rounded-[14px] border border-[#23262d] bg-[#181b22] px-4 text-[15px] text-white outline-none transition placeholder:text-[#7c8596] focus:border-[#3b4250] focus:bg-[#1b1f27]"
      />
    </label>
  );
}