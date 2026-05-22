import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Signup.css";
import { register, login, fetchProfile } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername]         = useState("");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);

  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSignup = async () => {
    setError("");

    if (!username || !email || !password) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await register({ username, email, password });
      await login({ username, password });

      const profile = await fetchProfile();
      setUser(profile);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err?.message ||
        "Registration failed. Username may already be taken."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <header className="signup-topbar">
        <div className="signup-brand">ShapR</div>
      </header>

      <main className="signup-main">
        <section className="signup-card">
          <div className="signup-card-inner">

            <h1 className="signup-title">ShapR</h1>

            {error && (
              <div style={{
                background:"#fee2e2",
                color:"#dc2626",
                padding:"10px 14px",
                borderRadius:"8px",
                marginBottom:"12px",
                fontSize:"14px"
              }}>
                {error}
              </div>
            )}

            <label className="signup-label">Username</label>
            <div className="signup-input-wrap">
              <input
                className="signup-input"
                placeholder="choose_a_username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <label className="signup-label">Email Address</label>
            <div className="signup-input-wrap">
              <input
                className="signup-input"
                placeholder="name@company.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <label className="signup-label">Password</label>
            <div className="signup-input-wrap">
              <input
                className="signup-input"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="signup-pass-toggle"
                onClick={() => setShowPassword(v => !v)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button
              className="signup-btn-primary"
              type="button"
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>

            <p className="signup-footer-text">
              Already have an account? <Link to="/login">Log in</Link>
            </p>

          </div>
        </section>
      </main>
    </div>
  );
}