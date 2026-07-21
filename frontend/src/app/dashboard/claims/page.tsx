"use client"

import { useState } from "react";
import { useStore, ClaimStatus } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ShieldAlert, CheckCircle2, XCircle, FileText, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function ClaimsPage() {
  const { claims, items, currentUser, users, addClaim, updateClaimStatus } = useStore();
  const { toast } = useToast();
  const [claimProof, setClaimProof] = useState("");
  const [selectedItemID, setSelectedItemID] = useState<number | null>(null);

  const isAdmin = currentUser?.UserRole === 'Admin';
  
  const displayClaims = isAdmin 
    ? claims 
    : claims.filter(c => c.ClaimantID === currentUser?.UserID);

  // For students to find items they can claim (Found items not theirs)
  const claimableItems = items.filter(i => i.ItemStatus === 'Found' && i.UserID !== currentUser?.UserID);

  const handleFileClaim = () => {
    if (!selectedItemID || !claimProof) return;
    addClaim(selectedItemID, claimProof);
    setClaimProof("");
    setSelectedItemID(null);
    toast({
      title: "Claim Filed",
      description: "Admin will review your proof shortly."
    });
  };

  const handleUpdateStatus = async (claimID: number, status: ClaimStatus) => {
    try {
      await updateClaimStatus(claimID, status);
      toast({
        title: "Claim Updated",
        description: `Claim has been ${status.toLowerCase()}.`
      });
    } catch (e) {
      alert("Failed to update status: " + e);
    }
  };

  return (
    <div className="space-y-8">
      {!isAdmin && (
        <Card className="border-none shadow-md bg-accent text-accent-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" /> Found an item that belongs to you?
            </CardTitle>
            <CardDescription className="text-accent-foreground/80">
              Select an item from the found list and provide proof of ownership.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" className="w-full">Start a New Claim</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>File a Ownership Claim</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label>Select Item</Label>
                    <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
                      {claimableItems.map(item => (
                        <div 
                          key={item.ItemID} 
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedItemID === item.ItemID ? 'bg-primary/10 border-primary' : 'hover:bg-secondary'}`}
                          onClick={() => setSelectedItemID(item.ItemID)}
                        >
                          <div className="font-medium text-sm">{item.Title}</div>
                          <div className="text-xs text-muted-foreground">{item.Description.slice(0, 50)}...</div>
                        </div>
                      ))}
                      {claimableItems.length === 0 && <p className="text-center text-muted-foreground py-4 text-sm">No items available to claim.</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proof">Proof of Ownership</Label>
                    <Textarea 
                      id="proof" 
                      placeholder="e.g., Serial number, description of case, password if electronic, or exact location lost..." 
                      className="min-h-[120px]"
                      value={claimProof}
                      onChange={(e) => setClaimProof(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={!selectedItemID || !claimProof} onClick={handleFileClaim}>
                    Submit Claim for Verification
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-headline font-bold">
          {isAdmin ? "Manage All Claims" : "My Ownership Claims"}
        </h2>

        {displayClaims.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed rounded-3xl opacity-50">
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4" />
            <p>No claims to display.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayClaims.map((claim) => {
              const item = items.find(i => i.ItemID === claim.ItemID);
              const claimant = users.find(u => u.UserID === claim.ClaimantID);
              if (!item) return null;

              return (
                <Card key={claim.ClaimID} className="border-none shadow-md overflow-hidden">
                  <CardHeader className="bg-secondary/30 pb-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{item.Title}</CardTitle>
                        <CardDescription className="flex items-center gap-1.5">
                          <Package className="h-3 w-3" /> Item #{item.ItemID}
                        </CardDescription>
                      </div>
                      <Badge variant={
                        claim.ClaimStatus === 'Approved' ? 'default' : 
                        claim.ClaimStatus === 'Rejected' ? 'destructive' : 'outline'
                      }>
                        {claim.ClaimStatus}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    {isAdmin && (
                      <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                          {claimant?.FullName[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">Claimant</span>
                          <span className="text-sm font-medium">{claim.ClaimantName || claimant?.FullName}</span>
                          <div className="flex flex-col text-xs text-muted-foreground mt-1">
                            <span>Email: {claim.ClaimantEmail || claimant?.Email}</span>
                            <span>Phone: {claim.ClaimantPhone || claimant?.Phone}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground font-bold flex items-center gap-1">
                        <FileText className="h-3 w-3" /> Proof Provided:
                      </span>
                      <p className="text-sm bg-secondary/20 p-3 rounded-lg italic">
                        "{claim.ProofDetails}"
                      </p>
                    </div>
                  </CardContent>
                  {isAdmin && claim.ClaimStatus === 'Pending' && (
                    <CardFooter className="flex gap-3 border-t border-border/50 pt-4">
                      <Button 
                        variant="outline" 
                        className="flex-1 text-destructive hover:bg-destructive/10"
                        onClick={() => handleUpdateStatus(claim.ClaimID, 'Rejectd')}
                      >
                        <XCircle className="h-4 w-4 mr-2" /> Reject
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={() => handleUpdateStatus(claim.ClaimID, 'Approved')}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                      </Button>
                    </CardFooter>
                  )}
                  {claim.ClaimStatus === 'Approved' && (
                    <CardFooter className="bg-green-500/10 text-green-700 p-4 text-xs font-medium flex items-center gap-2">
                      <Info className="h-4 w-4" /> This item has been verified for return.
                    </CardFooter>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
