"use client"

import { useState, useEffect } from 'react';

export type UserRole = "Student" | "Admin";
export type ItemStatus = "Lost" | "Found" | "Handed over";
export type ClaimStatus = "Pending" | "Approved" | "Rejected";

export interface User {
  UserID: number;
  FullName: string;
  Email: string;
  Phone: string;
  UserRole: UserRole;
}

export interface Category {
  CategoryID: number;
  CategoryName: string;
}

export interface Location {
  LocationID: number;
  LocationName: string;
}

export interface Item {
  ItemID: number;
  Title: string;
  Description: string;
  ItemStatus: ItemStatus;
  DateReported: string;
  UserID: number;
  CategoryID: number;
  LocationID: number;
}

export interface Match {
  MatchID: number;
  LostItem: number;
  FoundItem: number;
  MatchDate: string;
  IsVerified: boolean;
  Score?: number;
}

export interface Claim {
  ClaimID: number;
  ItemID: number;
  ClaimantID: number;
  ProofDetails: string;
  ClaimStatus: ClaimStatus;
}

export interface Notification {
  NotificationID: number;
  UserID: number;
  IsForAdmin: boolean;
  Message: string;
  CreatedAt: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  { CategoryID: 1, CategoryName: "Electronics" },
  { CategoryID: 2, CategoryName: "Keys" },
  { CategoryID: 3, CategoryName: "Documents" },
  { CategoryID: 4, CategoryName: "Wallets/Bags" },
  { CategoryID: 5, CategoryName: "Other" },
];

const DEFAULT_LOCATIONS: Location[] = [
  { LocationID: 1, LocationName: "Library" },
  { LocationID: 2, LocationName: "Cafeteria" },
  { LocationID: 3, LocationName: "Main Hall" },
  { LocationID: 4, LocationName: "Science Lab" },
  { LocationID: 5, LocationName: "Sports Complex" },
];

export function useStore() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [categories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [locations] = useState<Location[]>(DEFAULT_LOCATIONS);
  const [matches, setMatches] = useState<Match[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('relicsync_db');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setUsers(parsed.users || []);
      setItems(parsed.items || []);
      setMatches(parsed.matches || []);
      setClaims(parsed.claims || []);
      setNotifications(parsed.notifications || []);
      const savedUser = localStorage.getItem('relicsync_user');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('relicsync_db', JSON.stringify({
        users, items, matches, claims, notifications
      }));
    }
  }, [users, items, matches, claims, notifications, isLoaded]);

  const login = (email: string, role: UserRole) => {
    let user = users.find(u => u.Email === email && u.UserRole === role);
    if (!user) {
      user = {
        UserID: Date.now(),
        FullName: email.split('@')[0],
        Email: email,
        Phone: "00000000000",
        UserRole: role
      };
      setUsers(prev => [...prev, user!]);
    }
    setCurrentUser(user);
    localStorage.setItem('relicsync_user', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('relicsync_user');
  };

  const reportItem = (data: Omit<Item, 'ItemID' | 'DateReported' | 'UserID'>) => {
    if (!currentUser) return;
    const newItem: Item = {
      ...data,
      ItemID: Date.now(),
      DateReported: new Date().toISOString(),
      UserID: currentUser.UserID
    };
    setItems(prev => [newItem, ...prev]);
    
    // Auto-create matching for admins to see (simulated trigger)
    if (newItem.ItemStatus === 'Found') {
      const lostItems = items.filter(i => i.ItemStatus === 'Lost' && i.CategoryID === newItem.CategoryID);
      // We'll let the AI trigger later in the admin dashboard matching view
    }

    addNotification(
      currentUser.UserID,
      `Your item "${newItem.Title}" has been reported as ${newItem.ItemStatus.toLowerCase()}.`,
      false
    );
  };

  const addNotification = (userID: number, message: string, isForAdmin: boolean) => {
    const newNotif: Notification = {
      NotificationID: Date.now(),
      UserID: userID,
      IsForAdmin: isForAdmin,
      Message: message,
      CreatedAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const addClaim = (itemID: number, proof: string) => {
    if (!currentUser) return;
    const newClaim: Claim = {
      ClaimID: Date.now(),
      ItemID: itemID,
      ClaimantID: currentUser.UserID,
      ProofDetails: proof,
      ClaimStatus: 'Pending'
    };
    setClaims(prev => [...prev, newClaim]);
    addNotification(1, `A new claim has been filed for item ID ${itemID}.`, true);
  };

  const updateClaimStatus = (claimID: number, status: ClaimStatus) => {
    setClaims(prev => prev.map(c => c.ClaimID === claimID ? { ...c, ClaimStatus: status } : c));
    const claim = claims.find(c => c.ClaimID === claimID);
    if (claim) {
      addNotification(claim.ClaimantID, `Your claim status for item ${claim.ItemID} has been updated to ${status}.`, false);
      if (status === 'Approved') {
        const item = items.find(i => i.ItemID === claim.ItemID);
        if (item) {
          updateItemStatus(item.ItemID, 'Handed over');
        }
      }
    }
  };

  const updateItemStatus = (itemID: number, status: ItemStatus) => {
    setItems(prev => prev.map(i => i.ItemID === itemID ? { ...i, ItemStatus: status } : i));
  };

  const addMatch = (lostItemID: number, foundItemID: number, score: number) => {
    const newMatch: Match = {
      MatchID: Date.now() + Math.random(),
      LostItem: lostItemID,
      FoundItem: foundItemID,
      MatchDate: new Date().toISOString(),
      IsVerified: false,
      Score: score
    };
    setMatches(prev => [...prev, newMatch]);
    addNotification(1, "A new high-probability item match was detected.", true);
  };

  return {
    currentUser,
    users,
    items,
    categories,
    locations,
    matches,
    claims,
    notifications,
    login,
    logout,
    reportItem,
    addClaim,
    updateClaimStatus,
    updateItemStatus,
    addMatch,
    isLoaded
  };
}
