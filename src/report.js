import fs from 'fs/promises';
import path from 'path';
import { OUTPUT_DIR } from './config.js';

export async function writeReport(report) {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(
    path.join(OUTPUT_DIR, 'run-report.json'),
    JSON.stringify(report, null, 2)
  );
}
