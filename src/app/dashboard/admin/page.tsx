"use client"

import { useStore } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, Search, CheckCircle, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

export default function AdminDashboard() {
  const { items, matches, claims, users } = useStore();

  const stats = [
    { label: "Total Items", value: items.length, icon: Package, color: "bg-blue-500" },
    { label: "AI Matches", value: matches.length, icon: Search, color: "bg-purple-500" },
    { label: "Pending Claims", value: claims.filter(c => c.ClaimStatus === 'Pending').length, icon: CheckCircle, color: "bg-orange-500" },
    { label: "Total Users", value: users.length, icon: Users, color: "bg-green-500" },
  ];

  const statusData = [
    { name: 'Lost', value: items.filter(i => i.ItemStatus === 'Lost').length },
    { name: 'Found', value: items.filter(i => i.ItemStatus === 'Found').length },
    { name: 'Handed Over', value: items.filter(i => i.ItemStatus === 'Handed over').length },
  ];

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Item Status Distribution</CardTitle>
            <CardDescription>Overview of lost, found, and returned items.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Resolution Rate</CardTitle>
            <CardDescription>Successful reunions vs reported lost items.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
