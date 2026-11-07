export type DemoRequest = {
  name: string;
  phone: string;
  email: string;
  at: string;
};

const KEY = "hayvra-demo-requests";

export function saveDemoRequest(entry: DemoRequest) {
  try {
    const raw = localStorage.getItem(KEY);
    const prev: unknown = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(prev) ? prev : [];
    localStorage.setItem(KEY, JSON.stringify([...list, entry].slice(-20)));
  } catch {
    /* private mode or blocked storage — the confirmation still stands */
  }
}
