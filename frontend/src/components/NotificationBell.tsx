"use client"

import { Bell } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
  const { notifications, currentUser } = useStore();
  
  const userNotifs = notifications.filter(n => 
    currentUser?.UserRole === 'Admin' ? n.IsForAdmin : n.UserID === currentUser?.UserID
  ).slice(0, 5);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {userNotifs.length > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userNotifs.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No new notifications
          </div>
        ) : (
          userNotifs.map((n) => (
            <DropdownMenuItem key={n.NotificationID} className="flex flex-col items-start gap-1 p-3">
              <span className="text-sm font-medium">{n.Message}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(n.CreatedAt), { addSuffix: true })}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
