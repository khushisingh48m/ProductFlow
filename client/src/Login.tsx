
import { useState } from "react";

type LoginProps = {
  onLogin: () => void;
};

const API_URL = import.meta.env.VITE_API_URL;

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      onLogin();
    } catch (error) {
      console.error("Login error:", error);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="brand">
          <div className="brand-logo">PF</div>
          <span>ProductFlow</span>
        </div>

        <div className="login-hero">
          <span className="hero-tag">PRODUCT MANAGEMENT MADE SIMPLE</span>

          <h1>
            Manage smarter.
            <br />
            Grow faster.
          </h1>

          <p>
            Keep your products organized, track performance,
            and manage your business from one simple dashboard.
          </p>

          <div className="hero-features">
            <div className="hero-feature">
              <span>✓</span>
              Easy product management
            </div>
            <div className="hero-feature">
              <span>✓</span>
              Real-time dashboard insights
            </div>
            <div className="hero-feature">
              <span>✓</span>
              Secure account access
            </div>
          </div>
        </div>

        <div className="left-footer">
          © 2026 ProductFlow. All rights reserved.
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-wrapper">
          <div className="mobile-brand">
            <div className="brand-logo">PF</div>
            <span>ProductFlow</span>
          </div>

          <div className="form-heading">
            <span className="welcome-label">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>Enter your details to access your dashboard.</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>

              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && <div className="login-error">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="login-button"
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <span>→</span>}
            </button>
          </form>

          <div className="secure-note">
            <span>🔒</span>
            Your account is protected with secure authentication.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
