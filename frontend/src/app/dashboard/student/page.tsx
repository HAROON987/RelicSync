"use client"

import { useStore } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, MapPin, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StudentDashboard() {
  const { items, currentUser, categories, locations } = useStore();
  
  const myItems = items.filter(i => i.UserID === currentUser?.UserID);
  const recentItems = myItems.slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Welcome, {currentUser?.FullName}</h1>
          <p className="text-muted-foreground">Here's an overview of your reported items and claims.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/report">Report New Item</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-md bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-primary-foreground/80 text-sm font-medium">My Lost Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{myItems.filter(i => i.ItemStatus === 'Lost').length}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm font-medium">Items Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{myItems.filter(i => i.ItemStatus === 'Found').length}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm font-medium">Handed Over</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{myItems.filter(i => i.ItemStatus === 'Handed over').length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle>My Recent Reports</CardTitle>
          <CardDescription>The last items you've added to the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {recentItems.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>You haven't reported any items yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentItems.map((item) => (
                <div key={item.ItemID} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-secondary/50 transition-colors">
                  <div className="flex gap-4">
                    <div className="bg-secondary p-3 rounded-lg h-12 w-12 flex items-center justify-center">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">{item.Title}</div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> 
                          {locations.find(l => l.LocationID === item.LocationID)?.LocationName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> 
                          {new Date(item.DateReported).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={item.ItemStatus === 'Lost' ? 'destructive' : 'default'}>
                    {item.ItemStatus}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
