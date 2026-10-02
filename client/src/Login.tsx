import { useState } from "react";

type LoginProps = {
  onLogin: () => void;
};

const API_URL = import.meta.env.VITE_API_URL;

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

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
    <div className="login-container">
      <div className="login-box">

        <div className="login-logo">
          <div className="logo-icon">PF</div>
          <h1>ProductFlow</h1>
          <p>Manage your products with ease</p>
        </div>

        <div className="login-content">
          <h2>Welcome back</h2>

          <p className="login-subtitle">
            Login to your ProductFlow account
          </p>

          <form onSubmit={handleLogin}>

            <div className="input-group">
              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="login-button"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>
        </div>

        <div className="login-footer">
          ProductFlow • Product Management Platform
        </div>

      </div>
    </div>
  );
}

export default Login;