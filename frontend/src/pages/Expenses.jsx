import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import {
  CATEGORIES, getExpenses, addExpense, updateExpense, deleteExpense,
} from "../api/expenseApi";
import "./Home.css";
import "./Expenses.css";

const ICONS = { Food: "🍔", Rent: "🏠", Travel: "🚌", Bills: "💡", Fun: "🎬" };
const EMPTY = { title: "", amount: "", category: "Food", date: "", note: "" };

const today = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};
const rupees = (n) => "₹" + Math.round(Number(n)).toLocaleString("en-IN");
const colorOf = (name) => CATEGORIES.find((c) => c.name === name)?.color ?? "#999";
const prettyDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const Pencil = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);
const Trash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" />
  </svg>
);

function useCountUp(target, ms = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setV(target);
      return;
    }
    let raf, start, from = 0;
    setV((prev) => { from = prev; return prev; });
    const tick = (t) => {
      if (start === undefined) start = t;
      const p = Math.min((t - start) / ms, 1);
      setV(Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    getExpenses().then((data) => {
      setExpenses(data);
      setLoading(false);
      setTimeout(() => setReady(true), 100);
    });
  }, []);

  const refresh = async () => setExpenses(await getExpenses());

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  };

  const byCat = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        ...c,
        sum: expenses.filter((x) => x.category === c.name).reduce((s, x) => s + Number(x.amount), 0),
      })),
    [expenses]
  );
  const allTotal = byCat.reduce((s, c) => s + c.sum, 0);

  const visible = useMemo(() => {
    const list = filter === "All" ? expenses : expenses.filter((x) => x.category === filter);
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, filter]);

  const total = visible.reduce((sum, x) => sum + Number(x.amount), 0);
  const average = visible.length ? total / visible.length : 0;
  const biggest = visible.reduce((m, x) => (!m || Number(x.amount) > Number(m.amount) ? x : m), null);
  const topCat = byCat.reduce((m, c) => (c.sum > m.sum ? c : m), byCat[0]);

  const animatedTotal = useCountUp(total);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY, date: today() });
    setError("");
    setShowModal(true);
  };

  const openEdit = (x) => {
    setEditingId(x.id);
    setForm({ title: x.title, amount: x.amount, category: x.category, date: x.date, note: x.note || "" });
    setError("");
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Enter a title.");
    if (!(Number(form.amount) > 0)) return setError("Amount must be more than 0.");
    if (!form.date) return setError("Choose a date.");

    const payload = { ...form, title: form.title.trim(), amount: Number(form.amount) };
    if (editingId) await updateExpense(editingId, payload);
    else await addExpense(payload);

    closeModal();
    refresh();
    showToast(editingId ? "Changes saved" : "Expense added");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this expense?")) {
      await deleteExpense(id);
      refresh();
      showToast("Expense deleted");
    }
  };

  return (
    <div className="kh">
      <Navbar />

      <section className="kh-banner">
        <div className="container">
          <div className="kh-banner-top">
            <div>
              <p className="kh-banner-label">
                Total spent{filter !== "All" ? ` on ${filter}` : ""}
              </p>
              <h1 className="kh-banner-amount">₹{animatedTotal.toLocaleString("en-IN")}</h1>
              <p className="kh-banner-sub">{visible.length} expenses logged</p>
            </div>
            <button className="btn kh-btn-sun" onClick={openAdd}>+ Add expense</button>
          </div>

          <div className="kh-bar" aria-hidden="true">
            {byCat.map((c) => (
              <span key={c.name} title={`${c.name} ${rupees(c.sum)}`}
                style={{
                  width: ready && allTotal ? `${(c.sum / allTotal) * 100}%` : "0%",
                  background: c.color,
                }} />
            ))}
          </div>

          <div className="kh-chips">
            <button className={`kh-fchip ${filter === "All" ? "on" : ""}`}
              onClick={() => setFilter("All")}>
              All <b>{rupees(allTotal)}</b>
            </button>
            {byCat.map((c) => (
              <button key={c.name}
                className={`kh-fchip ${filter === c.name ? "on" : ""}`}
                onClick={() => setFilter(c.name)}>
                <i style={{ background: c.color }} />
                {c.name} <b>{rupees(c.sum)}</b>
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="container kh-page">
        <div className="row g-3 kh-stats">
          <div className="col-md-4">
            <div className="kh-tile">
              <span className="kh-tile-icon" style={{ background: "#FFF1C9" }}>🏆</span>
              <div>
                <small>Highest expense</small>
                <strong>{biggest ? rupees(biggest.amount) : "-"}</strong>
                <em>{biggest ? biggest.title : "No data yet"}</em>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="kh-tile">
              <span className="kh-tile-icon" style={{ background: "#D7F7EC" }}>📊</span>
              <div>
                <small>Average per expense</small>
                <strong>{rupees(average)}</strong>
                <em>{visible.length} expenses</em>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="kh-tile">
              <span className="kh-tile-icon" style={{ background: "#FFDDE7" }}>
                {topCat && topCat.sum ? ICONS[topCat.name] : "⭐"}
              </span>
              <div>
                <small>Top category</small>
                <strong>{topCat && topCat.sum ? topCat.name : "-"}</strong>
                <em>{topCat && topCat.sum ? rupees(topCat.sum) : "No data yet"}</em>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="kh-empty">Loading expenses...</div>
        ) : visible.length === 0 ? (
          <div className="kh-empty">
            <div className="kh-empty-icon">🧾</div>
            No expenses here yet. Click "Add expense" to log your first one.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle kh-rows">
              <thead>
                <tr>
                  <th>Expense</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th className="text-end">Amount</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((x, i) => (
                  <tr key={x.id} className="kh-row" style={{ "--i": i }}>
                    <td>
                      <div className="kh-exp">
                        <span className="kh-icon"
                          style={{ background: colorOf(x.category) + "26" }}>
                          {ICONS[x.category] ?? "💸"}
                        </span>
                        <div>
                          <div className="fw-medium">{x.title}</div>
                          {x.note && <small className="text-muted">{x.note}</small>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="kh-badge"
                        style={{ background: colorOf(x.category) + "22" }}>
                        <i style={{ background: colorOf(x.category) }} />
                        {x.category}
                      </span>
                    </td>
                    <td className="kh-date">{prettyDate(x.date)}</td>
                    <td className="text-end kh-amt">{rupees(x.amount)}</td>
                    <td className="text-end text-nowrap">
                      <button className="kh-iconbtn" onClick={() => openEdit(x)}
                        aria-label={`Edit ${x.title}`}><Pencil /></button>
                      <button className="kh-iconbtn danger" onClick={() => handleDelete(x.id)}
                        aria-label={`Delete ${x.title}`}><Trash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {toast && <div className="kh-toast" role="status">{toast}</div>}

      {showModal && (
        <>
          <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true"
            onClick={closeModal}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <form className="modal-content kh-modal" onSubmit={handleSubmit}>
                <div className="kh-modal-head">
                  <h2>{editingId ? "Edit expense" : "Add expense"}</h2>
                  <button type="button" className="btn-close btn-close-white"
                    aria-label="Close" onClick={closeModal} />
                </div>

                <div className="modal-body">
                  {error && <div className="alert alert-danger py-2">{error}</div>}

                  <label className="form-label" htmlFor="amount">Amount</label>
                  <div className="kh-amount-input">
                    <span>₹</span>
                    <input id="amount" name="amount" type="number" min="0" step="0.01"
                      value={form.amount} onChange={handleChange} placeholder="0" autoFocus />
                  </div>

                  <div className="mb-3">
                    <label className="form-label" htmlFor="title">Title</label>
                    <input id="title" name="title" className="form-control"
                      value={form.title} onChange={handleChange} placeholder="e.g. Lunch" />
                  </div>

                  <div className="mb-3">
                    <span className="form-label d-block">Category</span>
                    <div className="kh-catpick">
                      {CATEGORIES.map((c) => (
                        <button type="button" key={c.name}
                          className={form.category === c.name ? "on" : ""}
                          style={form.category === c.name
                            ? { borderColor: c.color, background: c.color + "1f" } : undefined}
                          onClick={() => setForm({ ...form, category: c.name })}>
                          <span>{ICONS[c.name]}</span> {c.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label" htmlFor="date">Date</label>
                      <input id="date" name="date" type="date" className="form-control"
                        value={form.date} onChange={handleChange} />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label" htmlFor="note">Note (optional)</label>
                      <input id="note" name="note" className="form-control"
                        value={form.note} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn kh-btn-main">
                    {editingId ? "Save changes" : "Add expense"}
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="modal-backdrop show" />
        </>
      )}
    </div>
  );
}