-- ==================================================================================
-- RelicSync Database Reset Script
-- ==================================================================================
-- WARNING: This drops and recreates all tables with fresh sample data.
-- Run in MySQL Workbench: source database/reset_database.sql
-- ==================================================================================

DROP DATABASE IF EXISTS project;
CREATE DATABASE project;
USE project;


-- Tables
-- ==================================================================================

CREATE TABLE IF NOT EXISTS Users (
    UserID    INT          AUTO_INCREMENT PRIMARY KEY,
    FullName  VARCHAR(100) NOT NULL,
    Email     VARCHAR(100) UNIQUE NOT NULL,
    Phone     VARCHAR(15)  NOT NULL,
    Password  VARCHAR(255) NOT NULL,
    UserRole  ENUM('Student', 'Admin') DEFAULT 'Student'
);

CREATE TABLE IF NOT EXISTS Categories (
    CategoryID   INT         AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS Locations (
    LocationID   INT         AUTO_INCREMENT PRIMARY KEY,
    LocationName VARCHAR(50) UNIQUE NOT NULL
);

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

CREATE TABLE IF NOT EXISTS Claims (
    ClaimID      INT  AUTO_INCREMENT PRIMARY KEY,
    ItemID       INT,
    ClaimantID   INT,
    ProofDetails TEXT,
    ClaimStatus  ENUM('Pending', 'Approved', 'Rejectd') DEFAULT 'Pending',
    FOREIGN KEY (ItemID)     REFERENCES Users(UserID),
    FOREIGN KEY (ClaimantID) REFERENCES Users(UserID)
);

CREATE TABLE IF NOT EXISTS Notifications (
    NotificationID INT       AUTO_INCREMENT PRIMARY KEY,
    UserID         INT,
    IsForAdmin     BOOLEAN   DEFAULT FALSE,
    Message        TEXT      NOT NULL,
    CreatedAt      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);


-- Sample Data
-- ==================================================================================

-- Users
INSERT INTO Users (FullName, Email, Phone, Password, UserRole) VALUES
('Ali Hassan',   'ali.hassan@student.edu',   '03001234567', 'student123', 'Student'),
('Sara Khan',    'sara.khan@student.edu',    '03111234567', 'student123', 'Student'),
('Usman Tariq',  'usman.tariq@student.edu',  '03211234567', 'student123', 'Student'),
('Ayesha Malik', 'ayesha.malik@student.edu', '03321234567', 'student123', 'Student'),
('Bilal Ahmed',  'bilal.ahmed@student.edu',  '03451234567', 'student123', 'Student'),
('Fatima Noor',  'fatima.noor@student.edu',  '03001112233', 'student123', 'Student'),
('Admin User',   'admin@relicsync.edu',       '03009998877', 'admin123',   'Admin'),
('Super Admin',  'superadmin@relicsync.edu',  '03339998877', 'admin123',   'Admin');

-- Categories
INSERT INTO Categories (CategoryName) VALUES
('Electronics'), ('Keys'), ('Documents'), ('Wallets/Bags'),
('Clothing'), ('Books'), ('Jewellery'), ('Other');

-- Locations
INSERT INTO Locations (LocationName) VALUES
('Library'), ('Cafeteria'), ('Main Hall'), ('Science Lab'),
('Sports Complex'), ('Parking Area'), ('Block A Corridor'), ('Admin Office');

-- Items (Realistic Pairs for AI Matching)
INSERT INTO Items (Title, Description, ItemStatus, UserID, CategoryID, LocationID) VALUES
-- Pair 1: Electronics (Samsung Phone)
('Black Samsung Galaxy Phone', 'Samsung Galaxy A34, black color, lost near cafeteria table.',          'Lost',  1, 1, 2),
('Black Samsung Phone',        'Black Samsung Galaxy smartphone found on cafeteria table.',            'Found', 5, 1, 2),

-- Pair 2: Keys (Honda Motorcycle Key)
('Honda Motorcycle Key',       'Honda CG125 key with small red keychain.',                             'Lost',  3, 2, 6),
('Honda Key with Red Ring',    'Found Honda motorcycle key with red keychain near parking area.',      'Found', 6, 2, 6),

-- Pair 3: Documents (Student ID Card)
('University Student ID Card', 'Student ID card of Ali Hassan, Roll No 2023-CS-045.',                 'Lost',  1, 3, 3),
('Ali Hassan Student ID Card', 'Found University Student ID card belonging to Ali Hassan in Main Hall.', 'Found', 5, 3, 3),

-- Pair 4: Books (Textbook)
('Data Structures Textbook',   'Textbook by Mark Allen Weiss, 3rd edition, name written inside.',      'Lost',  4, 6, 1),
('Data Structures 3rd Edition', 'Mark Allen Weiss Data Structures 3rd edition book found in library.',  'Found', 6, 6, 1),

-- Other Unmatched Items
('Brown Leather Wallet',       'Brown wallet with initials UT on the front.',                          'Lost',  3, 4, 2),
('Blue Denim Jacket',          'Medium blue denim jacket left on a chair in cafeteria.',               'Found', 2, 5, 2),
('Apple AirPods Case',         'White AirPods Pro charging case, no AirPods inside.',                  'Handed over', 4, 1, 8);


-- Accurate AI Matches
INSERT INTO Matches (LostItem, FoundItem, IsVarified, Score) VALUES
(1, 2, FALSE, 0.95),  -- Samsung Phone Match
(3, 4, FALSE, 0.92),  -- Honda Key Match
(5, 6, TRUE,  0.96),  -- Student ID Match
(7, 8, FALSE, 0.89);  -- Textbook Match


-- Claims
INSERT INTO Claims (ItemID, ClaimantID, ProofDetails, ClaimStatus) VALUES
(2, 1, 'It is my black Samsung A34. I can unlock it with my passcode.',                   'Pending'),
(4, 3, 'Key ring has red keychain. Lost near parking entrance.',                         'Approved'),
(6, 1, 'Student ID card with my name Ali Hassan and roll number 2023-CS-045.',           'Approved');


-- Notifications
INSERT INTO Notifications (UserID, Message, IsForAdmin) VALUES
(1, 'Your claim for "Student ID Card" has been approved. Visit Admin Office to collect.', FALSE),
(3, 'Your claim for "Honda Motorcycle Key" has been approved. Visit parking office.',       FALSE),
(1, 'A high-confidence match was detected for your lost "Black Samsung Galaxy Phone".',     FALSE),
(7, 'New match generated by AI with score 95% between Samsung Galaxy Phone items.',        TRUE),
(7, 'New match generated by AI with score 92% between Honda Motorcycle Key items.',        TRUE);


-- Verify
-- ==================================================================================

SELECT 'Users'         AS TableName, COUNT(*) AS TotalRows FROM Users        UNION ALL
SELECT 'Categories',                 COUNT(*)                  FROM Categories    UNION ALL
SELECT 'Locations',                  COUNT(*)                  FROM Locations     UNION ALL
SELECT 'Items',                      COUNT(*)                  FROM Items         UNION ALL
SELECT 'Matches',                    COUNT(*)                  FROM Matches       UNION ALL
SELECT 'Claims',                     COUNT(*)                  FROM Claims        UNION ALL
SELECT 'Notifications',              COUNT(*)                  FROM Notifications;
