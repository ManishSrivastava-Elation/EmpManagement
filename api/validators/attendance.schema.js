import { z } from "zod";
import { dateTime, requiredNumber } from "./common.schema.js";

const isoDate = dateTime; // preserve existing helper name for readability

export const createAttendanceSchema = z.object({
  CheckInTime: isoDate("CheckInTime"),

  CheckInLatitude: requiredNumber(
    "CheckInLatitude",
    -90,
    90
  ),

  CheckInLongitude: requiredNumber(
    "CheckInLongitude",
    -180,
    180
  ),

  IsWithinGeoFence: z.coerce.boolean(),

  Remarks: z
    .string()
    .trim()
    .max(500)
    .optional(),

  DynamicAddress: z
    .string()
    .trim()
    .min(5)
    .max(300),

  LocationSource: z.enum([
    "GPS",
    "NETWORK",
    "MANUAL",
  ]),

  AccuracyMeters: requiredNumber(
    "AccuracyMeters",
    0,
    1000
  ),

  FaceVerified: z.coerce.boolean(),

  ImageTimestamp: isoDate("ImageTimestamp"),

  DeviceInfo: z
    .string()
    .trim()
    .max(300)
    .optional(),

  LocalId: z
    .string()
    .trim()
    .min(3)
    .max(100)
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "LocalId contains invalid characters"
    ),

  Address: z
    .string()
    .trim()
    .max(500)
    .optional(),
});

export const updateAttendanceSchema = z.object({
  CheckOutTime: isoDate("CheckOutTime"),

  CheckOutLatitude: requiredNumber(
    "CheckOutLatitude",
    -90,
    90
  ),

  CheckOutLongitude: requiredNumber(
    "CheckOutLongitude",
    -180,
    180
  ),

  Remarks: z
    .string()
    .trim()
    .max(500)
    .optional(),

  DynamicAddress: z
    .string()
    .trim()
    .min(5)
    .max(300),

  LocationSource: z.enum([
    "GPS",
    "NETWORK",
    "MANUAL",
  ]),

  AccuracyMeters: requiredNumber(
    "AccuracyMeters",
    0,
    1000
  ),

  FaceVerified: z.coerce.boolean().optional().default(true),

  ImageTimestamp: isoDate("ImageTimestamp"),

  DeviceInfo: z
    .string()
    .trim()
    .max(300)
    .optional(),

  Address: z
    .string()
    .trim()
    .max(500)
    .optional(),
});

export const adminAddAttendanceSchema =
  z.object({
    EmployeeId: z
      .coerce
      .number()
      .int()
      .positive(),

    CheckInTime: isoDate(
      "CheckInTime"
    ),

    Remarks: z
      .string()
      .trim()
      .max(500)
      .optional(),

    Address: z
      .string()
      .trim()
      .min(3)
      .max(255),

    CheckOutTime: isoDate(
      "CheckOutTime"
    ).optional(),
  });