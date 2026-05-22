import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProfile, getToken } from "../api/api";

export default function Landing() {
  const navigate = useNavigate();

  /* =========================================
     AUTO REDIRECT IF LOGGED IN
  ========================================= */

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = getToken();

      // IF NO TOKEN, STAY ON LANDING PAGE
      if (!token) return;

      // VERIFY TOKEN USING API
      const profile = await fetchProfile();

      console.log("Authenticated User:", profile);

      // REDIRECT TO DASHBOARD
      navigate("/dashboard");
    } catch (err) {
      console.error(
        "Authentication Check Failed:",
        err
      );
    }
  };

  /* =========================================
     UI
  ========================================= */

  return (
    <div
      style={{
        height: "100vh",
        background:
          "linear-gradient(135deg, #6A0DAD, #4B0082)",

        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",

        fontFamily: "Arial",
      }}
    >

      {/* TITLE */}
      <h1
        style={{
          color: "#e7c6ff",
          fontSize: "48px",
          marginBottom: "10px",
        }}
      >
        Welcome to ShapR
      </h1>

      {/* SUBTITLE */}
      <p
        style={{
          color: "#d69dff",
          marginBottom: "30px",
          fontSize: "18px",
        }}
      >
        Shape the way you learn.
      </p>

      {/* BUTTONS */}
      <div
        style={{
          display: "flex",
          gap: "15px",
        }}
      >

        {/* LOGIN */}
        <button
          onClick={() =>
            navigate("/login")
          }
          style={{
            padding: "12px 24px",

            backgroundColor: "#6A0DAD",

            color: "white",

            border: "none",

            borderRadius: "8px",

            cursor: "pointer",

            fontSize: "16px",

            fontWeight: "600",
          }}
        >
          Login
        </button>

        {/* SIGNUP */}
        <button
          onClick={() =>
            navigate("/signup")
          }
          style={{
            padding: "12px 24px",

            backgroundColor: "#4B0082",

            color: "white",

            border: "none",

            borderRadius: "8px",

            cursor: "pointer",

            fontSize: "16px",

            fontWeight: "600",
          }}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}