import { Fragment, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser, isLoggedIn, logout } from "../api/expenseApi";
import "./Home.css";

const CATEGORIES = [
  { name: "Food", pct: 34, color: "#FF5C8A", amount: 8420 },
  { name: "Rent", pct: 28, color: "#5B3DF5", amount: 6900 },
  { name: "Travel", pct: 18, color: "#2ED3A6", amount: 4450 },
  { name: "Bills", pct: 12, color: "#FFC233", amount: 2960 },
  { name: "Fun", pct: 8, color: "#8EC5FF", amount: 1980 },
];
const TOTAL = CATEGORIES.reduce((s, c) => s + c.amount, 0);
const R = 70;
const C = 2 * Math.PI * R;
let acc = 0;
const SEGS = CATEGORIES.map((c) => {
  const len = (C * c.pct) / 100;
  const seg = { ...c, len, offset: acc };
  acc += len;
  return seg;
});

const HEADLINE = "Know where every rupee goes.".split(" ");
const WORDS = ["food", "rent", "travel", "bills", "fun"];
const COINS = ["🪙", "💸", "🧾", "💰", "🪙", "💸", "🧾", "💰"];

const CHIPS = [
 
  { text: "Metro ₹45", cls: "chip-b" },
  { text: "Netflix ₹199", cls: "chip-c" },
  { text: "Groceries ₹1,240", cls: "chip-d" },
];

const STEPS = [
  { icon: "✍️", title: "Add an expense", text: "Enter the title, amount and category. It takes a few seconds." },
  { icon: "🗂️", title: "It sorts itself", text: "Every entry lands in its category and the totals update instantly." },
  { icon: "📈", title: "Review and adjust", text: "See where the money went and stay under your monthly budget." },
];

const FEATURES = [
  { icon: "⚡", cls: "f1", title: "Add in seconds", text: "Title, amount, category, done. Edit or delete any entry later." },
  { icon: "🎯", cls: "f2", title: "See the pattern", text: "Totals by category and by month show where your money actually goes." },
  { icon: "🔔", cls: "f3", title: "Stay under budget", text: "Set a monthly limit and get a warning before you cross it." },
];

function useCountUp(target, ms = 1600) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setV(target);
      return;
    }
    let raf, start;
    const tick = (t) => {
      if (start === undefined) start = t;
      const p = Math.min((t - start) / ms, 1);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".hm-reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        }),
      { threshold: 0.2 }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
}

export default function Home() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const firstName = getUser()?.name?.split(" ")[0];
  const initial = firstName ? firstName[0].toUpperCase() : "?";
  const [ready, setReady] = useState(false);
  const [word, setWord] = useState(0);
  const total = useCountUp(TOTAL);
  useReveal();

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setWord((i) => (i + 1) % WORDS.length), 2000);
    return () => clearInterval(t);
  }, []);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.transform =
      `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  };
  const onLeave = (e) => {
    e.currentTarget.style.transform = "";
  };

  return (
    <div className="kh">
      <header className="hm-hero">
        <div className="hm-blob b1" />
        <div className="hm-blob b2" />
        <div className="hm-blob b3" />
        <div className="hm-dots" />
        <div className="hm-coins" aria-hidden="true">
          {COINS.map((c, i) => (
            <span key={i} className="hm-coin"
              style={{
                left: `${(i * 13 + 6) % 94}%`,
                fontSize: `${1.2 + (i % 3) * 0.5}rem`,
                animationDuration: `${10 + (i % 4) * 3}s`,
                animationDelay: `${-i * 2.3}s`,
              }}>
              {c}
            </span>
          ))}
        </div>

        <nav className="navbar navbar-expand-md kh-nav">
          <div className="container">
            <Link className="navbar-brand kh-logo" to="/">Kharcha</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
              data-bs-target="#nav" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse" id="nav">
            <ul className="navbar-nav ms-auto align-items-md-center gap-md-3">
                <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/expenses">Expenses</Link></li>
                {loggedIn && (
                  <li className="nav-item"><Link className="nav-link" to="/dashboard">Dashboard</Link></li>
                )}
                {loggedIn && firstName && (
                  <li className="nav-item">
                    <span className="kh-user">
                      <span className="kh-avatar" aria-hidden="true">{initial}</span>
                      Hi, {firstName}
                    </span>
                  </li>
                )}
                <li className="nav-item">
                  {loggedIn ? (
                    <button type="button" className="btn kh-btn-dark btn-sm"
                      onClick={() => { logout(); navigate("/login"); }}>
                      Log out
                    </button>
                  ) : (
                    <Link className="btn kh-btn-dark btn-sm" to="/login">Log in</Link>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="container hm-hero-body">
          <div className="row align-items-center gy-5">
            <div className="col-lg-6">
              <h1 className="hm-title">
                {HEADLINE.map((w, i) => (
                  <Fragment key={i}>
                    <span className="hm-w" style={{ "--i": i }}>{w}</span>{" "}
                  </Fragment>
                ))}
              </h1>
              <p className="hm-rotor">
                Track your <span key={word} className="hm-word">{WORDS[word]}</span>
              </p>
              <p className="hm-sub">
                Log expenses in seconds, see them sorted by category, and stay under your monthly budget.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/expenses" className="btn btn-lg kh-btn-main hm-pulse">Add your first expense</Link>
                <a href="#how" className="btn btn-lg hm-ghost">See how it works</a>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="hm-card" onMouseMove={onMove} onMouseLeave={onLeave}>
              <div className="hm-visual">
              <div className="hm-orbit o1" />
              <div className="hm-orbit o2" />
              <svg viewBox="0 0 180 180" className="hm-donut" role="img"
                 aria-label="Spending split by category">
                    <g transform="rotate(-90 90 90)">
                    <circle cx="90" cy="90" r={R} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="22" />
                      {SEGS.map((s, i) => (
                        <circle key={s.name} cx="90" cy="90" r={R} fill="none"
                          stroke={s.color} strokeWidth="22"
                          strokeDasharray={ready ? `${s.len - 3} ${C - s.len + 3}` : `0 ${C}`}
                          strokeDashoffset={-s.offset}
                          style={{ transition: `stroke-dasharray 1s cubic-bezier(.2,.8,.2,1) ${i * 0.15}s` }} />
                      ))}
                    </g>
                  </svg>
                  <div className="hm-center">
                    <span className="hm-center-label">Spent this month</span>
                    <strong className="hm-center-amount">₹{total.toLocaleString("en-IN")}</strong>
                  </div>
                  {CHIPS.map((c) => (
                    <span key={c.text} className={`hm-chip ${c.cls}`}>{c.text}</span>
                  ))}
                </div>
                <ul className="hm-legend">
                  {CATEGORIES.map((c) => (
                    <li key={c.name}><i style={{ background: c.color }} />{c.name} {c.pct}%</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <svg className="hm-wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,40 C240,90 480,0 720,30 C960,60 1200,90 1440,35 L1440,80 L0,80 Z" fill="#14213d" />
        </svg>
      </header>

      <div className="hm-marquee" aria-hidden="true">
        <div className="hm-track">
          {[...CATEGORIES, ...CATEGORIES, ...CATEGORIES, ...CATEGORIES].map((c, i) => (
            <span key={i}><i style={{ background: c.color }} />{c.name} ₹{c.amount.toLocaleString("en-IN")}</span>
          ))}
        </div>
      </div>

      <section id="how" className="container hm-section">
        <h2 className="hm-h2 hm-reveal">How it works</h2>
        <p className="hm-lead hm-reveal" style={{ "--d": 1 }}>Three steps, no spreadsheets.</p>
        <div className="row gy-4 hm-steps hm-reveal" style={{ "--d": 2 }}>
          {STEPS.map((s) => (
            <div key={s.title} className="col-md-4 hm-step">
              <span className="hm-step-icon">{s.icon}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container hm-feats">
        <div className="row g-4">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="col-md-4 hm-reveal" style={{ "--d": i }}>
              <div className={`hm-feat ${f.cls}`}>
                <span className="hm-feat-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="hm-cta">
        <div className="container">
          <h2 className="hm-reveal">Start tracking today.</h2>
          <Link to="/expenses" className="btn btn-lg kh-btn-main hm-pulse">Add your first expense</Link>
        </div>
      </section>

      <footer className="kh-footer container">Kharcha · Built with React and Spring Boot</footer>
    </div>
  );
}