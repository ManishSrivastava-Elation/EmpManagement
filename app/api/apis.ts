// export const baseUrl = 'http://192.168.1.53:8001/api';
// export const baseImageUrl = 'http://192.168.1.53:8001';

export const baseUrl = "https://app.elationsoft.net/api";
export const baseImageUrl = "https://app.elationsoft.net";

export const endpoints = {
  employee: {
    employeeLogin: `/auth/login`,
    registerEmployee: `/auth/create`,
    profile: `/employee/profile`,
    updateProfile: `/employee/profile`,
    updatePassword: `/employee/password`,
  },
  company: {
    companyLogin: `/companies/login`,
    options: `/companies/options`,
    companyRegister: `/companies`,
    profile: `/companies/profile`,
    updateProfile: (id: string | number) => `/companies/${id}`,
    updatePassword: `/companies/password`,
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
    verify: `/companies/verify-employee`,
  },
  expense: {
    getAll: `/expense`,
    create: `/expense`,
    types: `/expense/types`,
    updateStatus: (id: number) => `/expense/${id}`,
  },
  companyDashboard: {
    stats: `/admin/dashboard/stats`,
    expenseByType: `/admin/dashboard/expense-by-type`,
  },
  files: {
    companyAttendance: `/files/company/attendance`,
    companyExpenses: `/files/company/expenses`,
  },
  subscription: {
    getMaster: `/master-subscription`,
    purchase: `/subscription/purchase`,
    getCurrent: `/subscription/current`,
  },
  otp: {
    send: `/otp/send`,
    resend: `/otp/resend`,
    verify: `/otp/verify`,
    markMobileVerified: `/otp/mark-mobile-verified`,
  },
  customer: {
    getAll: `/customer`,
    create: `/customer/create`,
    options: `/companies/customers/options`,
  },
  job: {
    create: `/job/create`,
    list: `/job/list`,
    details: (id: number) => `/job/details/${id}`,
    assign: `/job/assign`,
  },
  employeeOptions: `/employee/options`,
}
