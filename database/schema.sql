-- ==================================================================================
-- RelicSync Database Schema
-- ==================================================================================
-- Database: project
-- Engine:   MySQL 8.0+
-- Run in MySQL Workbench: source database/schema.sql
-- ==================================================================================

CREATE DATABASE IF NOT EXISTS project;
USE project;


-- ==================================================================================
-- TABLE 1: Users
-- ==================================================================================

CREATE TABLE IF NOT EXISTS Users (
    UserID    INT          AUTO_INCREMENT PRIMARY KEY,
    FullName  VARCHAR(100) NOT NULL,
    Email     VARCHAR(100) UNIQUE NOT NULL,
    Phone     VARCHAR(15)  NOT NULL,
    Password  VARCHAR(255) NOT NULL,
    UserRole  ENUM('Student', 'Admin') DEFAULT 'Student'
);


-- ==================================================================================
-- TABLE 2: Categories
-- ==================================================================================

CREATE TABLE IF NOT EXISTS Categories (
    CategoryID   INT         AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(50) UNIQUE NOT NULL
);


-- ==================================================================================
-- TABLE 3: Locations
-- ==================================================================================

CREATE TABLE IF NOT EXISTS Locations (
    LocationID   INT         AUTO_INCREMENT PRIMARY KEY,
    LocationName VARCHAR(50) UNIQUE NOT NULL
);


-- ==================================================================================
-- TABLE 4: Items
-- ==================================================================================

CREATE TABLE IF NOT EXISTS Items (
    ItemID       INT          AUTO_INCREMENT PRIMARY KEY,
    Title        VARCHAR(100) NOT NULL,
    Description  TEXT,
    ItemStatus   ENUM('Lost', 'Found', 'Handed over'),
    DateReported TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    UserID       INT,
    CategoryID   INT,
    LocationID   INT,
    FOREIGN KEY (UserID)     REFERENCES Users(UserID),
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID),
    FOREIGN KEY (LocationID) REFERENCES Locations(LocationID)
);


-- ==================================================================================
-- TABLE 5: Matches
-- Note: 'IsVarified' column name matches the Java backend exactly (intentional)
-- ==================================================================================

CREATE TABLE IF NOT EXISTS Matches (
    MatchID    INT       AUTO_INCREMENT PRIMARY KEY,
    LostItem   INT,
    FoundItem  INT,
    MatchDate  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IsVarified BOOLEAN   DEFAULT FALSE,
    Score      DOUBLE    DEFAULT 0.0,
    FOREIGN KEY (LostItem)  REFERENCES Items(ItemID),
    FOREIGN KEY (FoundItem) REFERENCES Items(ItemID)
);


-- ==================================================================================
-- TABLE 6: Claims
-- Note: 'Rejectd' in ENUM matches the Java backend exactly (intentional)
-- ==================================================================================

CREATE TABLE IF NOT EXISTS Claims (
    ClaimID      INT  AUTO_INCREMENT PRIMARY KEY,
    ItemID       INT,
    ClaimantID   INT,
    ProofDetails TEXT,
    ClaimStatus  ENUM('Pending', 'Approved', 'Rejectd') DEFAULT 'Pending',
    FOREIGN KEY (ItemID)     REFERENCES Items(ItemID),
    FOREIGN KEY (ClaimantID) REFERENCES Users(UserID)
);


-- ==================================================================================
-- TABLE 7: Notifications
-- ==================================================================================

CREATE TABLE IF NOT EXISTS Notifications (
    NotificationID INT       AUTO_INCREMENT PRIMARY KEY,
    UserID         INT,
    IsForAdmin     BOOLEAN   DEFAULT FALSE,
    Message        TEXT      NOT NULL,
    CreatedAt      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);
