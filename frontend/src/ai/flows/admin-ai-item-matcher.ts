'use server';
/**
 * @fileOverview This file defines a Genkit flow for an Admin to automatically analyze
 * textual descriptions of lost and found items, suggest potential matches, and
 * provide a similarity score.
 *
 * - matchItems - A function that handles the item matching process.
 * - MatchItemsInput - The input type for the matchItems function.
 * - MatchItemsOutput - The return type for the matchItems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MatchItemsInputSchema = z.object({
  lostItemDescription: z
    .string()
    .describe('The detailed description of the lost item.'),
  foundItemDescription: z
    .string()
    .describe('The detailed description of the found item.'),
});
export type MatchItemsInput = z.infer<typeof MatchItemsInputSchema>;

const MatchItemsOutputSchema = z.object({
  isPotentialMatch: z
    .boolean()
    .describe(
      'True if the lost and found item descriptions indicate a potential match, false otherwise.'
    ),
  similarityScore: z
    .number()
    .min(0)
    .max(1)
    .describe(
      'A numerical score between 0 and 1 representing the similarity of the items, where 1 is a perfect match.'
    ),
  reasoning: z
    .string()
    .describe(
      'A brief explanation for the match determination and similarity score.'
    ),
});
export type MatchItemsOutput = z.infer<typeof MatchItemsOutputSchema>;

const matchItemsPrompt = ai.definePrompt({
  name: 'matchItemsPrompt',
  input: {schema: MatchItemsInputSchema},
  output: {schema: MatchItemsOutputSchema},
  prompt: `You are an expert system designed to compare descriptions of lost and found items.
Your task is to analyze the provided descriptions, determine if they represent the same or a highly similar item, and provide a similarity score between 0 (no similarity) and 1 (perfect match).
Also, provide a brief reasoning for your decision.

Lost Item Description: """{{{lostItemDescription}}}"""
Found Item Description: """{{{foundItemDescription}}}"""

Consider attributes like color, brand, specific features, material, and any unique identifiers mentioned in the descriptions.`,
});

const matchItemsFlow = ai.defineFlow(
  {
    name: 'matchItemsFlow',
    inputSchema: MatchItemsInputSchema,
    outputSchema: MatchItemsOutputSchema,
  },
  async input => {
    const {output} = await matchItemsPrompt(input);
    return output!;
  }
);

export async function matchItems(
  input: MatchItemsInput
): Promise<MatchItemsOutput> {
  return matchItemsFlow(input);
}
