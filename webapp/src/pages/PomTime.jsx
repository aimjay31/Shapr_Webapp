import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PomTime.css";
import { useNightMode } from "../context/NightModeContext";
import { useSession } from "../context/SessionContext";

/* =========================================
   API CONFIG
========================================= */

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export const getToken = () =>
  localStorage.getItem("access_token");

async function authFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",

    ...(token &&
    token !== "undefined" &&
    token !== "null"
      ? { Authorization: `Token ${token}` }
      : {}),

    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;

    try {
      errMsg = JSON.stringify(await res.json());
    } catch (_) {}

    throw new Error(errMsg);
  }

  return res.json();
}

/* =========================================
   API ENDPOINTS
========================================= */

// END SESSION
async function endSessionAPI(data) {
  return authFetch("/api/study_session/end/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// FETCH HISTORY
async function fetchHistoryAPI() {
  return authFetch("/api/study_session/history/");
}

/* =========================================
   COMPONENT
========================================= */

export default function PomTime() {
  const { nightMode } = useNightMode();

  const {
    activeSession,
    setSessions,
    setActiveSession,
  } = useSession();

  const navigate = useNavigate();

  /* =========================================
     DURATIONS
  ========================================= */

  const DURATIONS = {
    focus:
      (activeSession?.work_duration ||
        activeSession?.workDuration ||
        25) * 60,

    short:
      (activeSession?.break_duration ||
        activeSession?.breakDuration ||
        5) * 60,

    long: 15 * 60,
  };

  /* =========================================
     STATES
  ========================================= */

  const [mode, setMode] = useState("focus");

  const [timeLeft, setTimeLeft] = useState(
    DURATIONS.focus
  );

  const [isRunning, setIsRunning] =
    useState(false);

  const targetCycles =
    activeSession?.cycles || 4;

  const [currentCycle, setCurrentCycle] =
    useState(1);

  const [showModal, setShowModal] =
    useState(false);

  const [finalResult, setFinalResult] =
    useState("Productive");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [history, setHistory] = useState([]);

  /* =========================================
     FETCH HISTORY
  ========================================= */

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await fetchHistoryAPI();

      console.log("History:", data);

      setHistory(data || []);
    } catch (err) {
      console.error(
        "Failed to load history:",
        err
      );
    }
  };

  /* =========================================
     TIMER LOGIC
  ========================================= */

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);

          setIsRunning(false);

          if (mode === "focus") {
            if (currentCycle < targetCycles) {
              setMode("short");

              setCurrentCycle(
                (prevCycle) =>
                  prevCycle + 1
              );

              return DURATIONS.short;
            } else {
              setMode("long");

              return DURATIONS.long;
            }
          } else {
            setMode("focus");

            return DURATIONS.focus;
          }
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    isRunning,
    mode,
    currentCycle,
    targetCycles,
    DURATIONS,
  ]);

  /* =========================================
     TIMER UI
  ========================================= */

  const totalTime = DURATIONS[mode];

  const progress = useMemo(
    () => timeLeft / totalTime,
    [timeLeft, totalTime]
  );

  const radius = 140;

  const circumference =
    2 * Math.PI * radius;

  const progressOffset =
    circumference *
    0.76 *
    (1 - progress);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);

    const secs = seconds % 60;

    return `${String(mins).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  /* =========================================
     CONTROLS
  ========================================= */

  const handleModeChange = (nextMode) => {
    setMode(nextMode);

    setTimeLeft(DURATIONS[nextMode]);

    setIsRunning(false);
  };

  const handlePlayPause = () => {
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);

    setTimeLeft(DURATIONS[mode]);
  };

  /* =========================================
     FINISH SESSION
  ========================================= */

  const handleFinish = () => {
    if (!activeSession) {
      alert(
        "Quick Timer Ended!\n\nYou didn't set up a formal Study Session, so this won't be saved to your Analytics Dashboard."
      );

      setIsRunning(false);

      navigate("/SessionForm");

      return;
    }

    setIsRunning(false);

    setShowModal(true);
  };

  /* =========================================
     SAVE SESSION TO API
  ========================================= */

  const handleSaveSession = async () => {
    try {
      setLoading(true);

      setError("");

      const completedSession = {
        subject:
          activeSession?.subject ||
          "Unplanned",

        productivity_rating:
          finalResult === "Productive"
            ? 10
            : 3,

        result: finalResult,

        duration:
          activeSession?.work_duration ||
          activeSession?.workDuration ||
          25,

        cycles:
          activeSession?.cycles || 4,

        mood:
          activeSession?.mood ||
          "Focused",

        sleep_hours:
          activeSession?.sleep_hours ||
          activeSession?.sleepHours ||
          7,
      };

      console.log(
        "Saving Session:",
        completedSession
      );

      // SAVE TO API
      const response =
        await endSessionAPI(
          completedSession
        );

      console.log(
        "Session Saved:",
        response
      );

      // UPDATE LOCAL CONTEXT
      setSessions((prev) => [
        ...prev,
        response,
      ]);

      // CLEAR ACTIVE SESSION
      setActiveSession(null);

      // CLOSE MODAL
      setShowModal(false);

      // REFRESH HISTORY
      await loadHistory();

      // REDIRECT
      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      setError(
        "Failed to save session."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     UI
  ========================================= */

  return (
    <div
      className={`pomtime-page${
        nightMode
          ? " night-mode"
          : ""
      }`}
    >
      <div className="pomtime-layout">

        {/* =========================================
            SIDEBAR
        ========================================= */}

        <aside className="pomtime-sidebar">
          <section className="pomtime-card pomtime-session-card">

            <h2 className="pomtime-section-title">
              Current Session
            </h2>

            <div className="session-highlight">
              <div className="session-icon-wrap">
                <IcoClock />
              </div>

              <div className="session-copy">
                <p className="session-title">
                  {activeSession?.subject ||
                    "Free Timer Mode"}
                </p>

                <p className="session-subtext">
                  {activeSession?.task_name ||
                    activeSession?.taskName ||
                    "Not tracking analytics"}
                </p>
              </div>
            </div>

            <div className="session-stats">

              <div className="stat-box">
                <span className="stat-label">
                  CYCLE
                </span>

                <span className="stat-value stat-value-purple">
                  {currentCycle} /{" "}
                  {targetCycles}
                </span>
              </div>

              <div className="stat-box">
                <span className="stat-label">
                  GOAL
                </span>

                <span className="stat-value">
                  {activeSession?.work_duration ||
                    activeSession?.workDuration ||
                    25}
                  m
                </span>
              </div>
            </div>

            {error && (
              <div className="pom-error">
                {error}
              </div>
            )}

            <button
              onClick={handleFinish}
              className="control-btn-play"
              style={{
                width: "100%",
                borderRadius: "12px",
                height: "50px",
                marginTop: "15px",
                fontSize: "14px",
                fontWeight: "800",
              }}
            >
              Finish Session
            </button>
          </section>

          {/* =========================================
              HISTORY
          ========================================= */}

          <section className="pomtime-card">
            <h2 className="pomtime-section-title">
              Session History
            </h2>

            <div className="history-list">
              {history.length === 0 ? (
                <p>No sessions yet.</p>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="history-item"
                  >
                    <h4>
                      {item.subject}
                    </h4>

                    <p>
                      Productivity:{" "}
                      {
                        item.productivity_rating
                      }
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>

        {/* =========================================
            MAIN TIMER
        ========================================= */}

        <main className="pomtime-main">
          <div className="pomtime-main-card">

            {/* TABS */}
            <div className="pomtime-tabs">

              <button
                className={`tab-btn ${
                  mode === "focus"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleModeChange(
                    "focus"
                  )
                }
              >
                Focus
              </button>

              <button
                className={`tab-btn ${
                  mode === "short"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleModeChange(
                    "short"
                  )
                }
              >
                Short Break
              </button>

              <button
                className={`tab-btn ${
                  mode === "long"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleModeChange(
                    "long"
                  )
                }
              >
                Long Break
              </button>
            </div>

            {/* TIMER */}
            <div className="timer-area">
              <div className="timer-ring">

                <svg
                  viewBox="0 0 340 340"
                  className="timer-svg"
                >
                  <circle
                    cx="170"
                    cy="170"
                    r={radius}
                    className="timer-track"
                  />

                  <circle
                    cx="170"
                    cy="170"
                    r={radius}
                    className="timer-progress"
                    style={{
                      strokeDasharray: `${
                        circumference * 0.76
                      } ${circumference}`,

                      strokeDashoffset:
                        progressOffset,
                    }}
                  />
                </svg>

                <div className="timer-content">
                  <h1 className="timer-time">
                    {formatTime(
                      timeLeft
                    )}
                  </h1>

                  <p className="timer-label">
                    {mode === "focus"
                      ? "TIME TO FOCUS"
                      : "TAKE A BREAK"}
                  </p>
                </div>
              </div>
            </div>

            {/* CONTROLS */}
            <div className="timer-controls">

              <button
                className="control-btn control-btn-small"
                onClick={handleReset}
              >
                ↺
              </button>

              <button
                className="control-btn control-btn-play"
                onClick={
                  handlePlayPause
                }
              >
                {isRunning
                  ? "⏸"
                  : "▶"}
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* =========================================
          PRODUCTIVITY MODAL
      ========================================= */}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">

            <h2 className="modal-title">
              Session Complete!
            </h2>

            <p className="modal-subtitle">
              Was your work on{" "}
              <b>
                {activeSession?.task_name ||
                  activeSession?.taskName}
              </b>{" "}
              productive?
            </p>

            <div className="result-toggle-group">

              <button
                className={`result-btn ${
                  finalResult ===
                  "Productive"
                    ? "active productive"
                    : ""
                }`}
                onClick={() =>
                  setFinalResult(
                    "Productive"
                  )
                }
              >
                ✓ Productive
              </button>

              <button
                className={`result-btn ${
                  finalResult ===
                  "Not Productive"
                    ? "active unproductive"
                    : ""
                }`}
                onClick={() =>
                  setFinalResult(
                    "Not Productive"
                  )
                }
              >
                ✕ Unproductive
              </button>
            </div>

            <button
              className="save-session-btn"
              onClick={
                handleSaveSession
              }
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : "Save & View Analytics"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================
   ICON
========================================= */

function IcoClock() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="pt-icon"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
      />

      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

