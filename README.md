# RelicSync | Lost & Found Platform

<div align="center">

![RelicSync](https://img.shields.io/badge/RelicSync-Lost%20%26%20Found-4F46E5?style=for-the-badge&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Java](https://img.shields.io/badge/Java-Backend-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

**A full-stack university Lost & Found platform with AI-powered item matching.**

</div>

---

## About

**RelicSync** is a university Lost & Found management system that helps students report lost or found items and intelligently matches them using AI. Admins can manage items, verify claims, and oversee the entire system from a dedicated dashboard.

Built as a full-stack project with a **Next.js frontend**, a **Java HTTP backend**, and a **MySQL relational database**.

---

## Features

| Feature | Description |
|---|---|
| **Role-Based Auth** | Separate login flows for Students and Admins |
| **Item Reporting** | Report lost or found items with category & location |
| **AI Match Scoring** | Gemini AI analyzes item descriptions and scores similarity |
| **Claim Workflow** | Students submit proof, Admins approve or reject claims |
| **Notifications** | Alerts for matches, status changes, and claims |
| **Admin Dashboard** | Overview of all items, matches, users, and system stats |

---

## Tech Stack

### Frontend
- **Next.js 15** (App Router, Turbopack)
- **TypeScript**
- **TailwindCSS** + **ShadCN UI**
- **Google Genkit** + **Gemini API** (AI matching)

### Backend
- **Java** (Plain HTTP Server via `com.sun.net.httpserver`)
- **JDBC** + **MySQL Connector/J 9.7.0**
- RESTful JSON API on `http://localhost:8080/api`

### Database
- **MySQL** with 7 relational tables
- Schema with FK constraints, ENUMs, and AUTO_INCREMENT

---

## Project Structure

```
RelicSync/
├── frontend/          # Next.js 15 web application
│   ├── src/
│   │   ├── app/       # App Router pages & layouts
│   │   ├── components/ # Reusable UI components
│   │   ├── lib/       # API client & data hooks
│   │   ├── ai/        # Genkit AI flows
│   │   └── hooks/     # Custom React hooks
│   └── ...
│
├── backend/           # Java HTTP backend server
│   ├── src/           # Java source files (.java)
│   │   ├── BackendServer.java    # Main server entry point
│   │   ├── *DAO.java             # Data Access Objects
│   │   └── *.java                # Model classes
│   └── lib/
│       └── mysql-connector-j-9.7.0.jar
│
└── database/          # MySQL database files
    ├── schema.sql      # Table definitions with constraints
    └── sample_data.sql # Sample seed data
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Java JDK 17+
- MySQL 8.0+
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

---

### Step 1: Database Setup

Open **MySQL Workbench** and run:

```sql
source database/schema.sql
source database/sample_data.sql
```

---

### Step 2: Backend Setup

```bash
# Compile (from project root)
javac -cp "backend/lib/mysql-connector-j-9.7.0.jar" -d backend/bin backend/src/*.java

# Run
java -cp "backend/bin;backend/lib/mysql-connector-j-9.7.0.jar" BackendServer
```

Backend will start on `http://localhost:8080`

> Update `backend/src/DatabaseConnection.java` with your MySQL username and password before compiling.

---

### Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your GEMINI_API_KEY in .env

# Start development server
npm run dev
```

Frontend will start on `http://localhost:9002`

---

## Database Schema

```
Users ----------- Items --- Categories
                   |    +-- Locations
                   |
            +------+------+
          Claims        Matches
            |
         Claimant (-> Users)

Notifications --- Users
```

**7 Tables**: `Users`, `Categories`, `Locations`, `Items`, `Matches`, `Claims`, `Notifications`

---

## Default Login Credentials

After running `sample_data.sql`:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@relicsync.edu` | `admin123` |
| Student | `ali.hassan@student.edu` | `student123` |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/login` | Authenticate user |
| `POST` | `/api/register` | Register new user |
| `GET` | `/api/items` | Fetch all items |
| `POST` | `/api/items` | Report new item |
| `GET` | `/api/claims` | Fetch all claims |
| `POST` | `/api/claims` | Submit a claim |
| `POST` | `/api/claims/status` | Update claim status |
| `GET` | `/api/matches` | Fetch all matches |
| `POST` | `/api/matches` | Create a match |
| `GET` | `/api/categories` | Fetch categories |
| `GET` | `/api/locations` | Fetch locations |
| `GET` | `/api/notifications` | Fetch notifications |

---

## Author

Built by **HAROON987** | University Database Systems Project

---

<div align="center">
RelicSync &copy; 2026
</div>
