import { Link } from "react-router-dom";

export default function Navbar() {
  return (
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
            <li className="nav-item"><Link className="btn kh-btn-dark btn-sm" to="/login">Log in</Link></li>
          </ul>
        </div>
      </div>
    </nav>
  );
}