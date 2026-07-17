import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { getToken } from '@/services/storage.service';
import { baseUrl, endpoints } from '@/api/apis';

export interface ReportParams {
  employeeId?: number | string;
  startDate?: string;
  endDate?: string;
}

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const shareExcelFile = async (
  endpoint: string,
  fileName: string,
  params?: ReportParams,
): Promise<void> => {
  const token = await getToken();

  const qs = params
    ? Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
        .join('&')
    : '';

  const url = `${baseUrl}${endpoint}${qs ? '?' + qs : ''}`;

  // ── 1. Fetch as binary ────────────────────────────────────────────────────
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: XLSX_MIME,
    },
  });

  // ── 2. Validate HTTP status ───────────────────────────────────────────────
  if (!response.ok) {
    let msg = `Server error ${response.status}`;
    try {
      const json = await response.json();
      msg = json?.message || msg;
    } catch {}
    throw new Error(msg);
  }

  // ── 3. Validate Content-Type — reject JSON/HTML error pages ──────────────
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('spreadsheetml') && !contentType.includes('octet-stream')) {
    // Server returned non-binary — likely a JSON error body
    let body = '';
    try { body = await response.text(); } catch {}
    throw new Error(`Invalid response type: ${contentType}. Body: ${body.slice(0, 200)}`);
  }

  // ── 4. Read as ArrayBuffer → base64 ──────────────────────────────────────
  const buffer = await response.arrayBuffer();
  const bytes  = new Uint8Array(buffer);

  // Convert to base64 in chunks to avoid call stack overflow on large files
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  const base64 = btoa(binary);

  // ── 5. Validate file is not empty ────────────────────────────────────────
  if (!base64 || base64.length < 100) {
    throw new Error('Downloaded file is empty or too small — report may have no data');
  }

  // ── 6. Write to local file as base64 ─────────────────────────────────────
  const fileUri = `${FileSystem.cacheDirectory}${fileName}-${Date.now()}.xlsx`;
  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // ── 7. Share ──────────────────────────────────────────────────────────────
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) throw new Error('Sharing is not available on this device');

  await Sharing.shareAsync(fileUri, {
    mimeType: XLSX_MIME,
    dialogTitle: 'Share Report',
    UTI: 'com.microsoft.excel.xlsx',
  });
};

export const shareAttendanceReport = (params?: ReportParams) =>
  shareExcelFile(endpoints.files.companyAttendance, 'attendance-report', params);

export const shareExpenseReport = (params?: ReportParams) =>
  shareExcelFile(endpoints.files.companyExpenses, 'expense-report', params);
