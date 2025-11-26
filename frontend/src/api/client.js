import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

export const loginRequest = async (payload) => {
  const { data } = await api.post("/login", payload);
  return data;
};

export const fetchGrades = async (sessionId) => {
  const { data } = await api.get("/grades", {
    headers: {
      "x-session-id": sessionId,
    },
  });
  return data;
};

export const fetchAttendance = async (sessionId) => {
  const { data } = await api.get("/attendance", {
    headers: {
      "x-session-id": sessionId,
    },
  });
  return data;
};

export const fetchTimetable = async (sessionId, params = {}) => {
  const { data } = await api.get("/timetable", {
    params,
    headers: {
      "x-session-id": sessionId,
    },
  });
  return data;
};

export default api;
