import React, { useState, useEffect, useMemo } from "react";
import "../styles/Dashboard.css";
import TipsComponent from "../components/TipsComponent";
import { useNightMode } from "../context/NightModeContext";

/* =======================
   FETCH CONFIG
======================= */

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const getToken = () => localStorage.getItem("access_token");

/* =======================
   NORMALIZE DATA
======================= */

const normalize = (s) => ({
  date: s.date || s.created_at || "",
  subject: s.subject || "General",
  taskName: s.taskName || s.task_name || "",
  duration: parseInt(s.duration || s.duration_minutes || 0),
  mood: s.mood || "Neutral",
  sleep: s.sleep || s.sleep_hours || 0,
  result:
    s.result ||
    (s.productivity_rating >= 1 ? "Productive" : "Not Productive"),
  period: s.period || "Morning",
});

/* ======================= */

export default function Dashboard() {
  const { nightMode } = useNightMode();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTips, setShowTips] = useState(true);
  const [timeFilter, setTimeFilter] = useState("All time");

  /* =======================
     FETCH DATA
  ======================= */

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        const res = await fetch(
          `${BASE_URL}/api/study_session/history/`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Token ${token}` } : {}),
            },
          }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const raw = await res.json();

        const list = Array.isArray(raw)
          ? raw
          : raw.results || raw.data || [];

        setSessions(list.map(normalize));
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  /* =======================
     FILTER
  ======================= */

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (timeFilter === "All time") return true;

      const d = new Date(s.date);
      const now = new Date();

      if (timeFilter === "Today")
        return d.toDateString() === now.toDateString();

      if (timeFilter === "This week") {
        const diff = Math.ceil((now - d) / 86400000);
        return diff <= 7;
      }

      if (timeFilter === "This month") {
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }

      return true;
    });
  }, [sessions, timeFilter]);

  /* =======================
     METRICS
  ======================= */

  const totalSessions = filtered.length;

  const productive = filtered.filter(
    (s) => s.result === "Productive"
  ).length;

  const productivityScore = totalSessions
    ? Math.round((productive / totalSessions) * 100)
    : 0;

  const totalMinutes = filtered.reduce(
    (a, s) => a + (s.duration || 0),
    0
  );

  const avgMinutes = totalSessions
    ? Math.round(totalMinutes / totalSessions)
    : 0;

  const avgHr = Math.floor(avgMinutes / 60);
  const avgMin = avgMinutes % 60;

  /* =======================
     AI INSIGHTS
  ======================= */

  const aiInsights = useMemo(() => {
    const insights = [];

    if (totalSessions === 0) {
      return ["📊 No study sessions yet. Start your first session to get insights."];
    }

    if (productivityScore >= 80) {
      insights.push("🔥 Excellent focus consistency.");
    } else if (productivityScore >= 50) {
      insights.push("📈 Moderate productivity level.");
    } else {
      insights.push("⚠️ Low productivity detected.");
    }

    if (avgMinutes > 90) {
      insights.push("⏱️ Try shorter focus sessions (25–50 mins).");
    }

    if (productive === 0) {
      insights.push("❌ No productive sessions detected.");
    }

    return insights;
  }, [productivityScore, avgMinutes, productive, totalSessions]);

  /* ======================= */

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, color: "red" }}>
        {error}
      </div>
    );
  }

  /* =======================
     STYLE HELPERS
  ======================= */

  const cardStyle = {
    background: nightMode ? "#1a102b" : "#fff",
    border: nightMode ? "1px solid #2d1b4d" : "1px solid #eee",
    borderRadius: "16px",
    padding: "18px",
    boxShadow: nightMode
      ? "none"
      : "0 8px 20px rgba(0,0,0,0.05)",
  };

  const labelStyle = {
    fontSize: "13px",
    opacity: 0.7,
  };

  const valueStyle = {
    fontSize: "26px",
    fontWeight: "800",
    marginTop: "8px",
  };

  /* =======================
     UI
  ======================= */

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1200px",
        margin: "0 auto",
        color: nightMode ? "#fff" : "#000",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ fontSize: "28px" }}>Dashboard</h1>

        <button
          onClick={() => setShowTips(!showTips)}
          style={{
            padding: "8px 14px",
            borderRadius: "10px",
            border: "none",
            background: "#6A0DAD",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {showTips ? "Hide Tips" : "Show Tips"}
        </button>
      </div>

      {/* METRIC BLOCKS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        <div style={cardStyle}>
          <div style={labelStyle}>Total Sessions</div>
          <div style={valueStyle}>{totalSessions}</div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Productivity Score</div>
          <div style={valueStyle}>{productivityScore}%</div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Average Duration</div>
          <div style={valueStyle}>
            {avgHr}h {avgMin}m
          </div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Productive Sessions</div>
          <div style={valueStyle}>{productive}</div>
        </div>
      </div>

      {/* AI INSIGHTS */}
      <div
        style={{
          marginTop: "24px",
          padding: "18px",
          borderRadius: "16px",
          background: nightMode ? "#1a102b" : "#f8f5ff",
        }}
      >
        <h2>🧠 AI Insights</h2>

        {aiInsights.map((i, idx) => (
          <div
            key={idx}
            style={{
              padding: "10px",
              marginTop: "8px",
              borderRadius: "10px",
              background: nightMode ? "#24143d" : "#fff",
            }}
          >
            {i}
          </div>
        ))}
      </div>

      {/* TIPS */}
      {showTips && <TipsComponent />}
    </div>
  );
}