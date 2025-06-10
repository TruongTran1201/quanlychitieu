// entryUtils.ts
export interface Entry {
  id: number;
  user_id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

export function getYear(date: string) {
  return new Date(date).getFullYear();
}
export function getMonth(date: string) {
  return new Date(date).getMonth() + 1;
}
export function getNowDatetimeLocal() {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = now.getFullYear();
  const MM = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const HH = pad(now.getHours());
  const mm = pad(now.getMinutes());
  return `${yyyy}-${MM}-${dd}T${HH}:${mm}`;
}
