'use server';

/**
 * @fileOverview Summarizes incident details into a concise brief for responders.
 *
 * - summarizeIncidentDetails - A function that summarizes incident details.
 * - SummarizeIncidentDetailsInput - The input type for the summarizeIncidentDetails function.
 * - SummarizeIncidentDetailsOutput - The return type for the summarizeIncidentDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeIncidentDetailsInputSchema = z.object({
  incidentDetails: z.string().describe('Detailed description of the incident.'),
});

export type SummarizeIncidentDetailsInput = z.infer<
  typeof SummarizeIncidentDetailsInputSchema
>;

const SummarizeIncidentDetailsOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the incident details.'),
});

export type SummarizeIncidentDetailsOutput = z.infer<
  typeof SummarizeIncidentDetailsOutputSchema
>;

export async function summarizeIncidentDetails(
  input: SummarizeIncidentDetailsInput
): Promise<SummarizeIncidentDetailsOutput> {
  return summarizeIncidentDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeIncidentDetailsPrompt',
  input: {schema: SummarizeIncidentDetailsInputSchema},
  output: {schema: SummarizeIncidentDetailsOutputSchema},
  prompt: `You are an AI assistant helping responders quickly understand incident details.

  Summarize the following incident details into a concise brief:

  Incident Details: {{{incidentDetails}}}
  `,
});

const summarizeIncidentDetailsFlow = ai.defineFlow(
  {
    name: 'summarizeIncidentDetailsFlow',
    inputSchema: SummarizeIncidentDetailsInputSchema,
    outputSchema: SummarizeIncidentDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
