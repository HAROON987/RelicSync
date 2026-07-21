-- ==================================================================================
-- RelicSync Database Sample Data Script
-- ==================================================================================
-- Database: project
-- Engine:   MySQL 8.0+
-- Run order: Execute AFTER schema.sql
-- In MySQL Workbench: source database/sample_data.sql
-- Execution sequence: Users -> Categories -> Locations -> Items -> Matches -> Claims -> Notifications
-- ==================================================================================

USE project;

-- ==================================================================================
-- 1. USERS TABLE DATA
-- Default passwords set to plain text for local environment testing
-- ==================================================================================

INSERT INTO Users (FullName, Email, Phone, Password, UserRole) VALUES
('Ali Hassan',   'ali.hassan@student.edu',   '03001234567', 'student123', 'Student'),
('Sara Khan',    'sara.khan@student.edu',    '03111234567', 'student123', 'Student'),
('Usman Tariq',  'usman.tariq@student.edu',  '03211234567', 'student123', 'Student'),
('Ayesha Malik', 'ayesha.malik@student.edu', '03321234567', 'student123', 'Student'),
('Bilal Ahmed',  'bilal.ahmed@student.edu',  '03451234567', 'student123', 'Student'),
('Fatima Noor',  'fatima.noor@student.edu',  '03001112233', 'student123', 'Student'),
('Admin User',   'admin@relicsync.edu',       '03009998877', 'admin123',   'Admin'),
('Super Admin',  'superadmin@relicsync.edu',  '03339998877', 'admin123',   'Admin');


-- ==================================================================================
-- 2. CATEGORIES TABLE DATA
-- Standard categorizations for reported university items
-- ==================================================================================

INSERT IGNORE INTO Categories (CategoryName) VALUES
('Electronics'),
('Keys'),
('Documents'),
('Wallets/Bags'),
('Clothing'),
('Books'),
('Jewellery'),
('Other');


-- ==================================================================================
-- 3. LOCATIONS TABLE DATA
-- Designated campus areas for item reporting and filtering
-- ==================================================================================

INSERT IGNORE INTO Locations (LocationName) VALUES
('Library'),
('Cafeteria'),
('Main Hall'),
('Science Lab'),
('Sports Complex'),
('Parking Area'),
('Block A Corridor'),
('Admin Office');


-- ==================================================================================
-- 4. ITEMS TABLE DATA
-- Realistic Lost & Found item pairs for AI evaluation testing
-- ==================================================================================

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

-- Additional Unmatched Items
('Brown Leather Wallet',       'Brown wallet with initials UT on the front.',                          'Lost',  3, 4, 2),
('Blue Denim Jacket',          'Medium blue denim jacket left on a chair in cafeteria.',               'Found', 2, 5, 2),
('Apple AirPods Case',         'White AirPods Pro charging case, no AirPods inside.',                  'Handed over', 4, 1, 8);


-- ==================================================================================
-- 5. MATCHES TABLE DATA
-- High-confidence AI score associations between Lost and Found items
-- ==================================================================================

INSERT INTO Matches (LostItem, FoundItem, IsVarified, Score) VALUES
(1, 2, FALSE, 0.95),  -- Samsung Phone Match
(3, 4, FALSE, 0.92),  -- Honda Key Match
(5, 6, TRUE,  0.96),  -- Student ID Match
(7, 8, FALSE, 0.89);  -- Textbook Match


-- ==================================================================================
-- 6. CLAIMS TABLE DATA
-- Verification requests submitted by student owners
-- ==================================================================================

INSERT INTO Claims (ItemID, ClaimantID, ProofDetails, ClaimStatus) VALUES
(2, 1, 'It is my black Samsung A34. I can unlock it with my passcode.',                   'Pending'),
(4, 3, 'Key ring has red keychain. Lost near parking entrance.',                         'Approved'),
(6, 1, 'Student ID card with my name Ali Hassan and roll number 2023-CS-045.',           'Approved');


-- ==================================================================================
-- 7. NOTIFICATIONS TABLE DATA
-- Automated status and verification alerts for students and administrators
-- ==================================================================================

INSERT INTO Notifications (UserID, Message, IsForAdmin) VALUES
(1, 'Your claim for "Student ID Card" has been approved. Visit Admin Office to collect.', FALSE),
(3, 'Your claim for "Honda Motorcycle Key" has been approved. Visit parking office.',       FALSE),
(1, 'A high-confidence match was detected for your lost "Black Samsung Galaxy Phone".',     FALSE),
(7, 'New match generated by AI with score 95% between Samsung Galaxy Phone items.',        TRUE),
(7, 'New match generated by AI with score 92% between Honda Motorcycle Key items.',        TRUE);


-- ==================================================================================
-- Verification: Record counts across all schema tables
-- ==================================================================================

SELECT 'Users'         AS TableName, COUNT(*) AS TotalRows FROM Users        UNION ALL
SELECT 'Categories',                 COUNT(*)                  FROM Categories    UNION ALL
SELECT 'Locations',                  COUNT(*)                  FROM Locations     UNION ALL
SELECT 'Items',                      COUNT(*)                  FROM Items         UNION ALL
SELECT 'Matches',                    COUNT(*)                  FROM Matches       UNION ALL
SELECT 'Claims',                     COUNT(*)                  FROM Claims        UNION ALL
SELECT 'Notifications',              COUNT(*)                  FROM Notifications;
