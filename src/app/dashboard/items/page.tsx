"use client"

import { useState } from "react";
import { useStore, ItemStatus } from "@/lib/db";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Search, MapPin, Calendar, User, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function ItemsPage() {
  const { items, currentUser, categories, locations, users } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ItemStatus | "All">("All");

  const displayItems = items.filter(i => {
    const matchesSearch = i.Title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          i.Description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || i.ItemStatus === statusFilter;
    const isVisible = currentUser?.UserRole === 'Admin' || i.UserID === currentUser?.UserID || i.ItemStatus === 'Found' || i.ItemStatus === 'Lost';
    
    return matchesSearch && matchesStatus && isVisible;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search items..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as any)}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Lost">Lost</SelectItem>
              <SelectItem value="Found">Found</SelectItem>
              <SelectItem value="Handed over">Handed Over</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {displayItems.length === 0 ? (
        <div className="py-24 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-medium">No items found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayItems.map((item) => (
            <Card key={item.ItemID} className="border-none shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-40 bg-secondary/30 flex items-center justify-center">
                <Package className="h-12 w-12 text-muted-foreground opacity-50" />
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-lg leading-tight">{item.Title}</h4>
                    <p className="text-xs text-primary font-medium">
                      {categories.find(c => c.CategoryID === item.CategoryID)?.CategoryName}
                    </p>
                  </div>
                  <Badge variant={item.ItemStatus === 'Lost' ? 'destructive' : item.ItemStatus === 'Found' ? 'default' : 'secondary'}>
                    {item.ItemStatus}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                  {item.Description}
                </p>

                <div className="pt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {locations.find(l => l.LocationID === item.LocationID)?.LocationName}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(item.DateReported).toLocaleDateString()}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center">
                      <User className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-medium">
                      {users.find(u => u.UserID === item.UserID)?.FullName || "Unknown"}
                    </span>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 gap-1.5">
                        <Eye className="h-3.5 w-3.5" /> View
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{item.Title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
                          <Package className="h-12 w-12 opacity-20" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Status</span>
                            <div className="font-medium">{item.ItemStatus}</div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Category</span>
                            <div className="font-medium">
                              {categories.find(c => c.CategoryID === item.CategoryID)?.CategoryName}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Location</span>
                            <div className="font-medium">
                              {locations.find(l => l.LocationID === item.LocationID)?.LocationName}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Reported On</span>
                            <div className="font-medium">{new Date(item.DateReported).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Description</span>
                          <p className="text-sm bg-secondary/30 p-3 rounded-lg leading-relaxed">
                            {item.Description}
                          </p>
                        </div>
                        {currentUser?.UserID !== item.UserID && item.ItemStatus === 'Found' && (
                          <Button className="w-full mt-4" asChild>
                            <Link href="/dashboard/claims">File a Claim</Link>
                          </Button>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
