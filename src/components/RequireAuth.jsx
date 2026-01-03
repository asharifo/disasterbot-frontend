import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/AuthGate.css";

function RequireAuth() {
  const { user, isAuthReady } = useAuth();

  // While checking refresh token / session
  if (!isAuthReady) {
    return (
      <section className="auth-gate">
        <div className="auth-gate_card">
          <h1>Checking your session</h1>
          <p>Please wait while we restore your session.</p>
        </div>
      </section>
    );
  }

  // Auth check completed — user not logged in
  if (!user) {
    return (
      <section className="auth-gate">
        <div className="auth-gate_card">
          <h1>Login required</h1>
          <p>
            Please log in or register to access the DisasterBot chat experience.
          </p>
          <div className="auth-gate_actions">
            <Link className="auth-gate_button" to="/login">
              Log in
            </Link>
            <Link className="auth-gate_button outline" to="/register">
              Register
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // User authenticated
  return <Outlet />;
}

export default RequireAuth;
