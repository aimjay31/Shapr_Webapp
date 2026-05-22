import React, {
  useState,
  useEffect,
} from "react";

import HistoryBlockComponent from "../components/History-Block_Component";

import "../styles/History_View.css";

import { useNightMode } from "../context/NightModeContext";

/* =========================================
   API CONFIG
========================================= */

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";

const getToken = () =>
  localStorage.getItem("access_token");

/* =========================================
   CONSTANTS
========================================= */

const COLUMNS = [
  "DATE & TIME",
  "SUBJECT",
  "DURATION",
  "MOOD",
  "SLEEP (HRS)",
  "RESULT",
];

const TIME_FILTERS = [
  "All time",
  "This week",
  "This month",
  "This year",
];

/* =========================================
   COMPONENT
========================================= */

export default function HistoryView() {
  const { nightMode } =
    useNightMode();

  /* =========================================
     STATES
  ========================================= */

  const [sessions, setSessions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [timeFilter, setTimeFilter] =
    useState("All time");

  const [
    selectedEntry,
    setSelectedEntry,
  ] = useState(null);

  /* =========================================
     FETCH HISTORY
  ========================================= */

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);

      setError("");

      const token = getToken();

      const response = await fetch(
        `${BASE_URL}/api/study_session/history/`,
        {
          method: "GET",

          headers: {
            "Content-Type":
              "application/json",

            ...(token
              ? {
                  Authorization: `Token ${token}`,
                }
              : {}),
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const data =
        await response.json();

      console.log(
        "Fetched Sessions:",
        data
      );

      setSessions(data || []);
    } catch (err) {
      console.error(
        "Fetch Error:",
        err
      );

      setError(
        "Failed to fetch session history."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     FILTERING
  ========================================= */

  const filtered = sessions.filter(
    (entry) => {
      const q =
        search.toLowerCase();

      const matchesSearch =
        entry.subject
          ?.toLowerCase()
          .includes(q) ||
        entry.task_name
          ?.toLowerCase()
          .includes(q) ||
        entry.period
          ?.toLowerCase()
          .includes(q) ||
        entry.environment
          ?.toLowerCase()
          .includes(q) ||
        entry.mood
          ?.toLowerCase()
          .includes(q) ||
        entry.date
          ?.toLowerCase()
          .includes(q) ||
        entry.result
          ?.toLowerCase()
          .includes(q);

      if (!matchesSearch)
        return false;

      // TIME FILTER
      const entryDate = new Date(
        entry.date
      );

      const now = new Date();

      if (
        timeFilter ===
        "This week"
      ) {
        const oneWeekAgo =
          new Date();

        oneWeekAgo.setDate(
          now.getDate() - 7
        );

        return (
          entryDate >= oneWeekAgo
        );
      }

      if (
        timeFilter ===
        "This month"
      ) {
        return (
          entryDate.getMonth() ===
            now.getMonth() &&
          entryDate.getFullYear() ===
            now.getFullYear()
        );
      }

      if (
        timeFilter ===
        "This year"
      ) {
        return (
          entryDate.getFullYear() ===
          now.getFullYear()
        );
      }

      return true;
    }
  );

  /* =========================================
     UI
  ========================================= */

  return (
    <div
      className={`history-container${
        nightMode
          ? " night-mode"
          : ""
      }`}
    >
      {/* TITLE */}
      <h1 className="history-title">
        History
      </h1>

      {/* ERROR */}
      {error && (
        <div className="history-error">
          {error}
        </div>
      )}

      <div className="history-card">

        {/* =========================================
            CONTROLS
        ========================================= */}

        <div className="history-controls">

          {/* SEARCH */}
          <div className="search-wrapper">
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle
                cx="11"
                cy="11"
                r="8"
              />

              <path d="M21 21l-4.35-4.35" />
            </svg>

            <input
              type="text"
              placeholder="Search Subject, Task, or Mood..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="search-input"
            />
          </div>

          {/* FILTER */}
          <div className="filter-wrapper">

            <svg
              className="filter-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </svg>

            <select
              value={timeFilter}
              onChange={(e) =>
                setTimeFilter(
                  e.target.value
                )
              }
              className="time-filter"
            >
              {TIME_FILTERS.map(
                (f) => (
                  <option
                    key={f}
                    value={f}
                  >
                    {f}
                  </option>
                )
              )}
            </select>

            <svg
              className="chevron-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7C5BD6"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* =========================================
            TABLE
        ========================================= */}

        <div className="table-wrapper">
          <table className="history-table">

            <thead>
              <tr className="table-header">
                {COLUMNS.map(
                  (col) => (
                    <th
                      key={col}
                      className="table-header-cell"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>

              {/* LOADING */}
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="empty-state"
                  >
                    Loading history...
                  </td>
                </tr>
              ) : filtered.length >
                0 ? (
                [...filtered]
                  .reverse()
                  .map(
                    (
                      entry,
                      i
                    ) => (
                      <HistoryBlockComponent
                        key={
                          entry.id ||
                          i
                        }
                        entry={
                          entry
                        }
                        onView={() =>
                          setSelectedEntry(
                            entry
                          )
                        }
                      />
                    )
                  )
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="empty-state"
                  >
                    No history records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================
          MODAL
      ========================================= */}

      {selectedEntry && (
        <div
          className="history-modal-overlay"
          onClick={() =>
            setSelectedEntry(
              null
            )
          }
        >
          <div
            className="history-modal-content"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <h2 className="history-modal-title">
              Session Details
            </h2>

            <p className="history-modal-subtitle">
              Reviewing your work on{" "}
              <b>
                {selectedEntry.task_name ||
                  selectedEntry.subject}
              </b>
            </p>

            <div className="details-grid">

              <div className="detail-item">
                <span>
                  Date & Time
                </span>

                <strong>
                  {
                    selectedEntry.date
                  }{" "}
                  •{" "}
                  {selectedEntry.start_time ||
                    selectedEntry.startTime}
                </strong>
              </div>

              <div className="detail-item">
                <span>
                  Study Period
                </span>

                <strong>
                  {
                    selectedEntry.period
                  }
                </strong>
              </div>

              <div className="detail-item">
                <span>
                  Environment
                </span>

                <strong>
                  {
                    selectedEntry.environment
                  }
                </strong>
              </div>

              <div className="detail-item">
                <span>
                  Target Cycles
                </span>

                <strong>
                  {
                    selectedEntry.cycles
                  }{" "}
                  Completed
                </strong>
              </div>

              <div className="detail-item">
                <span>
                  Duration
                </span>

                <strong>
                  {selectedEntry.duration ||
                    `${selectedEntry.work_duration} mins`}
                </strong>
              </div>

              <div className="detail-item">
                <span>
                  Wellness Status
                </span>

                <strong>
                  {
                    selectedEntry.mood
                  }{" "}
                  •{" "}
                  {selectedEntry.sleep_hours ||
                    selectedEntry.sleep}{" "}
                  hrs sleep
                </strong>
              </div>
            </div>

            <button
              className="history-close-btn"
              onClick={() =>
                setSelectedEntry(
                  null
                )
              }
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}