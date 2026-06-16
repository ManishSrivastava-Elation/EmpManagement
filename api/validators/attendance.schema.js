import { z } from "zod";

const requiredNumber = (
  field,
  min,
  max
) =>
  z.preprocess(
    (value) => {
      if (
        value === "" ||
        value === null ||
        value === undefined
      ) {
        return undefined;
      }

      return value;
    },
    z.coerce.number({
      required_error: `${field} is required`,
      invalid_type_error: `${field} must be a number`,
    })
      .min(min, `${field} must be >= ${min}`)
      .max(max, `${field} must be <= ${max}`)
  );

const isoDate = (field) =>
  z.string().datetime({
    message: `${field} must be valid ISO datetime`,
  });

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

  CheckInSelfieUrl: z
    .string()
    .trim()
    .url()
    .optional(),

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

  CheckOutSelfieUrl: z
    .string()
    .trim()
    .url()
    .optional(),

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