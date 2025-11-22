import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-incident-details.ts';
import '@/ai/flows/suggest-incident-categories.ts';
import '@/ai/flows/detect-duplicate-suspicious-reports.ts';