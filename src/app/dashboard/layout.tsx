"use client"

import { ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarFooter,
  SidebarInset,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  PlusCircle, 
  Package, 
  Search, 
  CheckCircle, 
  LogOut, 
  ShieldAlert,
  PackageSearch
} from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { useStore } from "@/lib/db";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { currentUser, logout, isLoaded } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  if (!isLoaded) return null;
  if (!currentUser) {
    router.push('/');
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const menuItems = currentUser.UserRole === 'Admin' 
    ? [
        { title: "Overview", icon: LayoutDashboard, href: "/dashboard/admin" },
        { title: "Manage Items", icon: Package, href: "/dashboard/items" },
        { title: "AI Match Hub", icon: Search, href: "/dashboard/matches" },
        { title: "Verify Claims", icon: CheckCircle, href: "/dashboard/claims" },
      ]
    : [
        { title: "Overview", icon: LayoutDashboard, href: "/dashboard/student" },
        { title: "Report Item", icon: PlusCircle, href: "/dashboard/report" },
        { title: "My Reports", icon: Package, href: "/dashboard/items" },
        { title: "Claims", icon: ShieldAlert, href: "/dashboard/claims" },
      ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r border-border/50">
          <SidebarHeader className="h-16 flex items-center px-6">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg">
                <PackageSearch className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-headline font-bold text-xl">RelicSync</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu className="px-3 space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link href={item.href} className="flex items-center gap-3 px-3 py-2">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <div className="bg-secondary/50 p-4 rounded-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  {currentUser.FullName[0]}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-medium truncate">{currentUser.FullName}</span>
                  <span className="text-xs text-muted-foreground truncate">{currentUser.UserRole}</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <header className="h-16 border-b border-border/50 flex items-center justify-between px-6 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h2 className="font-headline font-semibold text-lg hidden sm:block">
                {menuItems.find(item => item.href === pathname)?.title || "Dashboard"}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
