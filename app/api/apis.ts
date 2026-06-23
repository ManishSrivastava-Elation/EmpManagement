export const baseUrl = 'http://192.168.1.53:8001/api';
export const baseImageUrl = 'http://192.168.1.53:8001';

// export const baseUrl = "https://app.elationsoft.net/api";
// export const baseImageUrl = "https://app.elationsoft.net";

export const endpoints = {
  employee: {
    employeeLogin: `/auth/login`,
    registerEmployee: `/auth/create`,
  },
  company: {
    companyLogin: `/companies/login`,
    options: `/companies/options`,
    companyRegister: `/companies`,
  },
  attendance: {
    checkIn: `/attendance/checkin`,
    checkOut: (attendanceId: string | number) =>
      `/attendance/checkout/${attendanceId}`,
    getAll: `/attendance`,
  },
  companyAttendance: {
    getAll: `/admin/attendance`,
    updateStatus: (id: number) => `/attendance/${id}/status`,
  },
  employees: {
    getAll: `/employee`,
    updateStatus: (id: number) => `/employee/${id}/status`,
  },
  expense: {
    getAll: `/expense`,
    create: `/expense`,
    types: `/expense/types`,
  },
};
