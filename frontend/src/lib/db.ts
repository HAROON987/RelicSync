"use client"

import { useState, useEffect } from 'react';

export type UserRole = "Student" | "Admin";
export type ItemStatus = "Lost" | "Found" | "Handed over";
export type ClaimStatus = "Pending" | "Approved" | "Rejectd";

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
  ClaimantName?: string;
  ClaimantEmail?: string;
  ClaimantPhone?: string;
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

const API_BASE = "http://localhost:8080/api";

export function useStore() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchData = async () => {
    let activeUser: User | null = currentUser;
    const savedUser = localStorage.getItem('relicsync_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        activeUser = parsed;
        setCurrentUser(parsed);
      } catch (e) {}
    }

    try {
      const itemsUrl = activeUser?.UserRole === 'Student' 
        ? `${API_BASE}/items?userId=${activeUser?.UserID}` 
        : `${API_BASE}/items`;

      const [itemsRes, catsRes, locsRes, claimsRes, notifsRes, matchesRes, usersRes] = await Promise.all([
        fetch(itemsUrl).catch(() => null),
        fetch(`${API_BASE}/categories`).catch(() => null),
        fetch(`${API_BASE}/locations`).catch(() => null),
        fetch(`${API_BASE}/claims`).catch(() => null),
        fetch(`${API_BASE}/notifications`).catch(() => null),
        fetch(`${API_BASE}/matches`).catch(() => null),
        fetch(`${API_BASE}/users`).catch(() => null),
      ]);

      if (itemsRes && itemsRes.ok) setItems(await itemsRes.json().catch(() => []));
      if (catsRes && catsRes.ok) setCategories(await catsRes.json().catch(() => []));
      if (locsRes && locsRes.ok) setLocations(await locsRes.json().catch(() => []));
      if (claimsRes && claimsRes.ok) setClaims(await claimsRes.json().catch(() => []));
      if (notifsRes && notifsRes.ok) setNotifications(await notifsRes.json().catch(() => []));
      if (matchesRes && matchesRes.ok) setMatches(await matchesRes.json().catch(() => []));
      if (usersRes && usersRes.ok) setUsers(await usersRes.json().catch(() => []));
      
      setIsLoaded(true);
    } catch (err) {
      console.error("Failed to fetch data from Java Backend:", err);
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });

      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        localStorage.setItem('relicsync_user', JSON.stringify(user));
        await fetchData();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  const register = async (fullName: string, email: string, phone: string, password: string, role: UserRole) => {
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, password, role })
      });
      return res.ok;
    } catch (err) {
      console.error("Registration failed:", err);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('relicsync_user');
  };

  const reportItem = async (data: Omit<Item, 'ItemID' | 'DateReported' | 'UserID'>) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, UserID: currentUser.UserID })
      });
      if (res.ok) {
        fetchData(); // Refresh data
      }
    } catch (err) {
      console.error("Failed to report item:", err);
    }
  };

  const addClaim = async (itemID: number, proof: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE}/claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ItemID: itemID, ClaimantID: currentUser.UserID, ProofDetails: proof })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Failed to add claim:", err);
    }
  };

  const updateClaimStatus = async (claimID: number, status: ClaimStatus) => {
    try {
      const res = await fetch(`${API_BASE}/claims/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ClaimID: claimID, ClaimStatus: status })
      });
      if (res.ok) {
        fetchData();
        return true;
      }
      throw new Error(await res.text());
    } catch (err) {
      console.error("Failed to update claim status:", err);
      throw err;
    }
  };

  const updateItemStatus = async (itemID: number, status: ItemStatus) => {
     try {
      const res = await fetch(`${API_BASE}/items/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ItemID: itemID, ItemStatus: status })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Failed to update item status:", err);
    }
  };

  const addCategory = async (name: string) => {
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ CategoryName: name })
      });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const removeCategory = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/categories?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const addLocation = async (name: string) => {
    try {
      const res = await fetch(`${API_BASE}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ LocationName: name })
      });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const removeLocation = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/locations?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const addMatch = async (lostID: number, foundID: number, score: number) => {
    try {
      const res = await fetch(`${API_BASE}/matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ LostItem: lostID, FoundItem: foundID, Score: score })
      });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const updateMatchStatus = async (matchId: number, status: 'Accepted' | 'Dismissed') => {
    try {
      const res = await fetch(`${API_BASE}/matches/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ MatchID: matchId, Status: status })
      });
      if (res.ok) {
        fetchData();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to update match status:", err);
      return false;
    }
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
    register,
    logout,
    reportItem,
    addClaim,
    updateClaimStatus,
    updateItemStatus,
    addCategory,
    removeCategory,
    addLocation,
    removeLocation,
    addMatch,
    updateMatchStatus,
    isLoaded
  };
}
