"use client"

import { useState } from "react";
import { useStore } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, MapPin, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettings() {
  const { categories, locations, addCategory, removeCategory, addLocation, removeLocation, currentUser } = useStore();
  const { toast } = useToast();
  const [newCategory, setNewCategory] = useState("");
  const [newLocation, setNewLocation] = useState("");

  if (currentUser?.UserRole !== 'Admin') {
    return <div className="p-8 text-center font-bold">Access Denied</div>;
  }

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    addCategory(newCategory.trim());
    setNewCategory("");
    toast({ title: "Category Added", description: "Successfully added new category." });
  };

  const handleAddLocation = () => {
    if (!newLocation.trim()) return;
    addLocation(newLocation.trim());
    setNewLocation("");
    toast({ title: "Location Added", description: "Successfully added new location." });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Categories Section */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-5 w-5 text-primary" />
              <CardTitle>Manage Categories</CardTitle>
            </div>
            <CardDescription>Add or remove item classification categories.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2">
              <Input 
                placeholder="New Category Name..." 
                value={newCategory} 
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <Button onClick={handleAddCategory} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead className="w-[80px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.CategoryID}>
                      <TableCell className="font-medium">{cat.CategoryName}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => removeCategory(cat.CategoryID)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Locations Section */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle>Manage Locations</CardTitle>
            </div>
            <CardDescription>Configure common campus or site locations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2">
              <Input 
                placeholder="New Location Name..." 
                value={newLocation} 
                onChange={(e) => setNewLocation(e.target.value)}
              />
              <Button onClick={handleAddLocation} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location Name</TableHead>
                    <TableHead className="w-[80px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((loc) => (
                    <TableRow key={loc.LocationID}>
                      <TableCell className="font-medium">{loc.LocationName}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => removeLocation(loc.LocationID)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
