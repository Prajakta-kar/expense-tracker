import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
    CATEGORIES, getExpenses, getBudget, saveBudget, removeBudget,
  } from "../api/expenseApi";
import "./Home.css";
import "./Expenses.css";
import "./Dashboard.css";

const ICONS = { Food: "🍔", Rent: "🏠", Travel: "🚌", Bills: "💡", Fun: "🎬" };
const R = 70;
const C = 2 * Math.PI * R;

const rupees = (n) => "₹" + Math.round(Number(n)).toLocaleString("en-IN");
const short = (n) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L`
  : n >= 1000 ? `₹${(n / 1000).toFixed(1)}k`
  : `₹${Math.round(n)}`;

const catsOf = (month) =>
  CATEGORIES.map((c) => ({ ...c, sum: month.cats[c.name] || 0 }));

function useCountUp(target, ms = 1000) {
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

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [sel, setSel] = useState(5); // which of the 6 months the donut shows
  const [budget, setBudget] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [budgetError, setBudgetError] = useState("");

  useEffect(() => {
    getExpenses()
      .then((data) => {
        setExpenses(data);
        setLoading(false);
        setTimeout(() => setReady(true), 150);
      })
      .catch(() => {
        setError("Could not load your expenses. Is the backend running?");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    getBudget().then(setBudget).catch(() => {});
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const keyOf = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: keyOf(d),
        label: d.toLocaleString("en-IN", { month: "short" }),
        full: d.toLocaleString("en-IN", { month: "long", year: "numeric" }),
        total: 0,
        count: 0,
        cats: {},
      });
    }

    expenses.forEach((x) => {
      const k = String(x.date).slice(0, 7);
      const m = months.find((mm) => mm.key === k);
      if (!m) return;
      const amount = Number(x.amount);
      m.total += amount;
      m.count += 1;
      m.cats[x.category] = (m.cats[x.category] || 0) + amount;
    });

    const thisTotal = months[5].total;
    const lastTotal = months[4].total;
    const top = catsOf(months[5]).reduce((m, c) => (c.sum > m.sum ? c : m));

    return {
      months,
      thisTotal,
      lastTotal,
      top,
      thisCount: months[5].count,
      daily: thisTotal / now.getDate(),
      change: lastTotal > 0 ? ((thisTotal - lastTotal) / lastTotal) * 100 : null,
      monthName: months[5].full,
    };
  }, [expenses]);

  const animatedTotal = useCountUp(stats.thisTotal);

  /* ---- bar chart numbers ---- */
  const W = 600, H = 260, PAD_X = 10, TOP = 30, BOTTOM = 36, BAR_W = 56;
  const plotH = H - TOP - BOTTOM;
  const slot = (W - PAD_X * 2) / 6;
  const maxTotal = Math.max(...stats.months.map((m) => m.total), 1);

  /* ---- donut numbers (for the selected month) ---- */
  const selMonth = stats.months[sel];
  const byCat = catsOf(selMonth);
  const catTotal = byCat.reduce((s, c) => s + c.sum, 0);
  const active = byCat.filter((c) => c.sum > 0);
  const gap = active.length > 1 ? 3 : 0;
  let acc = 0;
  const segs = active.map((c) => {
    const len = (C * c.sum) / catTotal;
    const seg = { ...c, len, offset: acc };
    acc += len;
    return seg;
  });

  const startEdit = () => {
    setDraft(budget ?? "");
    setBudgetError("");
    setEditing(true);
  };

  const submitBudget = async (e) => {
    e.preventDefault();
    const value = Number(draft);
    if (!(value > 0)) return setBudgetError("Enter an amount above 0.");
    try {
      setBudget(await saveBudget(value));
      setBudgetError("");
      setEditing(false);
    } catch {
      setBudgetError("Could not save. Is the backend running?");
    }
  };

  const clearBudget = async () => {
    try {
      await removeBudget();
      setBudget(null);
      setBudgetError("");
      setEditing(false);
    } catch {
      setBudgetError("Could not remove the budget.");
    }
  };

  const used = budget ? (stats.thisTotal / budget) * 100 : 0;
  const level = used > 100 ? "over" : used >= 80 ? "warn" : "ok";

  const changeText =
    stats.change === null
      ? "No spending last month to compare"
      : `${Math.abs(stats.change).toFixed(0)}% ${stats.change >= 0 ? "more" : "less"} than last month`;

  return (
    <div className="kh">
      <Navbar />

      <section className="kh-banner">
        <div className="container">
          <div className="kh-banner-top">
            <div>
              <p className="kh-banner-label">Spent in {stats.monthName}</p>
              <h1 className="kh-banner-amount">₹{animatedTotal.toLocaleString("en-IN")}</h1>
              <p className="kh-banner-sub">{changeText}</p>
            </div>
            <Link to="/expenses" className="btn kh-btn-sun">+ Add expense</Link>
          </div>
        </div>
      </section>

      <main className="container kh-page">
        {loading && <div className="kh-empty">Loading your dashboard...</div>}

        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && expenses.length === 0 && (
          <div className="kh-empty">
            <div className="kh-empty-icon">📊</div>
            Your charts will appear here once you add some expenses.
            <div className="mt-3">
              <Link to="/expenses" className="btn kh-btn-main">Add your first expense</Link>
            </div>
          </div>
        )}

        {!loading && !error && expenses.length > 0 && (
          <>
            <div className="row g-3 kh-stats">
              <div className="col-md-6 col-lg-3">
                <div className="kh-tile">
                  <span className="kh-tile-icon" style={{ background: "#E6E1FF" }}>🗓️</span>
                  <div>
                    <small>Last month</small>
                    <strong>{rupees(stats.lastTotal)}</strong>
                    <em>total spent</em>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="kh-tile">
                  <span className="kh-tile-icon" style={{ background: "#D7F7EC" }}>📈</span>
                  <div>
                    <small>Daily average</small>
                    <strong>{rupees(stats.daily)}</strong>
                    <em>this month</em>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="kh-tile">
                  <span className="kh-tile-icon" style={{ background: "#FFF1C9" }}>🧾</span>
                  <div>
                    <small>Expenses logged</small>
                    <strong>{stats.thisCount}</strong>
                    <em>this month</em>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="kh-tile">
                  <span className="kh-tile-icon" style={{ background: "#FFDDE7" }}>
                    {stats.top.sum > 0 ? ICONS[stats.top.name] : "⭐"}
                  </span>
                  <div>
                    <small>Top category</small>
                    <strong>{stats.top.sum > 0 ? stats.top.name : "-"}</strong>
                    <em>{stats.top.sum > 0 ? rupees(stats.top.sum) : "No data yet"}</em>
                  </div>
                </div>
              </div>
            </div>

            <div className={`db-budget ${budget ? level : ""}`}>
              <div className="db-budget-head">
                <h2>Monthly budget</h2>
                {!editing && (
                  <button type="button" className="db-link" onClick={startEdit}>
                    {budget ? "Change" : "Set a budget"}
                  </button>
                )}
              </div>

              {editing ? (
                <form className="db-budget-form" onSubmit={submitBudget}>
                  <span>₹</span>
                  <input type="number" min="1" step="1" autoFocus value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="e.g. 20000" aria-label="Monthly budget in rupees" />
                  <button type="submit" className="btn kh-btn-main btn-sm">Save</button>
                  <button type="button" className="btn btn-light btn-sm"
                    onClick={() => setEditing(false)}>Cancel</button>
                  {budget && (
                    <button type="button" className="db-link danger"
                      onClick={clearBudget}>Remove</button>
                  )}
                </form>
              ) : budget ? (
                <>
                  <div className="db-meter" role="progressbar" aria-valuemin={0}
                    aria-valuemax={100} aria-valuenow={Math.min(Math.round(used), 100)}>
                    <i style={{ width: ready ? `${Math.min(used, 100)}%` : "0%" }} />
                  </div>
                  <p className="db-budget-text">
                    <b>{rupees(stats.thisTotal)}</b> of {rupees(budget)} used ({Math.round(used)}%)
                  </p>
                  {level === "warn" && (
                    <p className="db-alert warn">
                      ⚠️ You have used {Math.round(used)}% of your budget. Only {rupees(budget - stats.thisTotal)} left this month.
                    </p>
                  )}
                  {level === "over" && (
                    <p className="db-alert over">
                      🚨 You are {rupees(stats.thisTotal - budget)} over your monthly budget.
                    </p>
                  )}
                </>
              ) : (
                <p className="db-budget-text">
                  Set a monthly limit and Kharcha will warn you before you cross it.
                </p>
              )}

              {budgetError && <p className="db-alert over">{budgetError}</p>}
            </div>

            <div className="row g-4">
              <div className="col-lg-7">
                <div className="db-card">
                  <h2>Last 6 months</h2>
                  <svg viewBox={`0 0 ${W} ${H}`} className="db-chart" role="group"
                    aria-label="Monthly spending for the last 6 months">
                    <line x1={PAD_X} x2={W - PAD_X} y1={TOP + plotH} y2={TOP + plotH}
                      stroke="#e1e6f5" strokeWidth="2" />
                    {stats.months.map((m, i) => {
                      const h = (m.total / maxTotal) * plotH;
                      const x = PAD_X + i * slot + (slot - BAR_W) / 2;
                      const y = TOP + plotH - h;
                      const chosen = i === sel;
                      return (
                        <g key={m.key} className="db-col" role="button" tabIndex={0}
                          aria-label={`${m.full}: ${rupees(m.total)}. Show categories.`}
                          aria-pressed={chosen}
                          onClick={() => setSel(i)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSel(i);
                            }
                          }}>
                          <rect x={PAD_X + i * slot} y={0} width={slot} height={H}
                            fill="transparent" />
                          {m.total > 0 && (
                            <rect className="db-bar" x={x} y={y} width={BAR_W}
                              height={h} rx="10"
                              style={{
                                fill: chosen ? "#5B3DF5" : "#B9A8FF",
                                transform: ready ? "scaleY(1)" : "scaleY(0)",
                                transitionDelay: `${i * 90}ms, 0ms`,
                              }} />
                          )}
                          {m.total > 0 && (
                            <text className="db-val" x={x + BAR_W / 2} y={y - 8}
                              textAnchor="middle"
                              style={{ opacity: ready ? 1 : 0, transitionDelay: `${i * 90 + 500}ms` }}>
                              {short(m.total)}
                            </text>
                          )}
                          <text className={`db-label ${chosen ? "on" : ""}`}
                            x={x + BAR_W / 2} y={H - 12} textAnchor="middle">
                            {m.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                  <p className="db-hint">Click a bar to see that month by category.</p>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="db-card">
                  <div className="db-head">
                    <h2>By category</h2>
                    <div className="db-nav">
                      <button type="button" onClick={() => setSel(sel - 1)}
                        disabled={sel === 0} aria-label="Previous month">‹</button>
                      <span>{selMonth.full}</span>
                      <button type="button" onClick={() => setSel(sel + 1)}
                        disabled={sel === 5} aria-label="Next month">›</button>
                    </div>
                  </div>

                  {segs.length === 0 ? (
                    <div className="kh-empty">No expenses in {selMonth.full}.</div>
                  ) : (
                    <>
                      <div className="db-donut">
                        <svg viewBox="0 0 180 180" role="img"
                          aria-label={`Spending by category in ${selMonth.full}`}>
                          <g transform="rotate(-90 90 90)">
                            <circle cx="90" cy="90" r={R} fill="none"
                              stroke="#E4E8F5" strokeWidth="22" />
                            {segs.map((s, i) => (
                              <circle key={s.name} cx="90" cy="90" r={R} fill="none"
                                stroke={s.color} strokeWidth="22"
                                strokeDasharray={ready ? `${s.len - gap} ${C - s.len + gap}` : `0 ${C}`}
                                strokeDashoffset={-s.offset}
                                style={{ transition: `stroke-dasharray 0.8s cubic-bezier(.2,.8,.2,1) ${i * 0.1}s, stroke-dashoffset 0.8s cubic-bezier(.2,.8,.2,1)` }} />
                            ))}
                          </g>
                        </svg>
                        <div className="db-donut-center">
                          <span>Total</span>
                          <strong>{rupees(catTotal)}</strong>
                        </div>
                      </div>
                      <ul className="db-list">
                        {segs.map((s) => (
                          <li key={s.name}>
                            <span><i style={{ background: s.color }} />{ICONS[s.name]} {s.name}</span>
                            <b>{rupees(s.sum)} <small>{Math.round((s.sum / catTotal) * 100)}%</small></b>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}