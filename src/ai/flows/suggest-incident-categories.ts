'use server';

/**
 * @fileOverview AI flow to suggest incident categories based on the report description and data.
 *
 * - suggestIncidentCategories - Function to suggest incident categories.
 * - SuggestIncidentCategoriesInput - Input type for suggestIncidentCategories function.
 * - SuggestIncidentCategoriesOutput - Output type for suggestIncidentCategories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestIncidentCategoriesInputSchema = z.object({
  reportDescription: z
    .string()
    .describe('Description of the incident report.'),
  reportData: z.record(z.any()).optional().describe('Optional report data.'),
});
export type SuggestIncidentCategoriesInput = z.infer<
  typeof SuggestIncidentCategoriesInputSchema
>;

const SuggestIncidentCategoriesOutputSchema = z.object({
  suggestedCategories: z
    .array(z.string())
    .describe('Suggested incident categories.'),
  reasoning: z.string().describe('Reasoning for the category suggestions.'),
});
export type SuggestIncidentCategoriesOutput = z.infer<
  typeof SuggestIncidentCategoriesOutputSchema
>;

export async function suggestIncidentCategories(
  input: SuggestIncidentCategoriesInput
): Promise<SuggestIncidentCategoriesOutput> {
  return suggestIncidentCategoriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestIncidentCategoriesPrompt',
  input: {schema: SuggestIncidentCategoriesInputSchema},
  output: {schema: SuggestIncidentCategoriesOutputSchema},
  prompt: `Based on the incident report description and data, suggest relevant incident categories.

Report Description: {{{reportDescription}}}
Report Data: {{{reportData}}}

Provide the suggested categories and reasoning for each suggestion.

{{ zodFormat="SuggestIncidentCategoriesOutputSchema" }}`,
});

const suggestIncidentCategoriesFlow = ai.defineFlow(
  {
    name: 'suggestIncidentCategoriesFlow',
    inputSchema: SuggestIncidentCategoriesInputSchema,
    outputSchema: SuggestIncidentCategoriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
