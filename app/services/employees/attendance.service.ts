// services/employees/attendance.service.ts

import { api } from "@/api/api";
import { endpoints } from "@/api/apis";

export interface CheckInPayload {
  CheckInTime: string;
  CheckInLatitude: string;
  CheckInLongitude: string;
  IsWithinGeoFence: boolean;
  DynamicAddress: string;
  LocationSource: string;
  AccuracyMeters: number;
  ImageTimestamp: string;
  DeviceInfo: string;
  LocalId: string;
  Address: string;
  checkInImage?: {
    uri: string;
    name: string;
    type: string;
  };
}

export interface CheckOutPayload {
  CheckOutTime: string;
  CheckOutLatitude: string;
  CheckOutLongitude: string;
  IsWithinGeoFence: boolean;
  DynamicAddress: string;
  LocationSource: string;
  AccuracyMeters: number;
  ImageTimestamp: string;
  DeviceInfo: string;
  Address: string;
  FaceVerified?: boolean;
  Remarks?: string;
  checkOutImage?: {
    uri: string;
    name: string;
    type: string;
  };
}

export interface AttendanceRecord {
  AttendanceId: number;
  CompanyId: number;
  EmployeeId: number;
  CheckInTime: string;
  CheckOutTime: string | null;
  CheckInLatitude: string;
  CheckInLongitude: string;
  CheckOutLatitude: string | null;
  CheckOutLongitude: string | null;
  CheckInSelfieUrl: string;
  CheckOutSelfieUrl: string | null;
  IsWithinGeoFence: number;
  Remarks: string;
  DynamicAddress: string;
  Address: string;
  LocationSource: string;
  AccuracyMeters: string;
  FaceVerified: number;
  ImageTimestamp: string;
  DeviceInfo: string;
  LocalId: string;
  Status: string;
  CreatedAt: string;
  UpdatedAt: string;
  CompanyName: string;
  EmployeeName: string;
  EmployeeCode: string;
  MobileNo: string;
}

export interface AttendanceFilters {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  status?: 'all' | 'pending' | 'approved' | 'rejected';
  page?: number;
  limit?: number;
}

export interface AttendanceMeta {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface AttendanceResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: AttendanceRecord[];
  error: boolean;
  meta: AttendanceMeta;
  timestamp: string;
}

export const getAttendance = async (filters?: AttendanceFilters): Promise<AttendanceResponse> => {
  try {
    const params: Record<string, string> = {};
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.status && filters.status !== 'all') params.status = filters.status;
    if (filters?.page !== undefined) params.page = String(filters.page);
    if (filters?.limit !== undefined) params.limit = String(filters.limit);

    console.log('attendance api called with params:', params);
    

    const response = await api.get(endpoints.attendance.getAll, { params });
    return response?.data;
  } catch (error: any) {
    console.log('❌ GetAttendance Error', error?.response?.data || error.message);
    throw error;
  }
};

export const updateCompanyAttendanceStatus = async (
  attendanceId: number,
  status: 'approved' | 'rejected' | 'pending',
) => {
  try {
    const res = await api.patch(endpoints.companyAttendance.updateStatus(attendanceId), { status });
    return res.data;
  } catch (error: any) {
    console.log('❌ UpdateCompanyAttendanceStatus Error', error?.response?.data || error.message);
    throw error;
  }
};

export const getTodayAttendance = async () => {
  const today = new Date().toISOString().split('T')[0];
  return getAttendance({ startDate: today, endDate: today });
};

export const getCurrentWeekAttendance = async () => {
  const now = new Date();
  const day = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return getAttendance({
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  });
};

export const getCurrentMonthAttendance = async () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return getAttendance({
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  });
};

export const checkIn = async (payload: any) => {
  try {
    const formData = new FormData();

    formData.append("CheckInTime", payload.CheckInTime);
    formData.append("CheckInLatitude", payload.CheckInLatitude.toString());
    formData.append("CheckInLongitude", payload.CheckInLongitude.toString());

    formData.append("CheckInSelfieUrl", {
      uri: payload?.checkInImage?.uri,
      type: payload?.checkInImage?.type,
      name: payload?.checkInImage?.name,
    } as any);

    formData.append("IsWithinGeoFence", String(payload?.IsWithinGeoFence));

    formData.append("Remarks", payload?.Remarks || "");
    formData.append("DynamicAddress", payload?.DynamicAddress || "");
    formData.append("Address", payload?.Address || "");
    formData.append("LocationSource", payload?.LocationSource || "");
    formData.append("AccuracyMeters", String(payload?.AccuracyMeters || 0));

    formData.append("ImageTimestamp", payload?.ImageTimestamp || "");
    formData.append("FaceVerified", String(payload?.FaceVerified || true));

    formData.append("DeviceInfo", payload?.DeviceInfo || "");
    formData.append("LocalId", payload?.LocalId || "");

    const response = await api.post(endpoints.attendance.checkIn, formData);
    console.log("check in res: ", response?.data);

    return response?.data;
  } catch (error: any) {
    console.log("❌ CheckIn Error", error?.response?.data || error.message);
    throw error;
  }
};

export const checkOut = async (
  attendanceId: string | number,
  payload: CheckOutPayload,
) => {
  try {
    const formData = new FormData();

    formData.append("CheckOutTime", payload.CheckOutTime);
    formData.append("CheckOutLatitude", payload.CheckOutLatitude.toString());
    formData.append("CheckOutLongitude", payload.CheckOutLongitude.toString());

    if (payload?.checkOutImage?.uri) {
      formData.append("CheckOutSelfieUrl", {
        uri: payload.checkOutImage.uri,
        type: payload.checkOutImage.type,
        name: payload.checkOutImage.name,
      } as any);
    }

    formData.append("IsWithinGeoFence", String(payload?.IsWithinGeoFence));
    formData.append("DynamicAddress", payload?.DynamicAddress || "");
    formData.append("Address", payload?.Address || "");
    formData.append("LocationSource", payload?.LocationSource || "");
    formData.append("AccuracyMeters", String(payload?.AccuracyMeters || 0));
    formData.append("ImageTimestamp", payload?.ImageTimestamp || "");
    formData.append("FaceVerified", String(payload?.FaceVerified ?? true));
    formData.append("DeviceInfo", payload?.DeviceInfo || "");
    formData.append("Remarks", payload?.Remarks || "");

    const response = await api.put(
      endpoints.attendance.checkOut(attendanceId),
      formData,
    );

    console.log("check out res: ", response?.data);
    return response?.data;
  } catch (error: any) {
    console.log(
      "❌ CheckOut Error",
      error?.response?.status,
      error?.response?.data || error?.message,
    );
    throw error;
  }
};
