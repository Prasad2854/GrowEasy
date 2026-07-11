import { generateMapping } from './apps/api/src/services/ai.service';
import { env } from './apps/api/src/config/env';

async function test() {
  try {
    const headers = ["ID", "Age", "Income"];
    const rows = [{"ID":"1","Age":"30","Income":"50000"}];
    const mappings = await generateMapping(headers, rows);
    console.log("SUCCESS:", JSON.stringify(mappings));
  } catch (err) {
    console.error("FAILED:", err);
  }
}
test();
