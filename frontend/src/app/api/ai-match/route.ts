import { NextResponse } from 'next/server';
import { matchItems } from '@/ai/flows/admin-ai-item-matcher';

function computeFallbackMatch(desc1: string, desc2: string) {
  const clean1 = desc1.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const clean2 = desc2.toLowerCase().replace(/[^a-z0-9\s]/g, '');

  const words1 = new Set(clean1.split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(clean2.split(/\s+/).filter(w => w.length > 2));

  if (words1.size === 0 || words2.size === 0) {
    return { isPotentialMatch: false, similarityScore: 0, reasoning: 'Insufficient item description text to calculate match.' };
  }

  let overlap = 0;
  words1.forEach(w => { if (words2.has(w)) overlap++; });
  const totalUnique = new Set([...words1, ...words2]).size;

  const score = totalUnique > 0 ? overlap / totalUnique : 0;
  const isMatch = overlap >= 2 || score >= 0.3;
  const finalScore = isMatch ? Math.min(0.95, Math.max(0.70, score + 0.5)) : Math.round(score * 100) / 100;

  return {
    isPotentialMatch: isMatch,
    similarityScore: finalScore,
    reasoning: isMatch 
      ? `High attribute overlap detected (${overlap} matching keywords: ${[...words1].filter(w => words2.has(w)).join(', ')}).`
      : `Low similarity score (${Math.round(score * 100)}%). Descriptions do not share significant matching keywords.`
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.lostItemDescription || !body.foundItemDescription) {
      return NextResponse.json({ error: 'Missing descriptions' }, { status: 400 });
    }

    try {
      // Primary: Real Google Gemini AI Matcher
      const result = await matchItems({
        lostItemDescription: body.lostItemDescription,
        foundItemDescription: body.foundItemDescription,
      });

      if (result) {
        return NextResponse.json(result);
      }
    } catch (aiError: any) {
      console.warn("Gemini AI API unavailable/quota limit reached. Using fallback matcher:", aiError.message);
    }

    // Fallback: Smart keyword match if Gemini API quota is reached
    const fallbackResult = computeFallbackMatch(body.lostItemDescription, body.foundItemDescription);
    return NextResponse.json(fallbackResult);

  } catch (error: any) {
    console.error("AI Match Route Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
