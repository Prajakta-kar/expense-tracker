import { Link, useNavigate } from "react-router-dom";
import { getUser, isLoggedIn, logout } from "../api/expenseApi";

export default function Navbar() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const firstName = getUser()?.name?.split(" ")[0];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
            {loggedIn ? (
              <>
                {firstName && (
                  <li className="nav-item"><span className="nav-link">Hi, {firstName}</span></li>
                )}
                <li className="nav-item">
                  <button type="button" className="btn kh-btn-dark btn-sm" onClick={handleLogout}>
                    Log out
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="btn kh-btn-dark btn-sm" to="/login">Log in</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}