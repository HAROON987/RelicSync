-- RelicSync Operational Queries
-- Database: project | Engine: MySQL 8.0+
-- These queries power the backend API and are grouped into 4 functional modules.

CREATE DATABASE IF NOT EXISTS project;
USE project;

-- Drop existing tables (order matters due to foreign key dependencies)
DROP TABLE IF EXISTS Notifications;
DROP TABLE IF EXISTS Claims;
DROP TABLE IF EXISTS Matches;
DROP TABLE IF EXISTS Items;
DROP TABLE IF EXISTS Locations;
DROP TABLE IF EXISTS Categories;
DROP TABLE IF EXISTS Users;


-- Schema with full integrity constraints

CREATE TABLE Users (
    UserID    INT          AUTO_INCREMENT,
    FullName  VARCHAR(100) NOT NULL,
    Email     VARCHAR(100) NOT NULL,
    Phone     VARCHAR(15)  NOT NULL,
    Password  VARCHAR(255) NOT NULL,
    UserRole  ENUM('Student', 'Admin') DEFAULT 'Student',
    CONSTRAINT PK_Users        PRIMARY KEY (UserID),
    CONSTRAINT UQ_Users_Email  UNIQUE (Email),
    CONSTRAINT CHK_Users_Phone CHECK (LENGTH(Phone) >= 10),
    CONSTRAINT CHK_Users_Email CHECK (Email LIKE '%_@__%.__%')
);

CREATE TABLE Categories (
    CategoryID   INT         AUTO_INCREMENT,
    CategoryName VARCHAR(50) NOT NULL,
    CONSTRAINT PK_Categories      PRIMARY KEY (CategoryID),
    CONSTRAINT UQ_Categories_Name UNIQUE (CategoryName)
);

CREATE TABLE Locations (
    LocationID   INT         AUTO_INCREMENT,
    LocationName VARCHAR(50) NOT NULL,
    CONSTRAINT PK_Locations      PRIMARY KEY (LocationID),
    CONSTRAINT UQ_Locations_Name UNIQUE (LocationName)
);

CREATE TABLE Items (
    ItemID       INT          AUTO_INCREMENT,
    Title        VARCHAR(100) NOT NULL,
    Description  TEXT         NOT NULL,
    ItemStatus   ENUM('Lost', 'Found', 'Handed over') DEFAULT 'Lost',
    DateReported TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    UserID       INT          NOT NULL,
    CategoryID   INT          NOT NULL,
    LocationID   INT          NOT NULL,
    CONSTRAINT PK_Items          PRIMARY KEY (ItemID),
    CONSTRAINT FK_Items_User     FOREIGN KEY (UserID)     REFERENCES Users(UserID)         ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_Items_Category FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_Items_Location FOREIGN KEY (LocationID) REFERENCES Locations(LocationID)  ON DELETE CASCADE ON UPDATE CASCADE
);

-- Note: 'IsVarified' column name matches the Java backend exactly (intentional spelling)
CREATE TABLE Matches (
    MatchID    INT       AUTO_INCREMENT,
    LostItem   INT       NOT NULL,
    FoundItem  INT       NOT NULL,
    MatchDate  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IsVarified BOOLEAN   DEFAULT FALSE,
    Score      DOUBLE    DEFAULT 0.0,
    CONSTRAINT PK_Matches        PRIMARY KEY (MatchID),
    CONSTRAINT FK_Matches_Lost   FOREIGN KEY (LostItem)  REFERENCES Items(ItemID) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_Matches_Found  FOREIGN KEY (FoundItem) REFERENCES Items(ItemID) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT CHK_Matches_Score CHECK (Score >= 0.0 AND Score <= 1.0),
    CONSTRAINT CHK_Matches_Self  CHECK (LostItem <> FoundItem)
);

-- Note: 'Rejectd' in ENUM matches the Java backend exactly (intentional spelling)
CREATE TABLE Claims (
    ClaimID      INT  AUTO_INCREMENT,
    ItemID       INT  NOT NULL,
    ClaimantID   INT  NOT NULL,
    ProofDetails TEXT NOT NULL,
    ClaimStatus  ENUM('Pending', 'Approved', 'Rejectd') DEFAULT 'Pending',
    CONSTRAINT PK_Claims          PRIMARY KEY (ClaimID),
    CONSTRAINT FK_Claims_Item     FOREIGN KEY (ItemID)     REFERENCES Items(ItemID)  ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_Claims_Claimant FOREIGN KEY (ClaimantID) REFERENCES Users(UserID)  ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Notifications (
    NotificationID INT       AUTO_INCREMENT,
    UserID         INT       NOT NULL,
    IsForAdmin     BOOLEAN   DEFAULT FALSE,
    Message        TEXT      NOT NULL,
    CreatedAt      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT PK_Notifications      PRIMARY KEY (NotificationID),
    CONSTRAINT FK_Notifications_User FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE ON UPDATE CASCADE
);


-- MODULE 1: User Authentication & Account Management

-- Register a new user
INSERT INTO Users (FullName, Email, Password, Phone, UserRole) VALUES (?, ?, ?, ?, ?);

-- Authenticate user on login
SELECT * FROM Users WHERE Email = ? AND Password = ? AND UserRole = ?;

-- Get user profile by ID
SELECT * FROM Users WHERE UserID = ?;

-- Get all registered users
SELECT * FROM Users;


-- MODULE 2: Item Reporting & Inventory Management

-- Report a new lost or found item
INSERT INTO Items (Title, Description, ItemStatus, UserID, CategoryID, LocationID) VALUES (?, ?, ?, ?, ?, ?);

-- Get all reported items
SELECT * FROM Items;

-- Get items reported by a specific user
SELECT * FROM Items WHERE UserID = ?;

-- Get item details by ID
SELECT * FROM Items WHERE ItemID = ?;

-- Update item status (e.g. mark as Handed over)
UPDATE Items SET ItemStatus = ? WHERE ItemID = ?;


-- MODULE 3: Claims Workflow & Relational Joins

-- File an ownership claim
INSERT INTO Claims (ItemID, ClaimantID, ProofDetails, ClaimStatus) VALUES (?, ?, ?, ?);

-- Get all claims with claimant details
SELECT
    c.ClaimID,
    c.ItemID,
    c.ClaimantID,
    c.ProofDetails,
    c.ClaimStatus,
    u.FullName AS ClaimantName,
    u.Email    AS ClaimantEmail,
    u.Phone    AS ClaimantPhone
FROM Claims c
INNER JOIN Users u ON c.ClaimantID = u.UserID;

-- Get claims by a specific student
SELECT * FROM Claims WHERE ClaimantID = ?;

-- Approve or reject a claim
UPDATE Claims SET ClaimStatus = ? WHERE ClaimID = ?;


-- MODULE 4: AI Matchmaking & Notifications

-- Save an AI-generated match
INSERT INTO Matches (LostItem, FoundItem, IsVarified, Score) VALUES (?, ?, ?, ?);

-- Get all matches
SELECT * FROM Matches;

-- Update match verification status
UPDATE Matches SET IsVarified = ? WHERE MatchID = ?;

-- Delete an invalid match
DELETE FROM Matches WHERE MatchID = ?;

-- Send a notification
INSERT INTO Notifications (UserID, Message, IsForAdmin) VALUES (?, ?, ?);

-- Get notifications sorted by newest
SELECT * FROM Notifications ORDER BY CreatedAt DESC;

-- Get all categories
SELECT * FROM Categories;

-- Get all campus locations
SELECT * FROM Locations;
