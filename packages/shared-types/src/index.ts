import { z } from "zod";

// The required CRM fields from the requirements
export const CrmFieldSchema = z.object({
  created_at: z.string().optional().describe("Date and time the lead was created"),
  name: z.string().optional().describe("Full name of the lead"),
  email: z.string().email().optional().describe("Email address"),
  country_code: z.string().optional().describe("Phone country code (e.g., +1, +44)"),
  mobile_without_country_code: z.string().optional().describe("Mobile phone number without country code"),
  company: z.string().optional().describe("Company name"),
  city: z.string().optional().describe("City name"),
  state: z.string().optional().describe("State or province"),
  country: z.string().optional().describe("Country name"),
  lead_owner: z.string().optional().describe("Owner or assignee of the lead"),
  crm_status: z.string().optional().describe("Current status in the CRM"),
  crm_note: z.string().optional().describe("Notes or comments about the lead"),
  data_source: z.string().optional().describe("Source of the lead data"),
  possession_time: z.string().optional().describe("Time in possession"),
  description: z.string().optional().describe("General description or bio"),
});

export type CrmField = z.infer<typeof CrmFieldSchema>;

// Defines how a CSV column maps to a CRM field
export const ColumnMappingSchema = z.object({
  csvColumn: z.string(),
  crmField: z.string().nullable(), // null if not mapped to anything
});

export type ColumnMapping = z.infer<typeof ColumnMappingSchema>;

export const MappingResponseSchema = z.object({
  mappings: z.array(ColumnMappingSchema),
});

export type MappingResponse = z.infer<typeof MappingResponseSchema>;

// Batch Processing Job Types
export const JobStatusSchema = z.enum(["pending", "processing", "completed", "failed"]);

export type JobStatus = z.infer<typeof JobStatusSchema>;

export const ImportJobSchema = z.object({
  id: z.string(),
  filename: z.string(),
  filePath: z.string().optional(), // Need to store path for full parsing later
  totalRows: z.number(),
  processedRows: z.number(),
  importedCount: z.number().default(0),
  skippedCount: z.number().default(0),
  failedCount: z.number().default(0),
  status: JobStatusSchema,
  mappings: z.array(ColumnMappingSchema).optional(),
  error: z.string().optional(),
  records: z.array(CrmFieldSchema).optional(),
});

export type ImportJob = z.infer<typeof ImportJobSchema>;

export const ImportResultSchema = z.object({
  success: z.boolean(),
  imported: z.number(),
  skipped: z.number(),
  failed: z.number(),
  records: z.array(CrmFieldSchema),
});

export type ImportResult = z.infer<typeof ImportResultSchema>;
