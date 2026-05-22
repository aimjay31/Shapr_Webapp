const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const getToken = () => localStorage.getItem("access_token");

export async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(getToken()
        ? { Authorization: `Token ${getToken()}` }
        : {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.detail || `HTTP ${res.status}`);
  }

  return data;
}