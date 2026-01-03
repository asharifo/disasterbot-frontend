import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/AuthForms.css";
import { useAuth } from "../context/AuthContext";

const resolveApiBaseUrl = (explicitBaseUrl) => {
  return (explicitBaseUrl || import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
};

const Login = ({ apiBaseUrl, onAuthSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setAccessToken } = useAuth();
  const navigate = useNavigate();

  const resolvedApiBaseUrl = useMemo(
    () => resolveApiBaseUrl(apiBaseUrl),
    [apiBaseUrl]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!username || !password) {
      setErrorMessage("Please enter both your username and password.");
      return;
    }

    if (!resolvedApiBaseUrl) {
      setErrorMessage(
        "API base URL is missing. Please set it before logging in."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${resolvedApiBaseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payload?.message || "Unable to log in. Please try again."
        );
      }

      const accessToken = payload?.accessToken;

      if (onAuthSuccess) {
        onAuthSuccess(accessToken, payload);
      } else {
        setAccessToken(accessToken);
      }

      setSuccessMessage("Login successful! You can continue to the app.");
      navigate("/chatbot");
    } catch (error) {
      setErrorMessage(error?.message || "Unable to log in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <header className="auth-header">
          <h1>Welcome back</h1>
          <p>Sign in to keep your DisasterBot sessions in sync.</p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="janedoe"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {errorMessage ? (
            <div className="auth-message error" role="alert">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="auth-message success" role="status">
              {successMessage}
            </div>
          ) : null}

          <div className="auth-actions">
            <button
              className="auth-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Log in"}
            </button>
          </div>
        </form>

        <footer className="auth-footer">
          Need an account? <Link to="/register">Create one</Link>
        </footer>
      </div>
    </div>
  );
};

export default Login;
