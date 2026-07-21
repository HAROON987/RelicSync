"use client"

import { useState, useEffect } from "react";
import { useStore, Match } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ArrowRight, BrainCircuit, Loader2, CheckCircle2 } from "lucide-react";
import { matchItems } from "@/ai/flows/admin-ai-item-matcher";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export default function MatchesPage() {
  const { items, matches, addMatch, updateMatchStatus, currentUser } = useStore();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [activeMatches, setActiveMatches] = useState<Match[]>([]);

  useEffect(() => {
    setActiveMatches(matches);
  }, [matches]);

  if (currentUser?.UserRole !== 'Admin') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p>Only administrators can access the AI Match Hub.</p>
      </div>
    );
  }

  const handleAccept = async (matchId: number) => {
    const success = await updateMatchStatus(matchId, 'Accepted');
    if (success) {
      toast({ title: "Match Accepted", description: "Items have been marked as handed over and users notified." });
    } else {
      toast({ title: "Error", description: "Failed to accept match.", variant: "destructive" });
    }
  };

  const handleDismiss = async (matchId: number) => {
    const success = await updateMatchStatus(matchId, 'Dismissed');
    if (success) {
      toast({ title: "Match Dismissed", description: "Match has been removed." });
    } else {
      toast({ title: "Error", description: "Failed to dismiss match.", variant: "destructive" });
    }
  };

  const runAIScan = async () => {
    setIsScanning(true);
    const lostItems = items.filter(i => i.ItemStatus === 'Lost');
    const foundItems = items.filter(i => i.ItemStatus === 'Found');

    let matchCount = 0;
    for (const lost of lostItems) {
      for (const found of foundItems) {
        if (lost.CategoryID !== found.CategoryID) continue;
        
        if (matches.some(m => m.LostItem === lost.ItemID && m.FoundItem === found.ItemID)) continue;

        try {
          const res = await fetch('/api/ai-match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lostItemDescription: `${lost.Title}: ${lost.Description}`,
              foundItemDescription: `${found.Title}: ${found.Description}`
            })
          });

          if (!res.ok) {
            console.error("AI Match API failed with status:", res.status);
            continue;
          }

          const result = await res.json();

          if (result && (result.isPotentialMatch || result.similarityScore >= 0.5)) {
            await addMatch(lost.ItemID, found.ItemID, result.similarityScore || 0.8);
            matchCount++;
          }
        } catch (error) {
          console.error("AI Scan error:", error);
        }
      }
    }

    setIsScanning(false);
    toast({
      title: "AI Scan Complete",
      description: `Found ${matchCount} potential matches.`
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-primary/5 p-8 rounded-3xl border border-primary/20">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <BrainCircuit className="h-6 w-6" />
            <h1 className="text-2xl font-headline font-bold">RelicSync AI Scorer</h1>
          </div>
          <p className="text-muted-foreground max-w-lg">
            Our neural item matching system analyzes textual reports to find potential reunions using semantic reasoning.
          </p>
        </div>
        <Button 
          size="lg" 
          onClick={runAIScan} 
          disabled={isScanning}
          className="shadow-lg shadow-primary/20 min-w-[200px]"
        >
          {isScanning ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing Items...</>
          ) : (
            <><BrainCircuit className="mr-2 h-5 w-5" /> Trigger AI Scan</>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <h2 className="text-xl font-headline font-bold flex items-center gap-2">
          Potential Matches
          <Badge variant="outline" className="ml-2 font-mono">
            {activeMatches.length}
          </Badge>
        </h2>

        {activeMatches.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed rounded-3xl opacity-50">
            <Package className="h-16 w-16 mx-auto mb-4" />
            <p>No matches detected yet. Run a scan to find similarities.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeMatches.map((match) => {
              const lost = items.find(i => i.ItemID === match.LostItem);
              const found = items.find(i => i.ItemID === match.FoundItem);
              if (!lost || !found) return null;

              return (
                <Card key={match.MatchID} className="border-none shadow-md overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="flex-1 space-y-4 w-full">
                        <div className="flex items-center justify-between">
                          <Badge variant="destructive">LOST</Badge>
                          <span className="text-xs text-muted-foreground">ID: #{lost.ItemID}</span>
                        </div>
                        <h4 className="font-bold">{lost.Title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{lost.Description}</p>
                      </div>

                      <div className="flex flex-col items-center gap-2 min-w-[140px]">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Similarity</div>
                        <div className="text-3xl font-black text-primary">
                          {Math.round((match.Score || 0) * 100)}%
                        </div>
                        <Progress value={(match.Score || 0) * 100} className="w-full h-2" />
                        <ArrowRight className="h-6 w-6 text-muted-foreground mt-2 hidden md:block" />
                      </div>

                      <div className="flex-1 space-y-4 w-full">
                        <div className="flex items-center justify-between">
                          <Badge variant="default">FOUND</Badge>
                          <span className="text-xs text-muted-foreground">ID: #{found.ItemID}</span>
                        </div>
                        <h4 className="font-bold">{found.Title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{found.Description}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-secondary/30 px-6 py-3 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      Detected on {new Date(match.MatchDate).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleDismiss(match.MatchID)}>Dismiss</Button>
                      <Button size="sm" className="gap-1.5" onClick={() => handleAccept(match.MatchID)}>
                        <CheckCircle2 className="h-4 w-4" /> Accept
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
