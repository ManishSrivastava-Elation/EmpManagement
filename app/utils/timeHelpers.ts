// utils/timeHelpers.ts

/**
 * Get current UTC date
 */
export const getUTCNow = (): Date => {
  return new Date();
};

/**
 * Get UTC ISO string (YYYY-MM-DDTHH:mm:ss.sssZ)
 */
export const getUTCISOString = (date: Date = new Date()): string => {
  return date.toISOString();
};

/**
 * Get UTC date in YYYY-MM-DD format
 */
export const getUTCDate = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Get UTC time in HH:mm:ss format
 */
export const getUTCTime = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[1].split('.')[0];
};

/**
 * Convert UTC date string to Date object
 */
export const toUTCDate = (dateStr: string): Date => {
  return new Date(dateStr);
};

/**
 * Extract time from UTC date string (HH:mm)
 */
export const extractTime = (utcDateStr: string): string => {
  const date = new Date(utcDateStr);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Get IST date (for display purposes only)
 */
export const getISTDate = (): Date => {
  const now = new Date();
  return new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
};

/**
 * Format for database (YYYY-MM-DD HH:mm:ss)
 */
export const getDatabaseFormatTime = (date: Date = new Date()): string => {
  const iso = date.toISOString();
  return iso.replace('T', ' ').split('.')[0];
};

/**
 * Get greeting based on UTC hour
 */
export const getGreeting = (): string => {
  const hour = new Date().getUTCHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

/**
 * Format working hours
 */
export const formatWorkingHours = (minutes: number): string => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
};

/**
 * Format UTC ISO string to IST time → "09:32 AM"
 */
export const formatTimeIST = (utcStr: string | null | undefined): string => {
  if (!utcStr) return '—';
  const date = new Date(utcStr);
  const ist = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  const h = ist.getUTCHours();
  const m = ist.getUTCMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m} ${ampm}`;
};

/**
 * Format UTC ISO string to IST date → "22 Jun 2026"
 */
export const formatDateIST = (utcStr: string | null | undefined): string => {
  if (!utcStr) return '—';
  const date = new Date(utcStr);
  const ist = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toUTCString().slice(5, 16); // "22 Jun 2026"
};

/**
 * Calculate duration between two UTC ISO strings → "4h 55m" | null if no checkout
 */
export const calcDuration = (
  checkIn: string | null | undefined,
  checkOut: string | null | undefined,
): string | null => {
  if (!checkIn || !checkOut) return null;
  const mins = Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 60000);
  if (mins < 0) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

/**
 * Get YYYY-MM-DD from a Date (local)
 */
export const toYMD = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Get formatted date for display
 */
export const getFormattedDate = (): string => {
  const now = getUTCNow();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return now.toLocaleDateString('en-US', options);
};

/**
 * Get formatted time for display
 */
export const getFormattedTime = (): string => {
  const now = getUTCNow();
  return now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

export const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${day} ${month} ${year}, ${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
};