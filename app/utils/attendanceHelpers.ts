import { extractTime } from "./timeHelpers";

export type AttendanceStatus = "present" | "absent" | "na" | null;

export interface PunchRecord {
  site: string;
  checkIn: string;
  checkOut: string | null;
  detail?: string;
  remarks?: string;
  address?: string;
  dynamicAddress?: string;
  checkInTime?: string;
  checkOutTime?: string | null;
  checkInImg?: string;
  checkOutImg?: string;
  status?: 'approved' | 'rejected' | 'pending';
}

export interface DayAttendance {
  status: AttendanceStatus;
  punches: PunchRecord[];
}

export interface AttendanceApiRecord {
  AttendanceId: number;
  CompanyId: number;
  EmployeeId: number;
  CheckInTime: string | null;
  CheckOutTime: string | null;
  CheckInLatitude?: string;
  CheckInLongitude?: string;
  CheckOutLatitude?: string | null;
  CheckOutLongitude?: string | null;
  CheckInSelfieUrl?: string | null;
  CheckOutSelfieUrl?: string | null;
  IsWithinGeoFence: number | boolean;
  Remarks?: string;
  CreatedAt: string;
  DynamicAddress?: string;
  LocationSource?: string;
  AccuracyMeters?: string;
  FaceVerified?: number | boolean;
  ImageTimestamp?: string;
  DeviceInfo?: string;
  LocalId?: string;
  Address?: string;
  CompanyName?: string;
  EmployeeName?: string;
  EmployeeCode?: string;
  MobileNo?: string;
  Status?: 'approved' | 'rejected' | 'pending';
}

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const STATUS_CFG = {
  present: { color: "#22C55E", icon: "check-circle", label: "Present" },
  absent: { color: "#EF4444", icon: "close-circle", label: "Absent" },
  na: { color: "#6B7280", icon: "minus-circle-outline", label: "N/A" },
} as const;

export function extractISTDateParts(dateStr: string): { year: number; month: number; day: number } {
  const d = new Date(dateStr);
  return {
    year: d.getFullYear(),
    month: d.getMonth(),
    day: d.getDate(),
  };
}

export function generateAttendance(
  year: number,
  month: number,
): Record<number, AttendanceStatus> {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const result: Record<number, AttendanceStatus> = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const checkDate = new Date(year, month, d);
    
    // Future days are null, past days default to absent (which gets overridden by present records)
    if (checkDate > today) {
      result[d] = null;
    } else {
      result[d] = "absent";
    }
  }
  return result;
}

export function toDateObj(year: number, month: number, day: number): Date {
  return new Date(year, month, day);
}

export function fmtDate(d: Date): string {
  return `${d.getDate().toString().padStart(2, "0")} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

export function parseAttendanceRecords(
  records: AttendanceApiRecord[],
): Record<string, DayAttendance> {
  const normalized: Record<string, DayAttendance> = {};

  records.forEach((record) => {
    const rawDate = record.CheckInTime || record.CreatedAt;
    if (!rawDate) return;

    const { year, month, day } = extractISTDateParts(rawDate);
    const key = `${year}-${month}-${day}`;
    
    // Extract checkin/checkout time. Use fallback to local formatting if extractTime format issues
    let checkIn = '09:00 AM';
    if (record.CheckInTime) {
      try {
        const timeParts = record.CheckInTime.split('T')[1]?.split(':');
        if (timeParts) {
          const h = parseInt(timeParts[0]);
          const m = timeParts[1];
          const ampm = h >= 12 ? 'PM' : 'AM';
          checkIn = `${h % 12 || 12}:${m} ${ampm}`;
        }
      } catch {
        checkIn = extractTime(record.CheckInTime);
      }
    }

    let checkOut: string | null = null;
    if (record.CheckOutTime) {
      try {
        const timeParts = record.CheckOutTime.split('T')[1]?.split(':');
        if (timeParts) {
          const h = parseInt(timeParts[0]);
          const m = timeParts[1];
          const ampm = h >= 12 ? 'PM' : 'AM';
          checkOut = `${h % 12 || 12}:${m} ${ampm}`;
        }
      } catch {
        checkOut = extractTime(record.CheckOutTime);
      }
    }

    const site = record.DynamicAddress || record.Address || record.CompanyName || "Office";

    const punch: PunchRecord = {
      site,
      checkIn,
      checkOut,
      detail: site,
      remarks: record.Remarks,
      address: record.Address,
      dynamicAddress: record.DynamicAddress,
      checkInTime: record.CheckInTime ?? undefined,
      checkOutTime: record.CheckOutTime,
      checkInImg: record.CheckInSelfieUrl || undefined,
      checkOutImg: record.CheckOutSelfieUrl || undefined,
      status: record.Status || 'approved',
    };

    if (!normalized[key]) {
      normalized[key] = { status: "present", punches: [punch] };
    } else {
      normalized[key].punches.push(punch);
    }
  });

  return normalized;
}

export function buildAttendanceStatusMap(
  year: number,
  month: number,
  records: AttendanceApiRecord[],
): Record<number, AttendanceStatus> {
  const statusMap = generateAttendance(year, month);
  const normalized = parseAttendanceRecords(records);

  Object.keys(normalized).forEach((key) => {
    const [y, m, d] = key.split("-").map(Number);
    if (y === year && m === month) {
      statusMap[d] = normalized[key].status;
    }
  });

  return statusMap;
}
