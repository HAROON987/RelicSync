"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore, ItemStatus } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function ReportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { categories, locations, reportItem } = useStore();
  
  const [formData, setFormData] = useState({
    Title: "",
    Description: "",
    ItemStatus: "Lost" as ItemStatus,
    CategoryID: "",
    LocationID: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.CategoryID || !formData.LocationID) {
      toast({
        title: "Missing Fields",
        description: "Please select a category and location.",
        variant: "destructive"
      });
      return;
    }

    reportItem({
      Title: formData.Title,
      Description: formData.Description,
      ItemStatus: formData.ItemStatus,
      CategoryID: parseInt(formData.CategoryID),
      LocationID: parseInt(formData.LocationID)
    });

    toast({
      title: "Success",
      description: `Item reported as ${formData.ItemStatus}.`
    });

    router.push('/dashboard/items');
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="border-none shadow-xl">
        <CardHeader>
          <CardTitle>Report Item</CardTitle>
          <CardDescription>Fill in the details about the lost or found item.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select 
                value={formData.ItemStatus} 
                onValueChange={(val) => setFormData({...formData, ItemStatus: val as ItemStatus})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lost">Lost Item</SelectItem>
                  <SelectItem value="Found">Found Item</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Item Title</Label>
              <Input 
                id="title" 
                placeholder="e.g., iPhone 13, House Keys, Brown Wallet" 
                required 
                value={formData.Title}
                onChange={(e) => setFormData({...formData, Title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={formData.CategoryID} 
                  onValueChange={(val) => setFormData({...formData, CategoryID: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.CategoryID} value={cat.CategoryID.toString()}>
                        {cat.CategoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Last Seen / Found Location</Label>
                <Select 
                  value={formData.LocationID} 
                  onValueChange={(val) => setFormData({...formData, LocationID: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(loc => (
                      <SelectItem key={loc.LocationID} value={loc.LocationID.toString()}>
                        {loc.LocationName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe specific features, brand, color, or any distinguishing marks..." 
                className="min-h-32"
                required
                value={formData.Description}
                onChange={(e) => setFormData({...formData, Description: e.target.value})}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit">Submit Report</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
