"use strict";

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const dotenv = require("dotenv");
const Librus = require("librus-api");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const ALLOWED_ORIGINS = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const SESSION_TTL_MS =
  Number(process.env.SESSION_TTL_MINUTES || 60) * 60 * 1000;

app.use(
  cors({
    origin: ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS : "*",
    credentials: true,
  })
);
app.use(express.json());

const sessions = new Map();

const createSession = (client, user) => {
  const sessionId = crypto.randomBytes(16).toString("hex");
  const now = Date.now();

  sessions.set(sessionId, { client, user, createdAt: now, lastUsed: now });
  return sessionId;
};

const ensureSession = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const sessionId =
    req.headers["x-session-id"] ||
    (authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : "");

  if (!sessionId) {
    return res.status(401).json({ message: "Brak aktywnej sesji" });
  }

  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(401).json({ message: "Sesja wygasła lub jest nieprawidłowa" });
  }

  session.lastUsed = Date.now();
  req.librusClient = session.client;
  req.sessionUser = session.user;
  req.sessionId = sessionId;

  return next();
};

setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.lastUsed > SESSION_TTL_MS) {
      sessions.delete(sessionId);
    }
  }
}, Math.min(SESSION_TTL_MS, 10 * 60 * 1000));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/login", async (req, res) => {
  const { login, password } = req.body || {};

  if (!login || !password) {
    return res.status(400).json({ message: "Login i hasło są wymagane" });
  }

  const client = new Librus();

  try {
    await client.authorize(login, password);
    const account = await client.info.getAccountInfo();
    const sessionId = createSession(client, account);

    return res.json({
      sessionId,
      user: account,
    });
  } catch (error) {
    console.error("Login failed", error?.message || error);
    return res
      .status(401)
      .json({ message: "Nie udało się zalogować. Sprawdź dane i spróbuj ponownie." });
  }
});

app.get("/api/grades", ensureSession, async (req, res) => {
  try {
    const grades = await req.librusClient.info.getGrades();
    return res.json({
      grades,
      student: req.sessionUser?.student || null,
    });
  } catch (error) {
    console.error("Grades fetch failed", error?.message || error);
    return res
      .status(500)
      .json({ message: "Nie udało się pobrać ocen. Spróbuj ponownie później." });
  }
});

app.get("/api/attendance", ensureSession, async (req, res) => {
  try {
    const absences = await req.librusClient.absence.getAbsences();
    const entryIds = [];
    Object.values(absences || {}).forEach((list) => {
      (list || []).forEach((row) => {
        (row?.table || []).forEach((cell) => {
          if (cell?.id) entryIds.push(cell.id);
        });
      });
    });

    const uniqueIds = Array.from(new Set(entryIds));

    const detailed = await Promise.all(
      uniqueIds.map(async (id) => {
        try {
          const detail = await req.librusClient.absence.getAbsence(id);
          return { id, ...detail };
        } catch (error) {
          console.error("Absence detail failed", id, error?.message || error);
          return null;
        }
      })
    ).then((arr) => arr.filter(Boolean));
    const perSubject = detailed.reduce((acc, item) => {
      const subject = item.subject || "Inne";
      if (!acc[subject]) acc[subject] = { total: 0, perType: {} };
      acc[subject].total += 1;
      const typeKey = item.type || "inne";
      acc[subject].perType[typeKey] = (acc[subject].perType[typeKey] || 0) + 1;
      return acc;
    }, {});

    return res.json({
      absences,
      details: {
        perSubject,
        totalDetailed: detailed.length,
      },
      student: req.sessionUser?.student || null,
    });
  } catch (error) {
    console.error("Attendance fetch failed", error?.message || error);
    return res
      .status(500)
      .json({ message: "Nie udało się pobrać frekwencji. Spróbuj ponownie później." });
  }
});

app.get("/api/timetable", ensureSession, async (req, res) => {
  const { from, to } = req.query || {};
  try {
    const timetable = await req.librusClient.calendar.getTimetable(from, to);
    return res.json({
      timetable,
      student: req.sessionUser?.student || null,
    });
  } catch (error) {
    console.error("Timetable fetch failed", error?.message || error);
    return res
      .status(500)
      .json({ message: "Nie udało się pobrać planu lekcji. Spróbuj ponownie później." });
  }
});

app.listen(PORT, () => {
  console.log(`Librus proxy API listening on port ${PORT}`);
});
