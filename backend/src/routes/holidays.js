const express = require("express");
const axios = require("axios");

const router = express.Router();

// GET /api/holidays/:country/:year
// Proxies public holidays from Nager.Date and maps them to event-like objects
router.get("/:country/:year", async (req, res, next) => {
  try {
    const { country, year } = req.params;
    const url = `https://date.nager.at/api/v3/PublicHolidays/${encodeURIComponent(
      year
    )}/${encodeURIComponent(country)}`;
    const { data } = await axios.get(url, { timeout: 12000 });

    const events = (data || []).map((h) => {
      const start = new Date(`${h.date}T00:00:00.000Z`);
      const end = new Date(`${h.date}T23:59:59.999Z`);
      return {
        _id: `holiday-${country}-${h.date}`,
        title: h.localName || h.name,
        description: h.name,
        start,
        end,
        allDay: true,
        color: "#34a853", // Google green for holidays
        country,
        year: Number(year),
      };
    });

    res.json(events);
  } catch (err) {
    next(err);
  }
});

// Lightweight ICS parser for Google public holiday calendars
function parseIcs(icsText) {
  // Unfold lines per RFC 5545
  const lines = icsText
    .split(/\r?\n/)
    .reduce((acc, line) => {
      if (line.startsWith(" ") || line.startsWith("\t")) {
        acc[acc.length - 1] += line.slice(1);
      } else {
        acc.push(line);
      }
      return acc;
    }, []);

  const events = [];
  let inEvent = false;
  let ev = {};
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      ev = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (ev.dtstart && ev.summary) {
        events.push(ev);
      }
      inEvent = false;
      ev = {};
      continue;
    }
    if (!inEvent) continue;

    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const prop = line.slice(0, idx).toUpperCase();
    const value = line.slice(idx + 1);
    if (prop.startsWith("DTSTART")) ev.dtstart = value; // YYYYMMDD or timestamp
    else if (prop.startsWith("DTEND")) ev.dtend = value;
    else if (prop === "SUMMARY") ev.summary = value;
  }
  return events;
}

function parseDateYyyyMmDd(s) {
  // Supports YYYYMMDD (LOCAL time to avoid TZ shifting on all-day events)
  const y = Number(s.slice(0, 4));
  const m = Number(s.slice(4, 6)) - 1;
  const d = Number(s.slice(6, 8));
  return new Date(y, m, d, 0, 0, 0, 0);
}

function dayEnd(dateLocal) {
  const d = new Date(dateLocal);
  d.setHours(23, 59, 59, 999);
  return d;
}

// GET /api/holidays/google/:country/:year
// country currently supports IN (India) via Google public holiday ICS
router.get("/google/:country/:year", async (req, res, next) => {
  try {
    const { country, year } = req.params;
    let calendarId;
    switch ((country || "").toUpperCase()) {
      case "IN":
        calendarId = "en.indian#holiday@group.v.calendar.google.com";
        break;
      default:
        return res.status(400).json({ message: "Unsupported country for Google ICS" });
    }
    const url = `https://calendar.google.com/calendar/ical/${encodeURIComponent(calendarId)}/public/basic.ics`;
    const { data: ics } = await axios.get(url, { responseType: "text" });
    const vevents = parseIcs(ics);
    const yr = Number(year);
    const events = vevents
      .map((v) => {
        if (!v.dtstart) return null;
        // dtend for all-day is exclusive; compute inclusive end
        const start = v.dtstart.length === 8 ? parseDateYyyyMmDd(v.dtstart) : new Date(v.dtstart);
        let end;
        if (v.dtend) {
          const rawEnd = v.dtend.length === 8 ? parseDateYyyyMmDd(v.dtend) : new Date(v.dtend);
          end = new Date(rawEnd.getTime() - 1); // make inclusive by subtracting 1ms
        } else {
          end = dayEnd(start);
        }
        return {
          _id: `holiday-g-${country}-${start.toISOString().slice(0,10)}`,
          title: v.summary,
          description: v.summary,
          start,
          end,
          allDay: true,
          color: "#34a853",
          country: country.toUpperCase(),
          year: start.getUTCFullYear(),
        };
      })
      .filter(Boolean)
      .filter((e) => e.year === yr);

    res.json(events);
  } catch (err) {
    next(err);
  }
});

module.exports = router;


