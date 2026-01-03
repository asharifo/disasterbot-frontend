import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/AuthForms.css";
import { useAuth } from "../context/AuthContext";

const resolveApiBaseUrl = (explicitBaseUrl) => {
  return (explicitBaseUrl || import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
};

const RegisterForm = ({ apiBaseUrl, onAuthSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (!username || !password || !confirmPassword) {
      setErrorMessage("Please complete all fields before registering.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!resolvedApiBaseUrl) {
      setErrorMessage(
        "API base URL is missing. Please set it before registering."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${resolvedApiBaseUrl}/auth/register`, {
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
          payload?.message || "Unable to register. Please try again."
        );
      }

      const accessToken = payload?.accessToken;

      if (onAuthSuccess) {
        onAuthSuccess(accessToken, payload);
      } else {
        setAccessToken(accessToken);
      }

      setSuccessMessage("Account created! You can start chatting right away.");
      navigate("/chatbot");
    } catch (error) {
      setErrorMessage(
        error?.message || "Unable to register. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <header className="auth-header">
          <h1>Create your account</h1>
          <p>Register to unlock personalized DisasterBot conversations.</p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="register-username">Username</label>
            <input
              id="register-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="enter your username"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-confirm-password">Confirm Password</label>
            <input
              id="register-confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
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
              {isSubmitting ? "Creating account..." : "Register"}
            </button>
          </div>
        </form>

        <footer className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </footer>
      </div>
    </div>
  );
};

export default RegisterForm;
