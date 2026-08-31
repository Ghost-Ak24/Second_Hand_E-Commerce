import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
export default function Auth({ mode = "login" }) {
  const loginMode = mode === "login",
    { user, login, register } = useAuth(),
    nav = useNavigate(),
    loc = useLocation(),
    [f, setF] = useState({ name: "", email: "", password: "" }),
    [err, setErr] = useState(""),
    [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/products" replace />;
  async function sub(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      loginMode
        ? await login({ email: f.email, password: f.password })
        : await register(f);
      nav(loc.state?.from || "/products", { replace: true });
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-50 px-4 py-12">
      <form
        onSubmit={sub}
        className="mx-auto max-w-md rounded-3xl border bg-white p-7 shadow-xl sm:p-10"
      >
        <p className="text-sm font-bold text-indigo-600">
          {loginMode ? "Welcome back" : "Join CampusMarket"}
        </p>
        <h1 className="mt-2 text-3xl font-black">
          {loginMode ? "Log in" : "Create your account"}
        </h1>
        {err && (
          <div className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
            {err}
          </div>
        )}
        <div className="mt-7 space-y-4">
          {!loginMode && (
            <label>
              <span className="label">Name</span>
              <input
                required
                className="field"
                value={f.name}
                onChange={(e) => setF({ ...f, name: e.target.value })}
              />
            </label>
          )}
          <label>
            <span className="label">Email</span>
            <input
              required
              type="email"
              className="field"
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
            />
          </label>
          <label>
            <span className="label">Password</span>
            <input
              required
              minLength="6"
              type="password"
              className="field"
              value={f.password}
              onChange={(e) => setF({ ...f, password: e.target.value })}
            />
          </label>
        </div>
        <button
          disabled={busy}
          className="mt-7 w-full rounded-xl bg-slate-900 py-3.5 font-bold text-white"
        >
          {busy ? "Please wait..." : loginMode ? "Log in" : "Create account"}
        </button>
        <p className="mt-6 text-center text-sm text-slate-500">
          {loginMode ? "New here? " : "Already have an account? "}
          <Link
            className="font-bold text-indigo-600"
            to={loginMode ? "/register" : "/login"}
          >
            {loginMode ? "Create account" : "Log in"}
          </Link>
        </p>
      </form>
    </div>
  );
}
