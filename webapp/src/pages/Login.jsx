import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { login, fetchProfile } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();

  const { setUser } = useAuth();

  /* =========================================
     STATES
  ========================================= */

  const [showPassword, setShowPassword] =
    useState(false);

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /* =========================================
     LOGIN HANDLER
  ========================================= */

  const handleLogin = async () => {
    try {
      setError("");

      // VALIDATION
      if (!username || !password) {
        setError(
          "Please fill in all fields."
        );

        return;
      }

      setLoading(true);

      /* =========================================
         LOGIN API
      ========================================= */

      const loginResponse = await login({
        username,
        password,
      });

      console.log(
        "Login Success:",
        loginResponse
      );

      /* =========================================
         FETCH USER PROFILE
      ========================================= */

      const profile =
        await fetchProfile();

      console.log(
        "User Profile:",
        profile
      );

      /* =========================================
         SAVE USER TO CONTEXT
      ========================================= */

      setUser(profile);

      /* =========================================
         REDIRECT
      ========================================= */

      navigate("/dashboard");
    } catch (err) {
      console.error(
        "Login Error:",
        err
      );

      // HANDLE DJANGO API ERRORS
      if (
        err.message.includes(
          "400"
        )
      ) {
        setError(
          "Invalid credentials."
        );
      } else if (
        err.message.includes(
          "401"
        )
      ) {
        setError(
          "Unauthorized access."
        );
      } else {
        setError(
          "Invalid username or password. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     UI
  ========================================= */

  return (
    <div className="login-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <header className="login-topbar">
        <div className="login-brand">
          ShapR
        </div>
      </header>

      {/* =========================================
          MAIN
      ========================================= */}

      <main className="login-main">
        <section className="login-card">

          <div className="login-card-inner">

            {/* TITLE */}
            <h1 className="login-title">
              ShapR
            </h1>

            <p className="login-subtitle">
              Welcome Back!
            </p>

            {/* ERROR */}
            {error && (
              <div
                style={{
                  background: "#fee2e2",
                  color: "#dc2626",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  marginBottom: "12px",
                  fontSize: "14px",
                }}
              >
                {error}
              </div>
            )}

            {/* USERNAME */}
            <label
              className="login-label"
              htmlFor="username"
            >
              Username
            </label>

            <div className="login-input-wrap">
              <input
                id="username"
                className="login-input"
                placeholder="your_username"
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
              />
            </div>

            {/* PASSWORD */}
            <label
              className="login-label"
              htmlFor="password"
            >
              Password
            </label>

            <div className="login-input-wrap">

              <input
                id="password"
                className="login-input"
                placeholder="••••••••"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  handleLogin()
                }
              />

              <button
                className="login-pass-toggle"
                type="button"
                onClick={() =>
                  setShowPassword(
                    (v) => !v
                  )
                }
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>
            </div>

            {/* LOGIN BUTTON */}
            <button
              className="login-btn-primary"
              type="button"
              onClick={handleLogin}
              disabled={loading}
            >
              <span>
                {loading
                  ? "Logging in..."
                  : "Login to Dashboard"}
              </span>
            </button>

            {/* FOOTER */}
            <p className="login-footer-text">
              Don&apos;t have an account?{" "}

              <button
                className="login-link login-footer-link"
                type="button"
                onClick={() =>
                  navigate("/signup")
                }
              >
                Sign up for free
              </button>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}