import Groq from 'groq-sdk';
import { env } from '../config/env';
import { MappingResponseSchema, ColumnMapping } from '@groweasy/shared-types';
import { logger } from '../utils/logger';

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

const extractJson = (text: string): string => {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.substring(firstBrace, lastBrace + 1);
  }
  return text; // Fallback to raw text if no braces found
};

export const generateMapping = async (headers: string[], sampleRows: any[], retries = 2): Promise<ColumnMapping[]> => {
  const prompt = `
    You are an intelligent data mapping assistant.
    Your task is to map the uploaded CSV headers to our fixed CRM schema.
    
    CRM Fields available:
    - created_at: Date and time the lead was created
    - name: Full name of the lead
    - email: Email address
    - country_code: Phone country code (e.g., +1, +44)
    - mobile_without_country_code: Mobile phone number without country code
    - company: Company name
    - city: City name
    - state: State or province
    - country: Country name
    - lead_owner: Owner or assignee of the lead
    - crm_status: Current status in the CRM
    - crm_note: Notes or comments about the lead
    - data_source: Source of the lead data
    - possession_time: Time in possession
    - description: General description or bio

    CSV Headers uploaded:
    ${JSON.stringify(headers, null, 2)}
    
    Sample Data (first 3 rows):
    ${JSON.stringify(sampleRows.slice(0, 3), null, 2)}
    
    Output a JSON object with a single "mappings" array.
    Each item in the array should have:
    - "csvColumn": The original string from the CSV headers.
    - "crmField": The closest matching CRM field from the list above, or null if there is no logical match.
    
    Respond ONLY with valid JSON. Do not include markdown formatting or explanations.
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
    });
    const text = chatCompletion.choices[0]?.message?.content || "";
    
    // Clean up potential markdown formatting in response and extract JSON object
    const jsonString = extractJson(text.replace(/```json/gi, '').replace(/```/g, '').trim());
    
    const parsedData = JSON.parse(jsonString);
    const validated = MappingResponseSchema.parse(parsedData);
    
    return validated.mappings;
  } catch (error: any) {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      promptSample: prompt.substring(0, 500) + '...',
    };
    logger.warn({ err: error, details: errorDetails }, `Failed to generate AI mapping. Retries left: ${retries}`);
    
    if (retries > 0) {
      return generateMapping(headers, sampleRows, retries - 1);
    }
    
    logger.error({ err: error, details: errorDetails }, 'Failed to generate AI mapping after all retries');
    throw error; // Throw the actual error so the controller can return structured details
  }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const processBatch = async (rows: any[], mappings: ColumnMapping[], retries = 3): Promise<{ imported: number, skipped: number, records: any[] }> => {
  try {
    const prompt = `
    You are a data transformation engine.
    Transform the provided JSON array of records into the strict CRM schema based on the provided mappings.
    
    CRM Schema:
    - created_at
    - name
    - email
    - country_code
    - mobile_without_country_code
    - company
    - city
    - state
    - country
    - lead_owner
    - crm_status
    - crm_note
    - data_source
    - possession_time
    - description

    AI Rules (CRITICAL):
    1. Never invent missing values. If a field is empty, leave it null/undefined or empty string.
    2. Skip records that contain neither an email nor a mobile number. Do not return them in the output array.
    3. If multiple emails exist in a record, use the first one for "email" and append the rest to "crm_note".
    4. If multiple phone numbers exist, use the first one for the mobile field and append the rest to "crm_note".
    5. Normalize "crm_status" strictly into one of: "GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE".
    6. Normalize "data_source" strictly into one of: "leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots".

    Mappings applied:
    ${JSON.stringify(mappings, null, 2)}
    
    Raw Records:
    ${JSON.stringify(rows, null, 2)}
    
    Output a JSON object with a single "records" array containing the transformed records.
    Respond ONLY with valid JSON.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
    });
    const text = chatCompletion.choices[0]?.message?.content || "";
    
    const jsonString = extractJson(text.replace(/```json/gi, '').replace(/```/g, '').trim());
    
    const parsedData = JSON.parse(jsonString);
    const records = parsedData.records || [];
    
    return {
      imported: records.length,
      skipped: rows.length - records.length,
      records
    };
  } catch (error: any) {
    if (retries > 0) {
      logger.warn(`AI batch process failed. Retrying... (${retries} retries left)`);
      await delay((4 - retries) * 1000); // Exponential-ish backoff: 1s, 2s, 3s
      return processBatch(rows, mappings, retries - 1);
    }
    logger.error({ err: error }, 'Failed to process batch after retries');
    throw new Error('Batch processing failed');
  }
};
