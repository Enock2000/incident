'use server';
/**
 * @fileOverview AI flow to detect duplicate or suspicious incident reports.
 *
 * - detectDuplicateOrSuspiciousReports - Function to analyze reports and flag duplicates/suspicious entries.
 * - DetectDuplicateOrSuspiciousReportsInput - Input type for the function.
 * - DetectDuplicateOrSuspiciousReportsOutput - Output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectDuplicateOrSuspiciousReportsInputSchema = z.object({
  reportContent: z.string().describe('Content of the incident report, including description.'),
  location: z.string().describe('Geographic location of the incident.'),
  metadata: z.record(z.any()).describe('Additional metadata such as timestamps, user ID (if available), etc.'),
});
export type DetectDuplicateOrSuspiciousReportsInput = z.infer<typeof DetectDuplicateOrSuspiciousReportsInputSchema>;

const DetectDuplicateOrSuspiciousReportsOutputSchema = z.object({
  isDuplicate: z.boolean().describe('Whether the report is likely a duplicate of an existing report.'),
  isSuspicious: z.boolean().describe('Whether the report is potentially suspicious (e.g., false or misleading).'),
  duplicateReportId: z.string().optional().describe('ID of the potential duplicate report, if applicable.'),
  reason: z.string().describe('Reasoning behind the duplicate or suspicious flags.'),
});
export type DetectDuplicateOrSuspiciousReportsOutput = z.infer<typeof DetectDuplicateOrSuspiciousReportsOutputSchema>;

export async function detectDuplicateOrSuspiciousReports(input: DetectDuplicateOrSuspiciousReportsInput): Promise<DetectDuplicateOrSuspiciousReportsOutput> {
  return detectDuplicateOrSuspiciousReportsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectDuplicateOrSuspiciousReportsPrompt',
  input: {schema: DetectDuplicateOrSuspiciousReportsInputSchema},
  output: {schema: DetectDuplicateOrSuspiciousReportsOutputSchema},
  prompt: `You are an AI assistant designed to detect duplicate or suspicious incident reports.

  Analyze the following report data to determine if it is a duplicate or suspicious. Consider factors such as content similarity, location proximity to other incidents, and unusual metadata patterns.

  Report Content: {{{reportContent}}}
  Location: {{{location}}}
  Metadata: {{{metadata}}}

  Respond with JSON. Use the following schema:
  {
    "isDuplicate": boolean,
    "isSuspicious": boolean,
    "duplicateReportId": string (Optional, ID of the duplicate report if applicable),
    "reason": string (Reasoning behind the duplicate or suspicious flags)
  }`,
});

const detectDuplicateOrSuspiciousReportsFlow = ai.defineFlow(
  {
    name: 'detectDuplicateOrSuspiciousReportsFlow',
    inputSchema: DetectDuplicateOrSuspiciousReportsInputSchema,
    outputSchema: DetectDuplicateOrSuspiciousReportsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
