import { fetchAuthSession } from "aws-amplify/auth";

const API_URL = import.meta.env.VITE_API_URL;

async function authHeaders() {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function apiGet(path: string) {
  const res = await fetch(`${API_URL}${path}`, { headers: await authHeaders() });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error ?? `Request failed (${res.status})`);
  return body;
}

export async function apiPost(path: string, data: unknown) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error ?? `Request failed (${res.status})`);
  return body;
}

export async function getClientLatestSession(clientId: string) {
  return apiGet(`/coaching/clients/${clientId}/latest-session`);
}