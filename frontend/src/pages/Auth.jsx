import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../api/expenseApi";
import "./Home.css";
import "./Auth.css";

const ICONS = {
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  mail: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6",
  lock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  eyeOff:
    "M17.9 17.9A10.9 10.9 0 0 1 12 20C5 20 1 12 1 12a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A9.1 9.1 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2M1 1l22 22",
};

function Icon({ name }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

const HEADLINE = "Know where every rupee goes.".split(" ");
const COINS = ["🪙", "💸", "🧾", "💰", "🪙", "💸"];
const BARS = [
  { name: "Food", pct: 34, color: "#FF5C8A" },
  { name: "Rent", pct: 28, color: "#B9A8FF" },
  { name: "Travel", pct: 18, color: "#2ED3A6" },
  { name: "Bills", pct: 12, color: "#FFC233" },
];
const CHIPS = [
  { text: "Chai ₹20", cls: "c1" },
  { text: "Metro ₹45", cls: "c2" },
  { text: "Groceries ₹1,240", cls: "c3" },
];

export default function Auth({ mode }) {
  const isLogin = mode === "login";
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLogin && !form.name.trim()) return setError("Enter your name.");
    if (!form.email.trim()) return setError("Enter your email.");
    if (isLogin && !form.password) return setError("Enter your password.");
    if (!isLogin && form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setBusy(true);
    try {
      if (isLogin) await loginUser(form.email, form.password);
      else await registerUser(form.name, form.email, form.password);
      navigate("/expenses");
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(
        msg ||
          (err.response
            ? "Please check your details and try again."
            : "Cannot reach the server. Is the backend running?")
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="kh au-split">
      <aside className="au-side" aria-hidden="true">
        <div className="hm-blob b1" />
        <div className="hm-blob b2" />
        <div className="hm-dots" />
        <div className="hm-coins">
          {COINS.map((c, i) => (
            <span key={i} className="hm-coin"
              style={{
                left: `${(i * 17 + 8) % 90}%`,
                fontSize: `${1.2 + (i % 3) * 0.5}rem`,
                animationDuration: `${11 + (i % 4) * 3}s`,
                animationDelay: `${-i * 2.7}s`,
              }}>
              {c}
            </span>
          ))}
        </div>

        <Link to="/" className="au-logo">Kharcha</Link>

        <div className="au-side-body">
          <h2 className="au-hero">
            {HEADLINE.map((w, i) => (
              <span key={i} className="hm-w" style={{ "--i": i }}>{w}&nbsp;</span>
            ))}
          </h2>
          <p className="au-tag">
            Log expenses in seconds and see exactly where your money goes.
          </p>

          <div className="au-glass">
            <div className="au-glass-top">
              <span>Spent this month</span>
              <strong>₹24,710</strong>
            </div>
            <div className="au-bar">
              {BARS.map((b) => (
                <i key={b.name}
                  style={{ width: ready ? `${b.pct}%` : "0%", background: b.color }} />
              ))}
            </div>
            <ul className="au-rows">
              {BARS.map((b) => (
                <li key={b.name}>
                  <span><i style={{ background: b.color }} />{b.name}</span>
                  <b>{b.pct}%</b>
                </li>
              ))}
            </ul>
            {CHIPS.map((c) => (
              <span key={c.text} className={`au-chip ${c.cls}`}>{c.text}</span>
            ))}
          </div>
        </div>
        <svg className="au-wave" viewBox="0 0 100 800" preserveAspectRatio="none"
          aria-hidden="true">
          <path className="w1"
            d="M100,0 H58 C28,90 28,180 58,270 C88,360 88,450 58,540 C28,630 28,720 58,800 H100 Z" />
          <path className="w2"
            d="M100,0 H72 C100,90 100,180 72,270 C44,360 44,450 72,540 C100,630 100,720 72,800 H100 Z" />
        </svg>
     
      </aside>

      <main className="au-main">
        <Link to="/" className="au-back">← Back to home</Link>

        <form className="au-form" onSubmit={handleSubmit} noValidate>
          <Link to="/" className="au-mlogo">Kharcha</Link>
          <h1>{isLogin ? "Welcome back 👋" : "Create your account"}</h1>
          <p className="au-sub">
            {isLogin
              ? "Log in to see your expenses."
              : "Start tracking where every rupee goes."}
          </p>

          {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}

          {!isLogin && (
            <div className="au-field">
              <label htmlFor="name">Name</label>
              <div className="au-input">
                <Icon name="user" />
                <input id="name" name="name" autoComplete="name"
                  placeholder="Your name" value={form.name} onChange={handleChange} />
              </div>
            </div>
          )}

          <div className="au-field">
            <label htmlFor="email">Email</label>
            <div className="au-input">
              <Icon name="mail" />
              <input id="email" name="email" type="email" autoComplete="email"
                placeholder="you@example.com" value={form.email} onChange={handleChange} />
            </div>
          </div>

          <div className="au-field">
            <label htmlFor="password">Password</label>
            <div className="au-input">
              <Icon name="lock" />
              <input id="password" name="password" type={show ? "text" : "password"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                placeholder={isLogin ? "Your password" : "At least 6 characters"}
                value={form.password} onChange={handleChange} />
              <button type="button" className="au-eye"
                onClick={() => setShow(!show)}
                aria-label={show ? "Hide password" : "Show password"}>
                <Icon name={show ? "eyeOff" : "eye"} />
              </button>
            </div>
          </div>

          <button type="submit" className="btn kh-btn-main au-submit" disabled={busy}>
            {busy ? "Please wait..." : isLogin ? "Log in" : "Create account"}
          </button>

          <p className="au-switch">
            {isLogin ? (
              <>New here? <Link to="/register">Create an account</Link></>
            ) : (
              <>Already have an account? <Link to="/login">Log in</Link></>
            )}
          </p>
        </form>
      </main>
    </div>
  );
}