-- ==================================================================================
-- RelicSync — Complete Constrained Database Schema & Operational SQL Queries
-- ==================================================================================
-- Database: project
-- Engine:   MySQL 8.0+
-- Description: Advanced database schema with Primary Keys, Foreign Keys, 
--              Cascade triggers, Unique constraints, and Check constraints.
-- Operational queries are grouped into 4 functional modules for team presentations/vivas.
-- ==================================================================================

-- ==================================================================================
-- PART 1: DATABASE SCHEMA DEFINITION WITH INTEGRITY CONSTRAINTS
-- ==================================================================================

CREATE DATABASE IF NOT EXISTS project;
USE project;

-- Drop existing tables to ensure clean initialization
DROP TABLE IF EXISTS Notifications;
DROP TABLE IF EXISTS Claims;
DROP TABLE IF EXISTS Matches;
DROP TABLE IF EXISTS Items;
DROP TABLE IF EXISTS Locations;
DROP TABLE IF EXISTS Categories;
DROP TABLE IF EXISTS Users;


-- 1. USERS TABLE
CREATE TABLE Users (
    UserID    INT          AUTO_INCREMENT,
    FullName  VARCHAR(100) NOT NULL,
    Email     VARCHAR(100) NOT NULL,
    Phone     VARCHAR(15)  NOT NULL,
    Password  VARCHAR(255) NOT NULL,
    UserRole  ENUM('Student', 'Admin') DEFAULT 'Student',
    
    -- Integrity Constraints
    CONSTRAINT PK_Users PRIMARY KEY (UserID),
    CONSTRAINT UQ_Users_Email UNIQUE (Email),
    CONSTRAINT CHK_Users_Phone CHECK (LENGTH(Phone) >= 10),
    CONSTRAINT CHK_Users_Email_Format CHECK (Email LIKE '%_@__%.__%')
);


-- 2. CATEGORIES TABLE
CREATE TABLE Categories (
    CategoryID   INT         AUTO_INCREMENT,
    CategoryName VARCHAR(50) NOT NULL,
    
    -- Integrity Constraints
    CONSTRAINT PK_Categories PRIMARY KEY (CategoryID),
    CONSTRAINT UQ_Categories_Name UNIQUE (CategoryName)
);


-- 3. LOCATIONS TABLE
CREATE TABLE Locations (
    LocationID   INT         AUTO_INCREMENT,
    LocationName VARCHAR(50) NOT NULL,
    
    -- Integrity Constraints
    CONSTRAINT PK_Locations PRIMARY KEY (LocationID),
    CONSTRAINT UQ_Locations_Name UNIQUE (LocationName)
);


-- 4. ITEMS TABLE
CREATE TABLE Items (
    ItemID       INT          AUTO_INCREMENT,
    Title        VARCHAR(100) NOT NULL,
    Description  TEXT         NOT NULL,
    ItemStatus   ENUM('Lost', 'Found', 'Handed over') DEFAULT 'Lost',
    DateReported TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    UserID       INT          NOT NULL,
    CategoryID   INT          NOT NULL,
    LocationID   INT          NOT NULL,
    
    -- Integrity Constraints
    CONSTRAINT PK_Items PRIMARY KEY (ItemID),
    CONSTRAINT FK_Items_User     FOREIGN KEY (UserID)     REFERENCES Users(UserID)      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_Items_Category FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_Items_Location FOREIGN KEY (LocationID) REFERENCES Locations(LocationID)  ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT CHK_Items_Status  CHECK (ItemStatus IN ('Lost', 'Found', 'Handed over'))
);


-- 5. MATCHES TABLE
CREATE TABLE Matches (
    MatchID    INT       AUTO_INCREMENT,
    LostItem   INT       NOT NULL,
    FoundItem  INT       NOT NULL,
    MatchDate  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IsVarified BOOLEAN   DEFAULT FALSE,
    Score      DOUBLE    DEFAULT 0.0,
    
    -- Integrity Constraints
    CONSTRAINT PK_Matches PRIMARY KEY (MatchID),
    CONSTRAINT FK_Matches_Lost  FOREIGN KEY (LostItem)  REFERENCES Items(ItemID) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_Matches_Found FOREIGN KEY (FoundItem) REFERENCES Items(ItemID) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT CHK_Matches_Score CHECK (Score >= 0.0 AND Score <= 1.0),
    CONSTRAINT CHK_Matches_SelfMatch CHECK (LostItem <> FoundItem)
);


-- 6. CLAIMS TABLE
CREATE TABLE Claims (
    ClaimID      INT  AUTO_INCREMENT,
    ItemID       INT  NOT NULL,
    ClaimantID   INT  NOT NULL,
    ProofDetails TEXT NOT NULL,
    ClaimStatus  ENUM('Pending', 'Approved', 'Rejectd') DEFAULT 'Pending',
    
    -- Integrity Constraints
    CONSTRAINT PK_Claims PRIMARY KEY (ClaimID),
    CONSTRAINT FK_Claims_Item     FOREIGN KEY (ItemID)     REFERENCES Items(ItemID) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_Claims_Claimant FOREIGN KEY (ClaimantID) REFERENCES Users(UserID) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT CHK_Claims_Status   CHECK (ClaimStatus IN ('Pending', 'Approved', 'Rejectd'))
);


-- 7. NOTIFICATIONS TABLE
CREATE TABLE Notifications (
    NotificationID INT       AUTO_INCREMENT,
    UserID         INT       NOT NULL,
    IsForAdmin     BOOLEAN   DEFAULT FALSE,
    Message        TEXT      NOT NULL,
    CreatedAt      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Integrity Constraints
    CONSTRAINT PK_Notifications PRIMARY KEY (NotificationID),
    CONSTRAINT FK_Notifications_User FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE ON UPDATE CASCADE
);


-- ==================================================================================
-- PART 2: SYSTEM OPERATIONAL QUERIES (4 FUNCTIONAL MODULES)
-- ==================================================================================

-- ----------------------------------------------------------------------------------
-- MODULE 1: USER AUTHENTICATION & ACCOUNT MANAGEMENT
-- ----------------------------------------------------------------------------------

-- 1. Register a new user
INSERT INTO Users (FullName, Email, Password, Phone, UserRole) 
VALUES (?, ?, ?, ?, ?);

-- 2. Authenticate user credentials on login
SELECT * FROM Users 
WHERE Email = ? AND Password = ? AND UserRole = ?;

-- 3. Fetch user profile by UserID
SELECT * FROM Users 
WHERE UserID = ?;

-- 4. Retrieve list of all registered users
SELECT * FROM Users;


-- ----------------------------------------------------------------------------------
-- MODULE 2: ITEM REPORTING & INVENTORY MANAGEMENT
-- ----------------------------------------------------------------------------------

-- 5. Submit a new Lost or Found item report
INSERT INTO Items (Title, Description, ItemStatus, UserID, CategoryID, LocationID) 
VALUES (?, ?, ?, ?, ?, ?);

-- 6. Load central list of all reported items
SELECT * FROM Items;

-- 7. Fetch items reported by a specific user
SELECT * FROM Items 
WHERE UserID = ?;

-- 8. Fetch item details by ItemID
SELECT * FROM Items 
WHERE ItemID = ?;

-- 9. Update item status (e.g., set to 'Handed over' when claimed)
UPDATE Items 
SET ItemStatus = ? 
WHERE ItemID = ?;


-- ----------------------------------------------------------------------------------
-- MODULE 3: CLAIMS WORKFLOW & RELATIONAL JOINS
-- ----------------------------------------------------------------------------------

-- 10. File an ownership claim request for a found item
INSERT INTO Claims (ItemID, ClaimantID, ProofDetails, ClaimStatus) 
VALUES (?, ?, ?, ?);

-- 11. Retrieve all claims with claimant details (INNER JOIN)
SELECT 
    c.ClaimID,
    c.ItemID,
    c.ClaimantID,
    c.ProofDetails,
    c.ClaimStatus,
    u.FullName AS ClaimantName,
    u.Email AS ClaimantEmail,
    u.Phone AS ClaimantPhone
FROM Claims c
INNER JOIN Users u ON c.ClaimantID = u.UserID;

-- 12. Fetch claims submitted by a specific student
SELECT * FROM Claims 
WHERE ClaimantID = ?;

-- 13. Update claim status (Approve or Reject)
UPDATE Claims 
SET ClaimStatus = ? 
WHERE ClaimID = ?;


-- ----------------------------------------------------------------------------------
-- MODULE 4: AI MATCHMAKING & ALERT NOTIFICATIONS
-- ----------------------------------------------------------------------------------

-- 14. Insert computed AI similarity match between Lost and Found items
INSERT INTO Matches (LostItem, FoundItem, IsVarified, Score) 
VALUES (?, ?, ?, ?);

-- 15. Fetch all calculated item matches
SELECT * FROM Matches;

-- 16. Update match verification status
UPDATE Matches 
SET IsVarified = ? 
WHERE MatchID = ?;

-- 17. Remove invalid match record
DELETE FROM Matches 
WHERE MatchID = ?;

-- 18. Create system notification alert
INSERT INTO Notifications (UserID, Message, IsForAdmin) 
VALUES (?, ?, ?);

-- 19. Retrieve user notifications sorted by latest date (ORDER BY DESC)
SELECT * FROM Notifications 
ORDER BY CreatedAt DESC;

-- 20. Fetch item categories for selection dropdowns
SELECT * FROM Categories;

-- 21. Fetch campus locations for selection dropdowns
SELECT * FROM Locations;
