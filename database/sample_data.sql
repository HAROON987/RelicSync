-- RelicSync Sample Data
-- Database: project | Run AFTER schema.sql
-- Default passwords are plain text for local development only

USE project;


-- Users (6 students + 1 admin)
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
INSERT IGNORE INTO Categories (CategoryName) VALUES
('Electronics'), ('Keys'), ('Documents'), ('Wallets/Bags'),
('Clothing'), ('Books'), ('Jewellery'), ('Other');


-- Locations
INSERT IGNORE INTO Locations (LocationName) VALUES
('Library'), ('Cafeteria'), ('Main Hall'), ('Science Lab'),
('Sports Complex'), ('Parking Area'), ('Block A Corridor'), ('Admin Office');


-- Items: realistic lost/found pairs designed for AI matching
INSERT INTO Items (Title, Description, ItemStatus, UserID, CategoryID, LocationID) VALUES
-- Pair 1: Samsung Phone
('Black Samsung Galaxy Phone', 'Samsung Galaxy A34, black color, lost near cafeteria table.',             'Lost',        1, 1, 2),
('Black Samsung Phone',        'Black Samsung Galaxy smartphone found on cafeteria table.',               'Found',       5, 1, 2),

-- Pair 2: Honda Motorcycle Key
('Honda Motorcycle Key',       'Honda CG125 key with small red keychain.',                               'Lost',        3, 2, 6),
('Honda Key with Red Ring',    'Found Honda motorcycle key with red keychain near parking area.',         'Found',       6, 2, 6),

-- Pair 3: Student ID Card
('University Student ID Card', 'Student ID card of Ali Hassan, Roll No 2023-CS-045.',                    'Lost',        1, 3, 3),
('Ali Hassan Student ID Card', 'Found University Student ID card belonging to Ali Hassan in Main Hall.',  'Found',       5, 3, 3),

-- Pair 4: Textbook
('Data Structures Textbook',   'Mark Allen Weiss, 3rd edition. Name written on inside cover.',           'Lost',        4, 6, 1),
('Data Structures 3rd Edition','Mark Allen Weiss Data Structures 3rd edition found on library table.',   'Found',       6, 6, 1),

-- Other items
('Brown Leather Wallet',       'Brown wallet with initials UT on the front.',                            'Lost',        3, 4, 2),
('Blue Denim Jacket',          'Medium blue denim jacket left on a chair in the cafeteria.',             'Found',       2, 5, 2),
('Apple AirPods Case',         'White AirPods Pro charging case found in library. No AirPods inside.',   'Handed over', 4, 1, 8);


-- AI-generated matches between lost and found item pairs
INSERT INTO Matches (LostItem, FoundItem, IsVarified, Score) VALUES
(1, 2, FALSE, 0.95),  -- Samsung Phone
(3, 4, FALSE, 0.92),  -- Honda Key
(5, 6, TRUE,  0.96),  -- Student ID
(7, 8, FALSE, 0.89);  -- Textbook


-- Claims submitted by students as proof of ownership
INSERT INTO Claims (ItemID, ClaimantID, ProofDetails, ClaimStatus) VALUES
(2, 1, 'It is my black Samsung A34. I can unlock it with my passcode.',      'Pending'),
(4, 3, 'Key ring has red keychain. Lost near parking entrance on Tuesday.',  'Approved'),
(6, 1, 'My name Ali Hassan and roll number 2023-CS-045 are on the card.',    'Approved');


-- Notifications sent to users and admins
INSERT INTO Notifications (UserID, Message, IsForAdmin) VALUES
(1, 'Your claim for "Student ID Card" has been approved. Visit Admin Office to collect.', FALSE),
(3, 'Your claim for "Honda Motorcycle Key" has been approved. Visit parking office.',     FALSE),
(1, 'A high-confidence match was found for your lost "Black Samsung Galaxy Phone".',      FALSE),
(7, 'New AI match generated with 95% score between Samsung Galaxy Phone items.',          TRUE),
(7, 'New AI match generated with 92% score between Honda Motorcycle Key items.',          TRUE);


-- Verify record counts
SELECT 'Users'         AS TableName, COUNT(*) AS TotalRows FROM Users         UNION ALL
SELECT 'Categories',                 COUNT(*)              FROM Categories     UNION ALL
SELECT 'Locations',                  COUNT(*)              FROM Locations      UNION ALL
SELECT 'Items',                      COUNT(*)              FROM Items          UNION ALL
SELECT 'Matches',                    COUNT(*)              FROM Matches        UNION ALL
SELECT 'Claims',                     COUNT(*)              FROM Claims         UNION ALL
SELECT 'Notifications',              COUNT(*)              FROM Notifications;
