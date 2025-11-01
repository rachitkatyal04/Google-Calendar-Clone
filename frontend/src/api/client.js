import axios from "axios";

const client = axios.create({ baseURL: "/api" });

export async function getEvents(start, end) {
  const res = await client.get("/events", { params: { start, end } });
  return res.data;
}

export async function createEvent(payload) {
  const res = await client.post("/events", payload);
  return res.data;
}

export async function updateEvent(id, payload) {
  const res = await client.put(`/events/${id}`, payload);
  return res.data;
}

export async function deleteEvent(id) {
  await client.delete(`/events/${id}`);
}

export async function getHolidays(country, year) {
  // Prefer Google public holiday ICS for best parity with Google Calendar
  try {
    const g = await client.get(`/holidays/google/${country}/${year}`);
    let items = Array.isArray(g.data) ? g.data : [];
    // Deduplicate by title + start date
    const seen = new Set();
    items = items.filter((e) => {
      const key = `${e.title}-${new Date(e.start).toISOString().slice(0,10)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (items.length) return items;
  } catch (e) {
    // fall through to nager
  }
  // Fallback: Nager.Date
  const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`;
  const res = await axios.get(url, { timeout: 12000 });
  const items = (res.data || []).map((h) => {
    const [yy, mm, dd] = h.date.split("-").map((n) => Number(n));
    const start = new Date(yy, mm - 1, dd, 0, 0, 0, 0); // local midnight
    const end = new Date(yy, mm - 1, dd, 23, 59, 59, 999); // local day end
    return {
      _id: `holiday-${country}-${h.date}`,
      title: h.localName || h.name,
      description: h.name,
      start: start.toISOString(),
      end: end.toISOString(),
      allDay: true,
      color: '#34a853',
      country,
      year,
    };
  });
  return items;
}
