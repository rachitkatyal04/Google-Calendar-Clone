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
