import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SessionForm.css";
import { useNightMode } from "../context/NightModeContext";
import { useSession } from "../context/SessionContext";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const getToken = () => localStorage.getItem("access_token");

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

/* =========================
   API ENDPOINTS
========================= */

// Start Study Session
async function startSessionAPI(data) {
  return authFetch("/api/study_session/start/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Fetch Previous Sessions / History
async function fetchHistoryAPI() {
  return authFetch("/api/study_session/history/");
}

export default function SessionForm() {
  const { nightMode } = useNightMode();
  const { setActiveSession } = useSession();
  const navigate = useNavigate();

  /* =========================
     FORM STATES
  ========================= */

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [startTime, setStartTime] = useState("08:00");

  const [subject, setSubject] = useState("");
  const [taskName, setTaskName] = useState("");

  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [cycles, setCycles] = useState(4);

  const [mood, setMood] = useState("Focused");
  const [sleepHours, setSleepHours] = useState(7);
  const [environment, setEnvironment] = useState("Quiet Room");

  /* =========================
     API STATES
  ========================= */

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     FETCH SESSION HISTORY
  ========================= */

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);

      const data = await fetchHistoryAPI();

      console.log("History API Response:", data);

      setHistory(data || []);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  /* =========================
     STUDY PERIOD
  ========================= */

  const getStudyPeriod = (timeStr) => {
    const hour = parseInt(timeStr.split(":")[0], 10);

    if (hour >= 6 && hour < 12) return "Morning Hours";
    if (hour >= 12 && hour < 18) return "Afternoon Hours";
    if (hour >= 18 && hour < 24) return "Evening Hours";

    return "Late Night Hours";
  };

  /* =========================
     START SESSION
  ========================= */

  const handleStartSession = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      const sessionPayload = {
        date,
        start_time: startTime,
        period: getStudyPeriod(startTime),

        subject: subject || "General Study",

        task_name: taskName || "Quick Focus",

        work_duration: workDuration || 25,
        break_duration: breakDuration || 5,
        cycles: cycles || 4,

        mood,
        sleep_hours: sleepHours,
        environment,

        productivity_rating: 0,
      };

      console.log("Submitting Session:", sessionPayload);

      // SAVE TO DATABASE USING API
      const response = await startSessionAPI(sessionPayload);

      console.log("Session Started:", response);

      // SAVE TO CONTEXT
      setActiveSession({
        ...sessionPayload,
        id: response?.id,
      });

      // REFRESH HISTORY
      await loadHistory();

      // REDIRECT
      navigate("/pomtime");
    } catch (err) {
      console.error(err);

      setError("Failed to start session.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`sf-main${nightMode ? " night-mode" : ""}`}>
      <h1 className="sf-title">Prepare Study Session</h1>

      {error && (
        <div className="sf-error">
          {error}
        </div>
      )}

      <form
        className="sf-form"
        onSubmit={handleStartSession}
      >
        {/* =========================
            TIMER SETUP
        ========================= */}

        <section className="sf-panel">
          <div className="sf-panel-head">
            Target & Timer
          </div>

          <div className="sf-panel-body">
            <div className="sf-grid-3">

              {/* DATE */}
              <div className="sf-field">
                <label className="sf-label">
                  Date
                </label>

                <div className="sf-inputWrap">
                  <span className="sf-icon">
                    <IcoCalendar />
                  </span>

                  <input
                    className="sf-input"
                    type="date"
                    value={date}
                    onChange={(e) =>
                      setDate(e.target.value)
                    }
                  />
                </div>
              </div>

              {/* START TIME */}
              <div className="sf-field">
                <label className="sf-label">
                  Study Start Time
                </label>

                <div className="sf-inputWrap">
                  <span className="sf-icon">
                    <IcoClock />
                  </span>

                  <input
                    className="sf-input"
                    type="time"
                    value={startTime}
                    onChange={(e) =>
                      setStartTime(e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              {/* SUBJECT */}
              <div className="sf-field">
                <label className="sf-label">
                  Subject
                </label>

                <div className="sf-inputWrap">
                  <span className="sf-icon">
                    <IcoHome />
                  </span>

                  <input
                    className="sf-input"
                    type="text"
                    placeholder="e.g., Statistics"
                    value={subject}
                    onChange={(e) =>
                      setSubject(e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <div className="sf-grid-3 sf-mt">

              {/* TASK */}
              <div className="sf-field">
                <label className="sf-label">
                  Specific Task
                </label>

                <div className="sf-inputWrap">
                  <span className="sf-icon">
                    <IcoSpark />
                  </span>

                  <input
                    className="sf-input"
                    type="text"
                    placeholder="e.g., Chapter 4 Quiz"
                    value={taskName}
                    onChange={(e) =>
                      setTaskName(e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              {/* WORK DURATION */}
              <div className="sf-field">
                <label className="sf-label">
                  Work (mins)
                </label>

                <input
                  className="sf-input plain"
                  type="number"
                  min="1"
                  value={workDuration}
                  onChange={(e) => {
                    const val = e.target.value;

                    setWorkDuration(
                      val === ""
                        ? ""
                        : parseInt(val, 10)
                    );
                  }}
                />
              </div>

              {/* CYCLES */}
              <div className="sf-field">
                <label className="sf-label">
                  Target Cycles
                </label>

                <input
                  className="sf-input plain"
                  type="number"
                  min="1"
                  value={cycles}
                  onChange={(e) => {
                    const val = e.target.value;

                    setCycles(
                      val === ""
                        ? ""
                        : parseInt(val, 10)
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            WELLNESS
        ========================= */}

        <div className="sf-lowerGrid">

          {/* WELLNESS */}
          <section className="sf-panel">
            <div className="sf-panel-head withIco">
              <span className="sf-headIco">
                <IcoSpark />
              </span>

              Wellness Predictors
            </div>

            <div className="sf-panel-body">

              {/* MOOD */}
              <div className="sf-field">
                <label className="sf-label">
                  Current Mood
                </label>

                <select
                  className="sf-input plain"
                  value={mood}
                  onChange={(e) =>
                    setMood(e.target.value)
                  }
                >
                  <option>Focused</option>
                  <option>Motivated</option>
                  <option>Neutral</option>
                  <option>Tired</option>
                  <option>Stressed</option>
                  <option>Sleepy</option>
                </select>
              </div>

              {/* SLEEP */}
              <div className="sf-sleepTop">
                <label className="sf-label">
                  Sleep Hours (Last Night)
                </label>

                <span className="sf-sleepVal">
                  {sleepHours}h
                </span>
              </div>

              <input
                className="sf-range"
                type="range"
                min="0"
                max="12"
                value={sleepHours}
                onChange={(e) =>
                  setSleepHours(
                    Number(e.target.value)
                  )
                }
              />

              <div className="sf-rangeMarks">
                <span>0</span>
                <span>12</span>
              </div>
            </div>
          </section>

          {/* ENVIRONMENT */}
          <section className="sf-panel">
            <div className="sf-panel-head withIco">
              <span className="sf-headIco home">
                <IcoHome />
              </span>

              Environment
            </div>

            <div className="sf-panel-body">

              {/* ENVIRONMENT */}
              <div className="sf-field">
                <label className="sf-label">
                  Study Environment
                </label>

                <select
                  className="sf-input plain"
                  value={environment}
                  onChange={(e) =>
                    setEnvironment(e.target.value)
                  }
                >
                  <option>Quiet Room</option>
                  <option>Library</option>
                  <option>Room with Music</option>
                  <option>Noisy</option>
                </select>
              </div>

              {/* BREAK */}
              <div className="sf-field sf-mt">
                <label className="sf-label">
                  Break (mins)
                </label>

                <input
                  className="sf-input plain"
                  type="number"
                  min="1"
                  value={breakDuration}
                  onChange={(e) => {
                    const val = e.target.value;

                    setBreakDuration(
                      val === ""
                        ? ""
                        : parseInt(val, 10)
                    );
                  }}
                />
              </div>
            </div>
          </section>
        </div>

        {/* BUTTON */}
        <div className="sf-actions sf-mt">
          <button
            type="submit"
            className="sf-saveBtn"
            disabled={submitting}
          >
            {submitting
              ? "Starting Session..."
              : "Start Focus Timer"}
          </button>
        </div>
      </form>

      {/* =========================
          SESSION HISTORY
      ========================= */}

      <section className="sf-panel sf-mt">
        <div className="sf-panel-head">
          Session History
        </div>

        <div className="sf-panel-body">

          {loadingHistory ? (
            <p>Loading history...</p>
          ) : history.length === 0 ? (
            <p>No study sessions found.</p>
          ) : (
            <div className="sf-historyList">
              {history.map((session) => (
                <div
                  key={session.id}
                  className="sf-historyItem"
                >
                  <h4>{session.subject}</h4>

                  <p>
                    Date: {session.date}
                  </p>

                  <p>
                    Productivity:{" "}
                    {session.productivity_rating}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* =========================
   ICONS
========================= */

function IcoCalendar() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="sf-svg"
      aria-hidden="true"
    >
      <path
        d="M7 2v3M17 2v3M4 8h16M6 5h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IcoClock() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="sf-svg"
      aria-hidden="true"
    >
      <path
        d="M12 22a10 10 0 1 1 10-10 10 10 0 0 1-10 10Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />

      <path
        d="M12 6v6l4 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IcoSpark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="sf-svg"
      aria-hidden="true"
    >
      <path
        d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IcoHome() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="sf-svg"
      aria-hidden="true"
    >
      <path
        d="M3 10.5 12 3l9 7.5V21a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2V10.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
